const mutationColorectalGeneModel = require('../../models/mutationGene/MutationColorectalGeneModel');
const top20ColorectalModel = require('../../models/top20Gene/Top20ColorectalModel');

class mutationColorectalGeneController {
    //GET
    findAllTop20(req, res) {
        top20ColorectalModel.find({}, function (err, top20ColorectalModel) {
            if (!err) {
                res.json(top20ColorectalModel);
            } else {
                res.status(500).json({ error: 'Error!!!' });
            }
        });
    }

    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        mutationColorectalGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            mutationColorectalGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, mutationColorectalGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        mutationColorectalGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new mutationColorectalGeneController();
