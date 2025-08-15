// src/routes/File.js
const express = require('express');
const router = express.Router();
const FileController = require('../app/controllers/FileController');

// Middleware
router.use(express.json());

// GET /file/get - Lấy danh sách file (AI server sử dụng)
router.get('/get', FileController.getFileList);

// DELETE /file/delete/:fileName - Xóa file (AI server sử dụng)
router.delete('/delete/:fileName', FileController.deleteFile);

// GET /file/info/:fileName - Lấy thông tin file
router.get('/info/:fileName', FileController.getFileInfo);

// POST /file/upload - Upload file
router.post('/upload', FileController.uploadFile);

// GET /file/download/:fileName - Download file
router.get('/download/:fileName', FileController.downloadFile);

// POST /file/move - Di chuyển file
router.post('/move', FileController.moveFile);

// GET /file/status - Kiểm tra trạng thái file system
router.get('/status', FileController.getSystemStatus);

module.exports = router;