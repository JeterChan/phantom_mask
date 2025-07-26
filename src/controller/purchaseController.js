const { PurchaseHistory, sequelize } = require('../../models');

const purchaseMask = async (req, res) => {
    try {
        // 接受 userId, pharmacyId, maskId, quantity
        const { userId, pharmacyId, maskId, quantity, price } = req.body;

        // 驗證參數
        if(!userId || !pharmacyId || !maskId || !quantity || !price) {
            return res.status(400).json({ success:false, message: 'Missing required fields' });
        }

        // 儲存購買紀錄, 總價
        let record, total;

        // transaction 開始
        await sequelize.transaction(async (t) => {
            // 計算總金額
            total = Number(price) * Number(quantity);

            // 建立購買紀錄
            record = await PurchaseHistory.create({
                userId,
                pharmacyId,
                maskId,
                quantity,
                transactionAmount: total,
                transactionDate: new Date()
            }, { transaction: t });
        });
        
        // 如果成功, return 成功訊息
        return res.status(201).json({
            success: true,
            data: {
                purchaseId: record.id,
                userId: record.userId,
                pharmacyId: record.pharmacyId,
                maskId: record.maskId,
                quantity: record.quantity,
                price: Number(price),
                total: total,
                transactionDate: record.transactionDate
            }
        });
    } catch (error) {
        console.error('Error in purchaseMask:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    purchaseMask
};