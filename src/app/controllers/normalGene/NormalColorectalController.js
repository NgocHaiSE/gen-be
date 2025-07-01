const normalColorectalGeneModel = require('../../models/normalGene/NormalColorectalGeneModel');

class normalColorectalGeneController {
    //GET
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        normalColorectalGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            normalColorectalGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, normalColorectalGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        normalColorectalGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new normalColorectalGeneController();
