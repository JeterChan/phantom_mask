const { Op, fn, col, literal } = require('sequelize');
const { Pharmacy, PharmacyMask, Mask, PharmacyOpeningHour } = require('../../models');

// 支援的 weekday 清單
const VALID_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getTodayWeekday = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
}

const listOpenPharmacies = async (req, res) => {
    try {
    const { time, weekday } = req.query;

    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({
        error: 'Invalid or missing `time` (must be HH:mm format)',
        meta: { required: ['time'], optional: ['weekday'] }
      });
    }
    let queryWeekday = weekday || getTodayWeekday();
    if (weekday && !VALID_WEEKDAYS.includes(weekday)) {
      return res.status(400).json({
        error: 'Invalid `weekday` (must be one of: Mon, Tue, Wed, Thu, Fri, Sat, Sun)',
        meta: { validWeekdays: VALID_WEEKDAYS }
      });
    }

    const openHours = await PharmacyOpeningHour.findAll({
      where: {
        weekday: queryWeekday,
        startTime: { [Op.lte]: time },
        endTime: { [Op.gt]: time }
      },
      attributes: ['pharmacyId'],
      group: ['pharmacyId']
    });

    const pharmacyIds = openHours.map(h => h.pharmacyId);

    if (!pharmacyIds.length) {
      return res.status(200).json({
        meta: {
          query: { time, weekday: queryWeekday },
          count: 0,
          message: 'No pharmacies are open at the requested time and day.'
        },
        data: []
      });
    }

    const pharmacies = await Pharmacy.findAll({
      where: { id: pharmacyIds }
    });

    return res.status(200).json({
      meta: {
        query: { time, weekday: queryWeekday },
        count: pharmacies.length
      },
      data: pharmacies
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Internal server error. Please contact support if the issue persists.',
      meta: { endpoint: '/api/pharmacies/open' }
    });
  }
};

const getMasksByPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    // 口罩排序, 預設為 name
    let { sortBy } = req.query || 'name';

    const pharmacy = await Pharmacy.findByPk(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found.',
        meta: { pharmacyId }
      });
    }

    const maskRecords = await PharmacyMask.findAll({
      where: { pharmacyId },
      include: [{ model: Mask, attributes: ['id', 'name'] }],
      order: [
        sortBy === 'price'
          ? ['price', 'ASC']
          : [Mask, 'name', 'ASC'] // 用 join 查詢, 以關聯的欄位做排序
      ]
    });

    const result = maskRecords.map(rec => ({
      maskId: rec.Mask.id,
      name: rec.Mask.name,
      price: rec.price
    }));

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Internal server error. Please contact support if the issue persists.',
      meta: { endpoint: '/api/v1/pharmacies/:pharmacyId/masks' }
    });
  }
}

const filterPharmaciesByMask = async (req, res) => {
  // 接受 parameters: minPrice, maxPrice, count, mode
  // 參數處理
  const minPrice = parseFloat(req.query.minPrice);
  const maxPrice = parseFloat(req.query.maxPrice);
  const count = parseInt(req.query.count, 10);
  const mode = req.query.mode; // 'more' or 'fewer'

  if (
      isNaN(minPrice) ||
      isNaN(maxPrice) ||
      isNaN(count) ||
      (mode !== 'more' && mode !== 'fewer')
  ) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
  }

  // 查詢
  try {
      const pharmacies = await Pharmacy.findAll({
          attributes: [
              'id', 'name', 'cashBalance', 'openingHours',
              // 這裡用 COUNT 聚合 pharmacy 下，符合價格區間的 mask 數
              [fn('COUNT', col('PharmacyMasks.id')), 'maskCount']
          ],
          include: [
              {
                  model: PharmacyMask,
                  as: 'PharmacyMasks',
                  attributes: [],
                  required: false, // 藥局就算沒口罩也會出現（如果只想要有口罩的設 true）
                  where: {
                      price: { [Op.gte]: minPrice, [Op.lte]: maxPrice }
                  }
              }
          ],
          group: ['Pharmacy.id'],
          // having 實作 more/fewer
          having: literal(
              mode === 'more'
              ? `COUNT(PharmacyMasks.id) >= ${count}`
              : `COUNT(PharmacyMasks.id) <= ${count}`
          ),
          order: [['id', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: pharmacies
      });
      
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

module.exports = {
  listOpenPharmacies,
  getMasksByPharmacy,
  filterPharmaciesByMask
};