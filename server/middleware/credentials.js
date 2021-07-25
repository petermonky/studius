const pool = require("../db");

const credentials = async (req, res, next) => {
  try {
    if (req.method === "POST" && req.user.type !== "Tutor") {
      return res.status(403).json("Unauthorised");
    } else if (req.method === "DELETE") {
      const { key } = req.params;

      const credentials = await pool.query(
        "SELECT * FROM credentials WHERE aws_name = $1",
        [key]
      );

      if (credentials.rows.length === 0) {
        return res.status(404).json("No file to delete");
      } else if (credentials.rows[0].tutorid !== req.user.id) {
        return res.status(403).json("Unauthorised");
      }

      req.user.key = key;
    }

    next();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json("Server error");
  }
};

module.exports = credentials;
