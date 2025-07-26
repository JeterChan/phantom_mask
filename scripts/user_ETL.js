const fs = require('fs');
const path = require('path');
const { User, Mask, Pharmacy, PurchaseHistory,PharmacyMask,sequelize } = require('../models');

async function users_ETL() {
    try {
        const rawData = fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8');
        const users = JSON.parse(rawData);

        // 建立 map
        const pharmacyMap = new Map();
        const maskMap = new Map();
        const pharmacyMaskPriceMap = new Map(); // cache pharmacy-mask price


        await sequelize.transaction(async (t) => {
            for (const userData of users) {
                // 1. Create User
                const user = await User.create(
                    {
                        name:userData.name,
                        cashBalance: userData.cashBalance
                    },
                    { transaction: t }
                );

                // 處理購買紀錄
                for (const ph of userData.purchaseHistories) {
                    // get pharmacyId
                    let pharmacyInstance;
                    if(pharmacyMap.has(ph.pharmacyName)) {
                        pharmacyInstance = pharmacyMap.get(ph.pharmacyName);
                    } else {
                        pharmacyInstance = await Pharmacy.findOne({
                            where: { name: ph.pharmacyName },
                            transaction: t
                        });

                        if(!pharmacyInstance) {
                            throw new Error(`Pharmacy ${ph.pharmacyName} not found`);
                        }
                        pharmacyMap.set(ph.pharmacyName, pharmacyInstance);
                    }

                    // 取得 maskId
                    let maskInstance;
                    if(maskMap.has(ph.maskName)) {
                        maskInstance = maskMap.get(ph.maskName);
                    } else {
                        maskInstance = await Mask.findOne({
                            where: { name: ph.maskName },
                            transaction: t
                        });
                        if(!maskInstance) {
                            throw new Error(`Mask ${ph.maskName} not found`);
                        }
                        maskMap.set(ph.maskName, maskInstance);
                    }

                    // 查詢 pharmacy-mask price
                    const key = `${pharmacyInstance.id}-${maskInstance.id}`;
                    let price;
                    if (pharmacyMaskPriceMap.has(key)) {
                        price = pharmacyMaskPriceMap.get(key);
                    } else {
                        const pharmacyMask = await PharmacyMask.findOne({
                            where: {
                                pharmacyId: pharmacyInstance.id,
                                maskId: maskInstance.id
                            },
                            transaction: t
                        });
                        if (!pharmacyMask) throw new Error(`PharmacyMask not found for pharmacyId ${pharmacyInstance.id} maskId ${maskInstance.id}`);
                        price = pharmacyMask.price;
                        pharmacyMaskPriceMap.set(key, price);
                    }

                    // 計算購買數量
                    const quantity = Math.round(ph.transactionAmount / price);

                    // Create PurchaseHistory
                    await PurchaseHistory.create(
                        {
                            userId: user.id,
                            pharmacyId: pharmacyInstance.id,
                            maskId: maskInstance.id,
                            transactionAmount: ph.transactionAmount,
                            transactionDate: ph.transactionDate,
                            quantity: quantity
                        },
                        { transaction: t }
                    );
                }
            }
        });

        console.log('ETL completed! Data imported successfully.');    
    } catch (err) {
        console.error('ETL failed:', err);
    } finally {
        await sequelize.close();
    }
}

users_ETL();
