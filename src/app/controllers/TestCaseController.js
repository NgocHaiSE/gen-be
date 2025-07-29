const testCaseModel = require("../models/TestCaseModel");
const dataTestModel = require("../models/DataTestModel");
const authenticateToken = require("./sharedFunction/authentication");
const express = require("express");
const fs = require("fs");
const app = express();
const jwt = require("jsonwebtoken");
const sortGeneList = require("../../utils/sortGeneList");

const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const multer = require("multer");

const dataDirectory = path.join(__dirname, "/data/dataInput/");

secretKey = process.env.SECRET_KEY;
class testCaseController {
  findAll(req, res) {
    console.log(authenticateToken(req, res));
    testCaseModel.find({}, function (err, testCaseModel) {
      if (!err) {
        res.json(testCaseModel);
      } else {
        res.status(500).json({ error: "Error!!!" });
      }
    });
  }

  findAllTest(req, res) {
    dataTestModel.find({}, function (err, data) {
      if (!err) {
        const IDTest = data.map((item) => item.IDTest);
        res.json(IDTest);
      } else {
        res.status(500).json({ error: "Error!!!" });
      }
    });
  }

  findAPage(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    testCaseModel.countDocuments({}, function (err, count) {
      if (err) {
        return res.status(500).json({ error: "Error!!!" });
      }

      testCaseModel
        .find({})
        .skip(skip)
        .limit(limit)
        .exec(function (err, testCaseModels) {
          if (err) {
            return res.status(500).json({ error: "Error!!!" });
          }

          const totalPages = Math.ceil(count / limit);

          res.json({
            testCaseModels,
            currentPage: page,
            totalPages,
          });
        });
    });
  }

