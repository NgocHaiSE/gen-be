const geneModel = require('../models/GeneModel');

class geneController {
    //GET
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        geneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            geneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, geneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        geneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new geneController();
