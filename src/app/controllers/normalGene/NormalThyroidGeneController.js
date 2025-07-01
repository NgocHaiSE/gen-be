const normalThyroidGeneModel = require('../../models/normalGene/NormalThyroidGeneModel');

class normalThyroidGeneController {
    //GET
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        normalThyroidGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            normalThyroidGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, normalThyroidGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        normalThyroidGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new normalThyroidGeneController();