  findByID(req, res) {
    const patientID = req.params.id;
    testCaseModel.find({ patientID }, (err, item) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else if (!item) {
        res.status(404).send("Item not found");
      } else {
        res.send(item);
      }
    });
  }

  findByIDTest(req, res) {
    const IDTest = req.params.id;
    dataTestModel.find({ IDTest }, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else if (items.length === 0) {
        res.status(404).send("No items found");
      } else {
        res.json(items);
      }
    });
  }

  delete(req, res, next) {
    testCaseModel
      .deleteOne({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  addTest(req, res) {
    console.log(req.body);
    const testCaseBody = req.body;
    const newTestData = new testCaseModel({
      patientID: String(testCaseBody?.patientID),
      patientName: String(testCaseBody?.patientName),
      testName: String(testCaseBody?.testName),
      primaryTissue: String(testCaseBody?.primaryTissue),
      avaliable: false,
    });
    console.log(newTestData);
    newTestData
      .save()
      .then((test) => {
        console.log("Added new test case to database:", test);
        res.status(201).json({
          message: "Test case added successfully",
          test,
        });
      })
      .catch((err) => {
        console.error("Error adding test case to database:", err);
        res.status(500).json({ error: "Failed to add test case" });
      });
  }

  updateTest(req, res) {
    const testCaseBody = req.body;
    const updatedTestData = {
      patientID: String(testCaseBody?.patientID),
      patientName: String(testCaseBody?.patientName),
      testName: String(testCaseBody?.testName),
      primaryTissue: String(testCaseBody?.primaryTissue),
      available: Boolean(testCaseBody?.available),
    };

    // Xác thực JWT
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("false");
      return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      testCaseModel
        .findOneAndUpdate(
          { patientID: testCaseBody.patientID },
          updatedTestData,
          { new: true }
        )
        .then((test) => {
          if (test) {
            console.log("Updated test case in the database:", test);
            res.status(200).json({
              message: "Test case updated successfully",
              test,
            });
          } else {
            console.log("Test case not found");
            res.status(404).json({ error: "Test case not found" });
          }
        })
        .catch((err) => {
          console.error("Error updating test case in the database:", err);
          res.status(500).json({
            error: "Failed to update test case",
          });
        });
    });
  }

  addTestResult(req, res) {
    console.log(req.body);
    const testResultArray = req.body;

    const newTestResults = testResultArray.mutations.map((testResultBody) => {
      return {
        IDTest: String(testResultArray?.IDTest),
        tissue: String(testResultArray?.tissue),
        mutations: [
          {
            Gene: String(testResultBody?.Gene),
            "RS-ID": String(testResultBody["RS-ID"]),
            Nucleotide: String(testResultBody?.Nucleotide),
            Protein: String(testResultBody?.Protein),
            VariationType: String(testResultBody?.VariationType),
            VariantLength: String(testResultBody?.VariantLength),
            Position: String(testResultBody?.Position),
            DrugResponse: String(testResultBody?.DrugResponse),
            VariantRate: String(testResultBody?.VariantRate),
            ReadDepth: String(testResultBody?.ReadDepth),
          },
        ],
      };
    });

    // Insert the new test results into the database
    dataTestModel
      .insertMany(newTestResults)
      .then((tests) => {
        console.log("Added new test cases to the database:", tests);
        res.status(201).json({
          message: "Test cases added successfully",
          tests,
        });
      })
      .catch((err) => {
        console.error("Error adding test cases to the database:", err);
        res.status(500).json({ error: "Failed to add test cases" });
      });
  }

  uploadFile(req, res) {
    const storage = multer.diskStorage({
      destination: dataDirectory,
      filename: (req, file, cb) => {
        cb(null, "TestFile.gz");
      },
    });

    const upload = multer({
      storage,
      // Thêm middleware để theo dõi tiến độ upload
      fileFilter: (req, file, cb) => {
        cb(null, true);
      },
      limits: {
        // Giới hạn kích thước file
        fileSize: 1024 * 1024 * 1024 * 1024, // Ví dụ giới hạn 10MB
      },
    }).single("file");

    // Thêm middleware để in ra tiến độ upload
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Xử lý lỗi từ multer
        console.log("Multer Error:", err);
        res.status(400).json({
          error: "Có lỗi xảy ra khi tải lên tệp tin.",
        });
      } else if (err) {
        // Xử lý lỗi khác
        console.log("Error:", err);
        res.status(500).json({
          error: "Có lỗi xảy ra khi tải lên tệp tin.",
        });
      } else {
        // Upload thành công
        res.send("Tệp tin đã được tải lên thành công!");
      }
    });
  }

  async download(req, res) {
    const tissueMap = {
      lung: "Phổi",
      breast: "Vú",
      hepatocellular_carcinoma: "Gan",
      large_intestine: "Đại tràng",
      thyroid: "Tuyến giáp",
    };
    const testCaseData = req.body;
    const { patientID, primaryTissue } = testCaseData;
    testCaseData.primaryTissue = tissueMap[primaryTissue];
    const dataTestList = await dataTestModel
      .find({
        IDTest: patientID,
      })
      .lean();

    const unBenignList = sortGeneList(dataTestList);
    testCaseData.genes = unBenignList;
    console.log(testCaseData.genes);

    const content = fs.readFileSync(
      path.resolve(process.cwd(), "templates/templateCase.docx"),
      "binary"
    );
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    try {
      doc.render(testCaseData);
      const buf = doc.getZip().generate({ type: "nodebuffer" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", "attachment; filename=Ket_Qua.docx");
      res.send(buf);
    } catch (error) {
      console.error("Lỗi khi render file Word:", error);
      return res.status(500).send("Render thất bại");
    }
  }

  getFileName(req, res) {
    fs.readdir(dataDirectory, (err, files) => {
      if (err) {
        console.log("Error reading directory:", err);
        res.status(500).json({ error: "Error reading directory" });
      } else {
        const fileNames = files.map((file) => path.parse(file).name);
        res.json(fileNames);
      }
    });
  }
}

module.exports = new testCaseController();
