// src/app/controllers/FileController.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');

class FileController {
    constructor() {
        this.dataDirectory = path.join(__dirname, 'data/dataInput/');
        this.ensureDirectoryExists();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.dataDirectory)) {
            fs.mkdirSync(this.dataDirectory, { recursive: true });
        }
    }

    // GET /file/get - Lấy danh sách file cho AI server
    getFileList = (req, res) => {
        try {
            fs.readdir(this.dataDirectory, (err, files) => {
                if (err) {
                    console.error('Error reading directory:', err);
                    return res.status(500).json({ 
                        error: 'Error reading directory',
                        files: []
                    });
                }

                // Lọc chỉ lấy file .gz
                const gzFiles = files.filter(file => 
                    file.endsWith('.gz') && fs.statSync(path.join(this.dataDirectory, file)).isFile()
                );

                // Trả về danh sách file không bao gồm extension .gz để match với logic AI
                const fileNames = gzFiles.map(file => path.parse(file).name);

                res.json({
                    success: true,
                    files: fileNames,
                    count: fileNames.length
                });
            });
        } catch (error) {
            console.error('Error in getFileList:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                files: []
            });
        }
    };

    // DELETE /file/delete/:fileName - Xóa file sau khi AI xử lý xong
    deleteFile = (req, res) => {
        try {
            const fileName = req.params.fileName;
            
            if (!fileName) {
                return res.status(400).json({
                    success: false,
                    message: 'File name is required'
                });
            }

            // Thêm extension .gz nếu chưa có
            const fileNameWithExt = fileName.endsWith('.gz') ? fileName : `${fileName}.gz`;
            const filePath = path.join(this.dataDirectory, fileNameWithExt);

            // Kiểm tra file có tồn tại không
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: `File ${fileName} not found`
                });
            }

            // Xóa file
            fs.unlinkSync(filePath);
            
            console.log(`File ${fileName} deleted successfully`);
            
            res.json({
                success: true,
                message: `File ${fileName} deleted successfully`
            });

        } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting file',
                error: error.message
            });
        }
    };

    // GET /file/info/:fileName - Lấy thông tin file
    getFileInfo = (req, res) => {
        try {
            const fileName = req.params.fileName;
            const fileNameWithExt = fileName.endsWith('.gz') ? fileName : `${fileName}.gz`;
            const filePath = path.join(this.dataDirectory, fileNameWithExt);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }

            const stats = fs.statSync(filePath);
            
            res.json({
                success: true,
                data: {
                    fileName: fileName,
                    fullPath: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    isFile: stats.isFile()
                }
            });

        } catch (error) {
            console.error('Error getting file info:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting file info',
                error: error.message
            });
        }
    };

    // POST /file/upload - Upload file từ AI server hoặc client
    uploadFile = (req, res) => {
        const storage = multer.diskStorage({
            destination: this.dataDirectory,
            filename: (req, file, cb) => {
                // Sử dụng tên file gốc hoặc patientID nếu có
                const patientID = req.body.patientID;
                const originalName = file.originalname;
                
                if (patientID) {
                    const fileExtension = path.extname(originalName);
                    cb(null, `${patientID}${fileExtension}`);
                } else {
                    cb(null, originalName);
                }
            },
        });

        const upload = multer({
            storage,
            fileFilter: (req, file, cb) => {
                // Chấp nhận các định dạng file mà AI server hỗ trợ
                const allowedExtensions = [
                    '.gz', '.bam', '.vcf', '.fastq', '.sam'
                ];
                const fileExtension = path.extname(file.originalname).toLowerCase();
                
                if (allowedExtensions.includes(fileExtension)) {
                    cb(null, true);
                } else {
                    cb(new Error(`File format ${fileExtension} not supported`), false);
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024 * 1024 // 5GB limit
            },
        }).single('file');

        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.log('Multer Error:', err);
                return res.status(400).json({
                    success: false,
                    message: 'Upload error: ' + err.message,
                });
            } else if (err) {
                console.log('Upload Error:', err);
                return res.status(400).json({
                    success: false,
                    message: 'Upload error: ' + err.message,
                });
            } else if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
            }

            res.json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    size: req.file.size,
                    path: req.file.path
                }
            });
        });
    };

    // GET /file/download/:fileName - Download file (đã có trong DownloadController)
    downloadFile = (req, res) => {
        try {
            const fileName = req.params.fileName;
            const fileNameWithExt = fileName.endsWith('.gz') ? fileName : `${fileName}.gz`;
            const filePath = path.join(this.dataDirectory, fileNameWithExt);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }

            res.download(filePath, fileNameWithExt, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).json({
                        success: false,
                        message: 'Error downloading file'
                    });
                }
            });

        } catch (error) {
            console.error('Error in downloadFile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // POST /file/move - Di chuyển file giữa các thư mục
    moveFile = (req, res) => {
        try {
            const { fileName, fromDir, toDir } = req.body;

            if (!fileName || !fromDir || !toDir) {
                return res.status(400).json({
                    success: false,
                    message: 'fileName, fromDir, and toDir are required'
                });
            }

            const fromPath = path.join(__dirname, `../../../${fromDir}`, fileName);
            const toPath = path.join(__dirname, `../../../${toDir}`, fileName);

            // Đảm bảo thư mục đích tồn tại
            const toDirPath = path.dirname(toPath);
            if (!fs.existsSync(toDirPath)) {
                fs.mkdirSync(toDirPath, { recursive: true });
            }

            if (!fs.existsSync(fromPath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Source file not found'
                });
            }

            // Di chuyển file
            fs.renameSync(fromPath, toPath);

            res.json({
                success: true,
                message: `File moved from ${fromDir} to ${toDir}`,
                data: {
                    fileName,
                    fromPath: fromDir,
                    toPath: toDir
                }
            });

        } catch (error) {
            console.error('Error moving file:', error);
            res.status(500).json({
                success: false,
                message: 'Error moving file',
                error: error.message
            });
        }
    };

    // GET /file/status - Kiểm tra trạng thái file system
    getSystemStatus = (req, res) => {
        try {
            const stats = fs.statSync(this.dataDirectory);
            
            // Đếm số file trong thư mục
            const files = fs.readdirSync(this.dataDirectory);
            const fileCount = files.filter(file => 
                fs.statSync(path.join(this.dataDirectory, file)).isFile()
            ).length;

            res.json({
                success: true,
                data: {
                    dataDirectory: this.dataDirectory,
                    directoryExists: fs.existsSync(this.dataDirectory),
                    fileCount: fileCount,
                    lastModified: stats.mtime,
                    permissions: {
                        readable: fs.constants.R_OK,
                        writable: fs.constants.W_OK
                    }
                }
            });

        } catch (error) {
            console.error('Error getting system status:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting system status',
                error: error.message
            });
        }
    };
}

module.exports = new FileController();