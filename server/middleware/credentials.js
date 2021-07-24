const pool = require("../db");

const credentials = async (req, res, next) => {
  try {
    const credentials = await pool.query(
      "SELECT * FROM credentials WHERE tutorid = $1",
      [req.user.id]
    );

    if (credentials.rows.length === 0) {
      return res.status(404);
    }

    req.user.credentialsId = credentials.rows[0].id;
    req.user.credentialsName = credentials.rows[0].aws_name;

    next();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json("Server error");
  }
};

module.exports = credentials;
