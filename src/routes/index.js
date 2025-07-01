const normalLungRouter = require('./normalGene/normalLungGene');
const normalBreastRouter = require('./normalGene/normalBreastGene');
const normalColorectalRouter = require('./normalGene/normalColorectalGene');
const normalLiverRouter = require('./normalGene/normalLiverGene');
const normalThyroidRouter = require('./normalGene/normalThyroidGene');

const mutationLungRouter = require('./mutationGene/mutationLungGene');
const mutationBreastRouter = require('./mutationGene/mutationBreastGene');
const mutationColorectalRouter = require('./mutationGene/mutationColorectalGene');
const mutationLiverRouter = require('./mutationGene/mutationLiverGene');
const mutationThyroidRouter = require('./mutationGene/mutationThyroidGene');

const drugInformationRouter = require('./DrugInformation');
const testCaseRouter = require('./TestCase');
const mutationRouter = require('./Mutation');
const geneRouter = require('./Gene');
const userRouter = require('./User');
const healthRecordRouter = require('./HealthRecord');

const downloadRouter = require('./Download');
const uploadFileRouter = require('./UploadFile');
const articleRouter = require('./Article');

function routes(app) {
    app.use('/normal-lung-gene', normalLungRouter);
    app.use('/normal-breast-gene', normalBreastRouter);
    app.use('/normal-colorectal-gene', normalColorectalRouter);
    app.use('/normal-liver-gene', normalLiverRouter);
    app.use('/normal-thyroid-gene', normalThyroidRouter);

    app.use('/mutation-lung-gene', mutationLungRouter);
    app.use('/mutation-breast-gene', mutationBreastRouter);
    app.use('/mutation-colorectal-gene', mutationColorectalRouter);
    app.use('/mutation-liver-gene', mutationLiverRouter);
    app.use('/mutation-thyroid-gene', mutationThyroidRouter);

    app.use('/drugs-information', drugInformationRouter);
    app.use('/test-case', testCaseRouter);
    app.use('/mutation', mutationRouter);
    app.use('/gene', geneRouter);
    app.use('/user', userRouter);
    app.use('/upload', uploadFileRouter);

    app.use('/download', downloadRouter);
    app.use('/', healthRecordRouter);
    app.use('/article', articleRouter);

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
}

module.exports = routes;
