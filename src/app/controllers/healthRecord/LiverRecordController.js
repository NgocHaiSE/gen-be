const LiverRecordModel = require('../../models/healthRecord/LiverRecordModel');
const authenticateToken = require('../sharedFunction/authentication');

class LiverRecordController {
    save = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const canAccess = await authenticateToken(authHeader);
            if (canAccess == 1) {
                let newHealthRecord = await LiverRecordModel.findById(
                    req.body?._id,
                );
                // console.log(newHealthRecord)
                if (!newHealthRecord) {
                    console.log('no record');
                    newHealthRecord = new LiverRecordModel();
                }
                newHealthRecord.healthRecordId = req.body.healthRecordId;
                newHealthRecord.generalInfo = req.body.generalInfo;
                newHealthRecord.clinicalSymptoms = req.body.clinicalSymptoms;
                newHealthRecord.responeToTreatment =
                    req.body.responeToTreatment;
                newHealthRecord.genTest = req.body.genTest;
                newHealthRecord.genTestResponseTreatment =
                    req.body.genTestResponseTreatment;
                newHealthRecord.assessmentResponseTreatment =
                    req.body.assessmentResponseTreatment;
                newHealthRecord.otherInfo = req.body.otherInfo;
                newHealthRecord.patientInfo = req.body.patientInfo;
                newHealthRecord.genTestInfo = req.body.genTestInfo;
                newHealthRecord.typeHealthRecord = req.body?.typeHealthRecord;

                const data = await newHealthRecord.save();
                return res.status(200).json({
                    success: true,
                    data: '',
                    errorCode: '1001',
                    message: 'Lưu bệnh án thành công!',
                    showType: 2,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    data: {},
                    errorCode: '1002',
                    message: 'Không có quyền truy cập',
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    getById = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const canAccess = await authenticateToken(authHeader);
            if (canAccess == 1) {
                const record = await LiverRecordModel.findById(req.body.id);
                console.log(req.body.id);
                return res.status(200).json({
                    success: true,
                    data: record,
                    errorCode: '1001',
                    errorMessage: 'error message',
                    showType: 2,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    data: {},
                    errorCode: '1002',
                    message: 'Không có quyền truy cập',
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                success: false,
                data: {},
                errorCode: '1001',
                message: 'Không tìm thấy bệnh án',
                showType: 2,
            });
        }
    };
    deleteById = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const canAccess = await authenticateToken(authHeader);
            if (canAccess == 1) {
                console.log('delete ', req.body.id);
                await LiverRecordModel.deleteOne({ _id: req.body.id });
                return res
                    .status(200)
                    .json({ success: true, message: 'Xóa bệnh án thành công' });
            } else {
                return res.status(500).json({
                    success: false,
                    data: {},
                    errorCode: '1002',
                    message: 'Không có quyền truy cập',
                });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(404)
                .json({
                    success: false,
                    message: 'Có lỗi xảy ra, vui lòng thử lại',
                    showType: 2,
                });
        }
    };
    getAll = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const canAccess = await authenticateToken(authHeader);
            if (canAccess == 1) {
                const records = (
                    await LiverRecordModel.find({}).select(
                        'patientInfo typeHealthRecord healthRecordId',
                    )
                ).map((record) => {
                    return {
                        fullname: record.patientInfo.fullname,
                        dob: record.patientInfo.dob,
                        typeHealthRecord: record.typeHealthRecord,
                        id: record._id,
                        healthRecordId: record.healthRecordId,
                    };
                });
                return res.status(200).json({
                    success: true,
                    data: records,
                    errorCode: '1001',
                    errorMessage: 'error message',
                    showType: 2,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    data: {},
                    errorCode: '1002',
                    message: 'Không có quyền truy cập',
                });
            }
        } catch (error) {}
    };
    search = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const canAccess = await authenticateToken(authHeader);
            if (canAccess == 1) {
                let { healthRecordId, typeHealthRecord } = req.body;
                healthRecordId = req.body?.healthRecordId || '.*';
                if (typeHealthRecord === 'ALL') typeHealthRecord = '.*';
                console.log(healthRecordId, typeHealthRecord);
                let record = (
                    await LiverRecordModel.find({
                        typeHealthRecord: new RegExp(typeHealthRecord),
                        healthRecordId: new RegExp(healthRecordId),
                    }).select('patientInfo typeHealthRecord healthRecordId')
                ).map((record) => {
                    return {
                        fullname: record.patientInfo.fullname,
                        dob: record.patientInfo.dob,
                        typeHealthRecord: record.typeHealthRecord,
                        id: record._id,
                        healthRecordId: record.healthRecordId,
                    };
                });
                return res.status(200).json({
                    success: true,
                    data: record,
                    errorCode: '1001',
                    errorMessage: 'error message',
                    showType: 2,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    data: {},
                    errorCode: '1002',
                    message: 'Không có quyền truy cập',
                });
            }
        } catch (error) {
            console.error(error);
        }
    };
}

module.exports = new LiverRecordController();
