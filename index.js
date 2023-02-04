require("dotenv").config();
const path = require("path");
const express = require("express");
const multer = require("multer");
const { s3Uploadv2 } = require("./s3Service");
const uuid = require("uuid").v4;
const app = express();

// const upload = multer({ dest: "uploads/" });

// // send single
// app.post("/upload", upload.single("file"), (req, res) => {
//   try {
//     res.json({ status: "success" });
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// // send multi
// app.post("/uploadMulti", upload.array("file"), (req, res) => {
//   try {
//     res.json({ status: "success" });
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// // send multi with limit
// app.post("/uploadMultiLimit", upload.array("file", 2), (req, res) => {
//   try {
//     res.json({ status: "success" });
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// // send multi specific files...
// const multiUpload = upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "bio", maxCount: 1 },
//   { name: "resume", maxCount: 2 },
// ]);
// app.post("/uploadMultiField", multiUpload, (req, res) => {
//   try {
//     console.log(req.file);
//     res.json({ status: "success" });
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// // custom name
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads");
// //   },
// //   filename: (req, file, cb) => {
// //     const { originalname } = file;
// //     cb(null, `${uuid()}-${originalname}`);
// //   },
// // });

// const uploadv2 = multer({ storage });

// app.post("/uploadCust", uploadv2.array("file"), (req, res) => {
//   try {
//     console.log(req.file);
//     res.json({ status: "success" });
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// custom name && filter
// const storages = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${uuid()}-${originalname}`);
//   },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else if (ext === ".xlsx") {
    cb(null, true);
  } else {
    //   cb(new Error("file is not correct"), false);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const uploadv3 = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10000000, files: 2 },
});

app.post("/uploadFilter", uploadv3.array("file"), async (req, res) => {
  try {
    console.log("err.message---0");
    const file = req.files[0];
    console.log("err.message------1");
    const result = await s3Uploadv2(file);
    console.log("err.message------1");
    res.json({ status: "success", result });
  } catch (err) {
    console.log(err.message);
  }
});

// handle errors in express app
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.json({
        message: "file is too large",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.json({
        message: "file limit exceeded",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.json({
        message: "file must be image type",
      });
    }
  }
});

app.listen(4000, () => console.log("listening on port 4000"));
