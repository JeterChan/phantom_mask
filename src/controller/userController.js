const { User, PurchaseHistory } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

const getTopUsersByTransactions = async (req, res) => {
    try {
        // 接受 startDate 和 endDate 的查詢參數, limit 作為要篩選前幾名 users
        const limit = parseInt(req.query.limit, 10);
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        if(!startDate || !endDate || isNaN(limit)) {
            return res.status(400).json({ success: false, error: 'Invalid parameters' });
        }

        const users = await User.findAll({
            attributes: [
                'id', 'name', [fn('SUM', col('PurchaseHistories.transactionAmount')), 'totalTransaction']
            ],
            include: [{
                model: PurchaseHistory,
                attributes: [],
                where: {
                    transactionDate: {
                        [Op.gte]: new Date(startDate),
                        [Op.lte]: new Date(endDate)
                    }
                }
            }],
            group: ['User.id'],
            order: [[literal('totalTransaction'), 'DESC']],
            limit: limit,
            subQuery: false
        })

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getTopUsersByTransactions
};