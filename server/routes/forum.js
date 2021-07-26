const router = require("express").Router();
const pool = require("../db");
const authorisation = require("../middleware/authorisation");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// POST into the forum table
router.post("/", authorisation, async (req, res) => {
  try {
    // destructure the req.body (OUID, subject)
    const { OUID, subject, tutorName, studentName } = req.body;

    // insert into forums table
    if (req.user.type === "Tutor") {
      const forum = await pool.query(
        "SELECT * FROM forums WHERE subject = $1 AND tutor_id = $2 AND student_id = $3",
        [subject, req.user.id, OUID]
      );

      if (forum.rows[0]) {
        return res.json({
          severity: "error",
          message: "Tuition already engaged!",
        });
      }

      await pool.query(
        "INSERT INTO forums (subject, tutor_name, student_name, tutor_id, student_id) VALUES ($1, $2, $3, $4, $5)",
        [subject, tutorName, studentName, req.user.id, OUID]
      );
    } else if (req.user.type === "Student") {
      const forum = await pool.query(
        "SELECT * FROM forums WHERE subject = $1 AND tutor_id = $2 AND student_id = $3",
        [subject, OUID, req.user.id]
      );

      if (forum.rows[0]) {
        return res.json({
          severity: "error",
          message: "Tuition already engaged!",
        });
      }

      await pool.query(
        "INSERT INTO forums (subject, tutor_name, student_name, tutor_id, student_id) VALUES ($1, $2, $3, $4, $5)",
        [subject, tutorName, studentName, OUID, req.user.id]
      );
    }

    return res.json({
      status: true,
      message: "Tuition successfully engaged!",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

// get forum details
router.get("/id/:forumId", authorisation, async (req, res) => {
  try {
    const { forumId } = req.params;

    const forum = await pool.query("SELECT * FROM forums where id = $1", [
      forumId,
    ]);

    // need a way to determine whether user is authorised to view forum with said id

    if (forum.rows[0]) {
      if (req.user.type === "Tutor") {
        return res.json({
          ...forum.rows[0],
          OU_name: forum.rows[0].student_name,
        });
      } else {
        return res.json({
          ...forum.rows[0],
          OU_name: forum.rows[0].tutor_name,
        });
      }
    }

    return res.status(404).json(false);
  } catch (error) {
    console.error(error.message);
    res.status(500).json(false);
  }
});

router.delete("/id/:forumId", authorisation, async (req, res) => {
  try {
    const { forumId } = req.params;

    const forum = await pool.query(
      "DELETE FROM forums where id = $1 RETURNING *",
      [forumId]
    );

    if (forum.rows[0]) {
      return res.json({
        status: true,
        message: "Forum succesfully terminated!",
      });
    }

    return res
      .status(404)
      .json({ status: false, message: "No forum to terminate!" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ status: false, message: "Server error" });
  }
});

//ANNOUNCMENTS
//get announcements :
router.get("/announcements", authorisation, async (req, res) => {
  try {
    const { forumid } = req.headers;

    const announcements = await pool.query(
      "SELECT id, title, body, date FROM announcements WHERE forumid = $1 ORDER BY date DESC",
      [forumid]
    );

    return res.json(announcements.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

// post announcement: tutor only
/* note: do not allow static (same annc) edit for immutability purposes 
 ie: for every EDIT, router.delete and router.post will be called
 to avoid use of router.put */
router.post("/announcements", authorisation, async (req, res) => {
  try {
    const { forumid, title, body, date } = req.body;

    const announcement = await pool.query(
      "INSERT INTO announcements (forumid ,title, body, date) VALUES ($1, $2, $3, $4) RETURNING *",
      [forumid, title, body, date]
    );

    if (announcement.rows.length === 0) {
      return res.json({
        status: false,
        message: "Failed to post announcement",
      });
    }

    return res.json({
      status: true,
      message: "Announcement posted!",
      id: announcement.rows[0].id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

// delete announcements
router.delete("/announcements", authorisation, async (req, res) => {
  try {
    const { id } = req.headers;

    //cannnot delete based on forum_id bc each S-T can have mutliple objects between them and tf f_id is not unique
    // student_id required since each tutor can post the same annc title/body to multiple students
    const announcement = await pool.query(
      "DELETE FROM announcements WHERE id = $1 RETURNING *",
      [id]
    );

    if (announcement.rows.length === 0) {
      return res.json({
        status: false,
        message: "Failed to delete announcement",
      });
    }

    return res.json({ status: true, message: "Announcement deleted!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

// QNA
//get qna :
router.get("/qna", authorisation, async (req, res) => {
  try {
    const { forumid } = req.headers;
    const questions = await pool.query(
      "SELECT id, question, answer, dateAsked, dateResponded FROM qna WHERE forumid = $1 ORDER BY dateResponded DESC, dateAsked DESC",
      [forumid]
    );

    return res.json(questions.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

// post question: student only
router.post("/qna/question", authorisation, async (req, res) => {
  try {
    const { forumid, question, date } = req.body;

    const qn = await pool.query(
      "INSERT INTO qna (forumid, question, dateAsked) VALUES ($1, $2, $3) RETURNING *",
      [forumid, question, date]
    );

    if (qn.rows.length === 0) {
      return res.json({ status: false, message: "Failed to post question!" });
    } else if (qn.rows.length > 1) {
      // for precise Question obj identification at answer stage
      return res.json({
        status: false,
        message: "Question has been answered before!",
      });
    }

    res.json({
      status: true,
      message: "Question successfully posted!",
      id: qn.rows[0].id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

// answer: tutor only
router.put("/qna/answer", authorisation, async (req, res) => {
  try {
    const { id, answer, date } = req.body;

    console.log(req.body);

    const ans = await pool.query(
      "UPDATE qna SET answer = $1, dateresponded = $2 WHERE id = $3 RETURNING *",
      [answer, date, id]
    );

    if (ans.rows.length === 0) {
      res.json("Failed to post answer");
    } else {
      res.json(true);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

// delete question (and answer if there is): student only
router.delete("/qna", authorisation, async (req, res) => {
  try {
    const { id } = req.headers;

    //cannnot delete based on forum_id bc each S-T can have mutliple objects between them and tf f_id is not unique
    // and recieve same answers across the system, but said student cannot post the same qn

    const entry = await pool.query(
      "DELETE FROM qna WHERE id = $1 RETURNING *",
      [id]
    );

    if (entry.rows.length === 0) {
      return res.json({ status: false, message: "Failed to delete question!" });
    }
    return res.json({
      status: true,
      message: "Successfully deleted question!",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// FILES
const allowables = [
  "application/pdf",
  "application/msword",
  "application/vnd.ms-powerpoint",
  "application/vnd.ms-excel",
  "text/html",
];

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/tempStorage")); // temp soln for missing dir
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// adapted fileFilter & Validation
const fileUpload = multer({
  storage: fileStorage,
  fileFilter: (req, file, cb) => {
    if (!allowables.includes(file.mimetype)) {
      req.fileValidationError =
        "Only .pdf, .html and microsoft file types are allowed";
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
});

// tutor only
router.post(
  // to replace an existing doc, user must delete then re-add, prevent direct edit
  "/file",
  [authorisation, fileUpload.single("file")],
  async (req, res) => {
    try {
      // check if file type is correct
      if (req.fileValidationError) {
        return res.json(req.fileValidationError);
      }

      const { mimetype, size, path, filename } = req.file;
      const { forumid, date } = req.body;

      await pool.query("INSERT INTO files VALUES ($1, $2, $3, $4, $5, $6)", [
        forumid,
        date,
        filename,
        path,
        mimetype,
        size,
      ]);

      res.json(true);
    } catch (error) {
      console.error(error);
      res.status(500).json("Server error");
    }
  }
);

// get files
router.post("/files", authorisation, async (req, res) => {
  try {
    const { forumid } = req.body;

    const files = await pool.query("SELECT * FROM files WHERE forumid = $1", [
      forumid,
    ]);

    if (files.rows.length === 0) {
      return res.status(404).json(false);
    }

    //bug here
    fs.readFile(path, (error, data) => {
      if (error) {
        res.status(500).json(error);
      }

      res.setHeader(
        "Content-Disposition",
        'attachment:filename="' + filename + '"'
      );
      res.send(data);
    });
  } catch (error) {
    res.status(500).json("Server error");
  }
});

// ASSIGNMENTS
router.post(
  // to replace an existing doc, user must delete then re-add, prevent direct edit
  "/assignment",
  [authorisation, fileUpload.single("file")],
  async (req, res) => {
    try {
      // check if file type is correct
      if (req.fileValidationError) {
        return res.json(req.fileValidationError);
      }

      const { mimetype, size, path, filename } = req.file;
      const { forumid, date } = req.body;

      await pool.query(
        "INSERT INTO assignments VALUES ($1, $2, $3, $4, $5, $6)",
        [forumid, date, filename, path, mimetype, size]
      );

      res.json(true);
    } catch (error) {
      console.error(error);
      res.status(500).json("Server error");
    }
  }
);

// get files
router.post("/assignments", authorisation, async (req, res) => {
  try {
    const { forumid } = req.body;

    const assns = await pool.query(
      "SELECT * FROM assignments WHERE forumid = $1",
      [forumid]
    );

    if (assns.rows.length === 0) {
      return res.status(404).json(false);
    }

    //bug here
    fs.readFile(path, (error, data) => {
      if (error) {
        res.status(500).json(error);
      }

      res.setHeader(
        "Content-Disposition",
        'attachment:filename="' + filename + '"'
      );
      res.send(data);
    });
  } catch (error) {
    res.status(500).json("Server error");
  }
});
module.exports = router;
