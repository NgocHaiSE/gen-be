const mutationModel = require('../models/MutationModel');

class mutationController {
    //GET
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        mutationModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            mutationModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, mutationModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        mutationModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }

    findByID(req, res, next) {
        testCaseModel.findById(req.params.id, (err, item) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else if (!item) {
                res.status(404).send('Item not found');
            } else {
                res.send(item);
            }
        });
    }
}

module.exports = new mutationController();
