const router = require("express").Router();
const authorisation = require("../middleware/authorisation");
const credentials = require("../middleware/credentials");
const multer = require("multer");
const os = require("os");
const pool = require("../db");

const { uploadFile, getFileStream, deleteFile } = require("../utils/s3");

const upload = multer({ dest: os.tmpdir() });

router.get("/credentials", authorisation, async (req, res) => {
  try {
    const tutorId = req.headers.tutorid || req.user.id;

    const credentials = await pool.query(
      "SELECT * FROM credentials WHERE tutorid = $1",
      [tutorId]
    );

    if (credentials.rows.length === 0) {
      return res.status(404).json({ key: "" });
    }

    return res.json({ key: credentials.rows[0].aws_name });
  } catch (error) {
    console.error(error);
  }
});

router.get("/credentials/:key", authorisation, (req, res) => {
  try {
    const { key } = req.params;
    // const key = req.user.credentialsName;
    const readStream = getFileStream(key);

    readStream.pipe(res);
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/credentials",
  [authorisation, credentials, upload.single("credentials")],
  async (req, res) => {
    try {
      if (req.file.mimetype !== "application/pdf") {
        return res.json({
          status: false,
          message: "File type must be PDF!",
        });
      }
      const result = await uploadFile(req.file);

      const fileRetrieve = await pool.query(
        "SELECT * FROM credentials WHERE tutorid = $1",
        [req.user.id]
      );

      if (fileRetrieve.rows.length > 0) {
        return res
          .status(400)
          .json({ status: false, message: "Upload failed!" });
      }

      await pool.query(
        "INSERT INTO credentials (tutorid, aws_name) VALUES ($1, $2)",
        [req.user.id, result.key]
      );

      // fs.unlink(`./files/credentials/${result.key}`, (error) => {
      //   if (error) {
      //     console.error(error);
      //   }
      // });

      res.json({
        status: true,
        message: "Upload successful!",
        key: result.key,
      });
    } catch (error) {
      res.status(500).json({ status: false, message: "Server error" });
      console.error(error);
    }
  }
);

router.delete(
  "/credentials/:key",
  [authorisation, credentials],
  async (req, res) => {
    try {
      const { key } = req.user;

      await deleteFile(key);

      const fileDelete = await pool.query(
        "DELETE FROM credentials WHERE aws_name = $1 RETURNING *",
        [key]
      );

      if (fileDelete.rows.length === 0) {
        return res.json({ status: false, message: "Delete failed!" });
      }

      res.json({ status: true, message: "Delete successful!" });
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = router;
