const mutationThyroidGeneModel = require('../../models/mutationGene/MutationThyroidGeneModel');
const top20ThyroidModel = require('../../models/top20Gene/Top20ThyroidModel');

class mutationThyroidGeneController {
    //GET
    findAllTop20(req, res) {
        top20ThyroidModel.find({}, function (err, top20ThyroidModel) {
            if (!err) {
                res.json(top20ThyroidModel);
            } else {
                res.status(500).json({ error: 'Error!!!' });
            }
        });
    }

    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        mutationThyroidGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            mutationThyroidGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, mutationThyroidGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        mutationThyroidGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new mutationThyroidGeneController();
