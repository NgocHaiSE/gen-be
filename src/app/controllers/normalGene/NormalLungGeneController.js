const normalLungGeneModel = require('../../models/normalGene/NormalLungGeneModel');

class normalLungGeneController {
    //GET
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        normalLungGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            normalLungGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, normalLungGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        normalLungGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new normalLungGeneController();
