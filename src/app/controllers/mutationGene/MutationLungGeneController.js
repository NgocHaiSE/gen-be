const mutationLungGeneModel = require('../../models/mutationGene/MutationLungGeneModel');
const top20LungModel = require('../../models/top20Gene/Top20LungModel');

class mutationLungGeneController {
    //GET
    findAllTop20(req, res) {
        top20LungModel.find({}, function (err, top20LungModel) {
            if (!err) {
                res.json(top20LungModel);
            } else {
                res.status(500).json({ error: 'Error!!!' });
            }
        });
    }

    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        mutationLungGeneModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            mutationLungGeneModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, mutationLungGeneModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        mutationLungGeneModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }
}

module.exports = new mutationLungGeneController();
