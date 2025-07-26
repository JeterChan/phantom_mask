const fs = require('fs');
const path = require('path');
const { Pharmacy, Mask, PharmacyMask, PharmacyOpeningHour, sequelize } = require('../models');

const WEEKDAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function expandDays(dayStr) {
  if (dayStr.includes('-')) {
    const [start, end] = dayStr.split('-').map(s => s.trim());
    const startIdx = WEEKDAY_ORDER.indexOf(start);
    const endIdx = WEEKDAY_ORDER.indexOf(end);
    // 只處理合法區間
    if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
      return WEEKDAY_ORDER.slice(startIdx, endIdx + 1);
    }
    return [];
  }
  return [dayStr.trim()];
}

function openingHoursParser(openingHoursStr) {
  const result = [];
  if (!openingHoursStr) return result;

  // 多段用 "/" 分隔
  const parts = openingHoursStr.split('/').map(p => p.trim());
  for (const part of parts) {
    // 解析格式 e.g. "Mon - Fri 08:00 - 17:00"、"Mon, Wed, Fri 08:00 - 12:00"
    const match = part.match(/^(.+?)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
    if (match) {
      let daysStr = match[1];
      const start = match[2];
      const end = match[3];
      const dayList = daysStr.split(',').map(d => d.trim()).flatMap(expandDays);
      for (const day of dayList) {
        result.push({ weekday: day, startTime: start, endTime: end });
      }
    }
  }
  return result;
}

async function pharmacies_ETL() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../data/pharmacies.json'), 'utf-8');
    const pharmacies = JSON.parse(rawData);

    const maskMap = new Map();

    await sequelize.transaction(async (t) => {
      for (const pharmacyData of pharmacies) {
        // 1. Create Pharmacy
        const pharmacy = await Pharmacy.create({
          name: pharmacyData.name,
          cashBalance: pharmacyData.cashBalance,
          openingHours: pharmacyData.openingHours,
        }, { transaction: t });

        // 新增：標準化並寫入營業時段
        const openingHoursArr = openingHoursParser(pharmacyData.openingHours);
        for (const oh of openingHoursArr) {
          await PharmacyOpeningHour.create({
            pharmacyId: pharmacy.id,
            weekday: oh.weekday,
            startTime: oh.startTime,
            endTime: oh.endTime
          }, { transaction: t });
        }

        // 2. Process masks for this pharmacy
        for (const mask of pharmacyData.masks) {
          let maskInstance;
          if (maskMap.has(mask.name)) {
            maskInstance = maskMap.get(mask.name);
          } else {
            const [foundMask, created] = await Mask.findOrCreate({
              where: { name: mask.name },
              defaults: { name: mask.name },
              transaction: t
            });
            maskInstance = foundMask;
            maskMap.set(mask.name, maskInstance);
          }

          // 3. Create mapping with price
          await PharmacyMask.create({
            pharmacyId: pharmacy.id,
            maskId: maskInstance.id,
            price: mask.price
          }, { transaction: t });
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

pharmacies_ETL();
