const path = require('path');
const dataDirectory = path.join(__dirname, 'data/dataInput/');

class downloadController {
    //GET
    download(req, res) {
        const fileName = req.query.fileName;
        const filePath = path.join(dataDirectory, `${fileName}.gz`);
        res.download(filePath, (err) => {
            if (err) {
                console.error('Lỗi khi tải file:', err);
                res.status(500).send('Lỗi khi tải file.');
            }
        });
    }
}

module.exports = new downloadController();
