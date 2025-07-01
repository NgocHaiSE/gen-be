const mutationLiverGeneModel = require('../../models/mutationGene/MutationLiverGeneModel');
const top20LiverModel = require('../../models/top20Gene/Top20LiverModel');

class mutationLiverGeneController {
    //GET
    findAllTop20(req, res) {
        top20LiverModel.find({}, function (err, top20LiverModel) {
            if (!err) {
                res.json(top20LiverModel);
            } else {
                res.status(500).json({ error: 'Error!!!' });
            }
        });
    }

    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        mutationLiverGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            mutationLiverGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, mutationLiverGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        mutationLiverGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new mutationLiverGeneController();
