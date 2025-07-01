const normalBreastGeneModel = require('../../models/normalGene/NormalBreastGeneModel');

class normalBreastGeneController {
    //GET
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        normalBreastGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            normalBreastGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, normalBreastGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        normalBreastGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new normalBreastGeneController();
