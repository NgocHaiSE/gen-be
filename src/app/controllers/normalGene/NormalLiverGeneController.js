const normalLiverGeneModel = require('../../models/normalGene/NormalLiverGeneModel');

class normalLiverGeneControllor {
    //GET
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        normalLiverGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            normalLiverGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, normalLiverGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        normalLiverGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new normalLiverGeneControllor();
