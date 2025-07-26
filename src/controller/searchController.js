const { Pharmacy, Mask, Sequelize } = require('../../models');
const { Op, literal } = require('sequelize');


const search = async (req, res) => {
    try {
        // 接受查詢 q , type(要查詢的對象) parameter
        const { q, type } = req.query;

        if(!q || !type || !['pharmacy', 'mask'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid query parameters' });
        }

        let model, nameField = 'name';
        if(type === 'pharmacy') {
            model = Pharmacy;
        } else {
            model = Mask;
        }

        // 建立 relevance sort, 完全符合 -> 開頭符合 -> 部分符合 -> 其他
        const results = await model.findAll({
            attributes: {
                include: [
                    [Sequelize.literal(`
                        CASE
                            WHEN ${nameField} = '${q}' THEN 3
                            WHEN ${nameField} LIKE '${q}%' THEN 2
                            WHEN ${nameField} LIKE '%${q}%' THEN 1
                            ELSE 0
                        END
                    `), 'relevance']
                ]
            },
            where: {
                name: {
                    [Op.like]: `%${q}%`
                }
            },
            order: [[literal('relevance'),'DESC'], ['name', 'ASC']],
            limit: 20
        });

        return res.status(200).json({
            success: true,
            data: results
        })
    } catch (error) {
        console.error('Error in search controller:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    search
}