const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const multer = require('multer');
const path = require('path');

class uploadFile {
    uploadFile(req, res) {
        const dataDirectory = path.join(__dirname, '/data/dataInput');
        const storage = multer.diskStorage({
            destination: dataDirectory,
            filename: (req, file, cb) => {
                // Use patientID as the filename with the original extension
                const patientID = req.body.patientID || 'unknown'; // Fallback to 'unknown' if patientID is missing
                const originalName = file.originalname;
                const fileExtension = path.extname(originalName).toLowerCase();
                cb(null, `${patientID}${fileExtension}`);
            },
        });
        const upload = multer({
            storage,
            fileFilter: (req, file, cb) => {
                const allowedExtensions = [
                    '.csv', '.gz', '.tar', '.tgz', '.bam', '.sam', 
                    '.vcf', '.fastq', '.rar', '.zip', '.docx', '.xlsx', '.pdf'
                ];
                const fileExtension = path.extname(file.originalname).toLowerCase();
                if (allowedExtensions.includes(fileExtension)) {
                    cb(null, true);
                } else {
                    cb(new Error('File format not supported'), false);
                }
            },
            limits: {
                fileSize: 1024 * 1024 * 1024 * 1024, // 1TB limit
            },
        }).single('file');

        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.log('Multer Error:', err);
                res.status(400).json({
                    error: 'Có lỗi xảy ra khi tải lên tệp tin: ' + err.message,
                });
            } else if (err) {
                console.log('Error:', err);
                res.status(400).json({
                    error: 'Có lỗi xảy ra khi tải lên tệp tin: ' + err.message,
                });
            } else if (!req.file) {
                res.status(400).json({
                    error: 'Không có tệp tin nào được tải lên.',
                });
            } else if (!req.body.patientID) {
                res.status(400).json({
                    error: 'Thiếu patientID trong yêu cầu.',
                });
            } else {
                res.status(200).json({
                    message: 'Tệp tin đã được tải lên thành công!',
                    filename: req.file.filename,
                });
            }
        });
    }
}

module.exports = new uploadFile();