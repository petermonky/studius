const router = require("express").Router();
const authorisation = require("../middleware/authorisation");
const credentials = require("../middleware/credentials");
const multer = require("multer");
const fs = require("fs");
const pool = require("../db");

const { uploadFile, getFileStream, deleteFile } = require("../utils/s3");

const upload = multer({ dest: "./files/credentials" });

router.get("/credentials", [authorisation, credentials], (req, res) => {
  try {
    const key = req.user.credentialsName;
    const readStream = getFileStream(key);

    readStream.pipe(res);
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/credentials",
  [authorisation, upload.single("credentials")],
  async (req, res) => {
    try {
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

      fs.unlink(`./files/credentials/${result.key}`, (error) => {
        if (error) {
          console.error(error);
        }
      });

      res.json({ status: true, message: "Upload successful!" });
    } catch (error) {
      res.status(500).json({ status: false, message: "Server error" });
      console.error(error);
    }
  }
);

router.delete(
  "/credentials",
  [authorisation, credentials],
  async (req, res) => {
    try {
      const { credentialsId } = req.user;

      await deleteFile(req.user.credentialsName);

      const fileDelete = await pool.query(
        "DELETE FROM credentials WHERE id = $1 RETURNING *",
        [credentialsId]
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
