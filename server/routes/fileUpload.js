const router = require("express").Router();
const authorisation = require("../middleware/authorisation");
const credentials = require("../middleware/credentials");
const files = require("../middleware/files");
const assignments = require("../middleware/assignments");
const multer = require("multer");
const os = require("os");
const pool = require("../db");

const { uploadFile, getFile, deleteFile } = require("../utils/s3");

const uploader = (field) => (req, res, next) => {
  const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 10000000 },
  }).single(field);

  upload(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        status: false,
        message: "File size too big!",
      });
      return console.error(err);
    }
    next();
  });
};

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

router.get("/credentials/:key", authorisation, async (req, res) => {
  try {
    const { key } = req.params;
    // const key = req.user.credentialsName;
    // const readStream = getFileStream(key);
    const file = await getFile(key);

    // readStream.pipe(res);
    return res.json({ file: file.Body });
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/credentials",
  [authorisation, credentials, uploader("credentials")],
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

router.get("/files", authorisation, async (req, res) => {
  try {
    const forumId = req.headers.forumid;

    const files = await pool.query(
      "SELECT * FROM files WHERE forumid = $1 ORDER BY date DESC",
      [forumId]
    );

    return res.json(
      files.rows.map((file) => ({
        ...file,
        isowner: file.ownerid === req.user.id,
      }))
    );
  } catch (error) {
    console.error(error);
  }
});

router.get("/files/:key", authorisation, async (req, res) => {
  try {
    const { key } = req.params;
    // const readStream = getFileStream(key);

    const fileType = await pool.query(
      "SELECT mimetype FROM files WHERE aws_name = $1",
      [key]
    );

    const file = await getFile(key);

    // readStream.pipe(res);
    return res.json({ file: file.Body, fileType: fileType.rows[0].mimetype });
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/files",
  [authorisation, files, uploader("file")],
  async (req, res) => {
    try {
      const fileRetrieve = await pool.query(
        "SELECT * FROM files WHERE filename = $1",
        [req.file.originalname]
      );

      if (fileRetrieve.rows.length > 0) {
        return res.json({
          status: false,
          message: "Duplicate file name!",
        });
      }

      const result = await uploadFile(req.file);

      const file = await pool.query(
        "INSERT INTO files (forumid, ownerid, aws_name, date, filename, mimetype, size) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          req.headers.forumid,
          req.user.id,
          result.key,
          new Date().toISOString(),
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
        ]
      );

      res.json({
        status: true,
        message: "Upload successful!",
        file: file.rows[0],
      });
    } catch (error) {
      res.status(500).json({ status: false, message: "Server error" });
      console.error(error);
    }
  }
);

router.delete("/files/:key", [authorisation, files], async (req, res) => {
  try {
    const { key } = req.user;

    const fileDelete = await pool.query(
      "DELETE FROM files WHERE aws_name = $1 RETURNING *",
      [key]
    );

    if (fileDelete.rows.length === 0) {
      return res.json({ status: false, message: "Delete failed!" });
    }

    await deleteFile(key);

    res.json({ status: true, message: "Delete successful!" });
  } catch (error) {
    console.error(error);
  }
});

router.get("/assignments", authorisation, async (req, res) => {
  try {
    const forumId = req.headers.forumid;

    const assignments = await pool.query(
      "SELECT * FROM assignments WHERE forumid = $1 ORDER BY date DESC",
      [forumId]
    );

    return res.json(
      assignments.rows.map((assignment) => ({
        ...assignment,
        isowner: assignment.ownerid === req.user.id,
      }))
    );
  } catch (error) {
    console.error(error);
  }
});

router.get("/assignments/:key", authorisation, async (req, res) => {
  try {
    const { key } = req.params;
    // const readStream = getFileStream(key);
    const file = await getFile(key);

    const fileType = await pool.query(
      "SELECT mimetype FROM assignments WHERE aws_name = $1",
      [key]
    );

    // readStream.pipe(res);
    return res.json({ file: file.Body, fileType: fileType.rows[0].mimetype });
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/assignments",
  [authorisation, assignments, uploader("file")],
  async (req, res) => {
    try {
      const fileRetrieve = await pool.query(
        "SELECT * FROM assignments WHERE filename = $1",
        [req.file.originalname]
      );

      if (fileRetrieve.rows.length > 0) {
        return res.json({
          status: false,
          message: "Duplicate file name!",
        });
      }

      const result = await uploadFile(req.file);

      const file = await pool.query(
        "INSERT INTO assignments (forumid, ownerid, aws_name, date, filename, mimetype, size) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          req.headers.forumid,
          req.user.id,
          result.key,
          new Date().toISOString(),
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
        ]
      );

      res.json({
        status: true,
        message: "Upload successful!",
        file: file.rows[0],
      });
    } catch (error) {
      res.status(500).json({ status: false, message: "Server error" });
      console.error(error);
    }
  }
);

router.delete(
  "/assignments/:key",
  [authorisation, assignments],
  async (req, res) => {
    try {
      const { key } = req.user;

      const fileDelete = await pool.query(
        "DELETE FROM assignments WHERE aws_name = $1 RETURNING *",
        [key]
      );

      if (fileDelete.rows.length === 0) {
        return res.json({ status: false, message: "Delete failed!" });
      }

      await deleteFile(key);

      res.json({ status: true, message: "Delete successful!" });
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = router;
