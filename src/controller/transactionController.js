const { PurchaseHistory } = require('../../models');
const { Op, fn, col } = require('sequelize');

const getTransactionSummary = async (req, res) => {
    // parameters -> startDate, endDate
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, error: 'Invalid parameters' });
        }

        // 改寫 endDate 為當天的23:59
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        const result = await PurchaseHistory.findOne({
            attributes: [
                [fn('SUM', col('quantity')), 'totalMasks'],
                [fn('SUM', col('transactionAmount')), 'totalTransactionAmount']
            ],
            where: {
                transactionDate: {
                    [Op.gte] : new Date(startDate),
                    [Op.lte] : endDateTime
                }
            },
            raw: true
        });

        return res.json({
            success: true,
            data: {
                totalMasks: result.totalMasks || 0,
                totalTransactionAmount: result.totalTransactionAmount || 0
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

module.exports = {
    getTransactionSummary
};