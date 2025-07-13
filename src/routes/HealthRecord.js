const express = require('express');
const router = express.Router();
const BreastRecordController = require('../app/controllers/healthRecord/BreastRecordController');
const ColorectalRecordController = require('../app/controllers/healthRecord/ColorectalRecordController');
const LiverRecordController = require('../app/controllers/healthRecord/LiverRecordController');
const LungRecordController = require('../app/controllers/healthRecord/LungRecordController');
const ThyroidRecordController = require('../app/controllers/healthRecord/ThyroidRecordController');
router.use(express.json());
router.post('/lung-record/save', LungRecordController.save);
router.post('/lung-record/get-health-record', LungRecordController.getById);
router.post('/lung-record/delete-health-record', LungRecordController.deleteById);
router.get('/lung-record/get-all', LungRecordController.getAll);
router.post('/lung-record/search', LungRecordController.search);
router.post('/lung-record/get-by-testcase', LungRecordController.getByIdentID);

router.post('/breast-record/save', BreastRecordController.save);
router.post('/breast-record/get-health-record', BreastRecordController.getById);
router.post('/breast-record/delete-health-record', BreastRecordController.deleteById);
router.get('/breast-record/get-all', BreastRecordController.getAll);
router.post('/breast-record/search', BreastRecordController.search);
// router.post('/breast-record/get-by-testcase', BreastRecordController.getByIdentID);


router.post('/colorectal-record/save', ColorectalRecordController.save);
router.post('/colorectal-record/get-health-record', ColorectalRecordController.getById);
router.post('/colorectal-record/delete-health-record', ColorectalRecordController.deleteById);
router.get('/colorectal-record/get-all', ColorectalRecordController.getAll);
router.post('/colorectal-record/search', ColorectalRecordController.search);
router.post('/colorectal-record/get-by-testcase', ColorectalRecordController.getByIdentID);


router.post('/liver-record/save', LiverRecordController.save);
router.post('/liver-record/get-health-record', LiverRecordController.getById);
router.post('/liver-record/delete-health-record', LiverRecordController.deleteById);
router.get('/liver-record/get-all', LiverRecordController.getAll);
router.post('/liver-record/search', LiverRecordController.search);
// router.post('/liver-record/get-by-testcase', LiverRecordController.getByIdentID);


router.post('/thyroid-record/save', ThyroidRecordController.save);
router.post('/thyroid-record/get-health-record', ThyroidRecordController.getById);
router.post('/thyroid-record/delete-health-record', ThyroidRecordController.deleteById);
router.get('/thyroid-record/get-all', ThyroidRecordController.getAll);
router.post('/thyroid-record/search', ThyroidRecordController.search);
// router.post('/thyroid-record/get-by-testcase', ThyroidRecordController.getByIdentID);


module.exports = router;
