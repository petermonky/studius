const router = require("express").Router();
const pool = require("../db");
const authorisation = require("../middleware/authorisation");

router.get("/", authorisation, async (req, res) => {
  try {
    // retrieve user information from database
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    // return the user informations
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

// get engaged
router.get("/engaged", authorisation, async (req, res) => {
  try {
    let engaged;

    if (req.user.type === "Tutor") {
      engaged = await pool.query("SELECT * FROM forums WHERE tutor_id = $1", [
        req.user.id,
      ]);
    } else {
      engaged = await pool.query("SELECT * FROM forums WHERE student_id = $1", [
        req.user.id,
      ]);
    }

    res.json({ forums: engaged.rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
