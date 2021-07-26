const pool = require("../db");

const files = async (req, res, next) => {
  try {
    if (req.method === "DELETE") {
      const { key } = req.params;

      const files = await pool.query(
        "SELECT * FROM files WHERE aws_name = $1",
        [key]
      );

      if (files.rows.length === 0) {
        return res.status(404).json("No file to delete");
      } else if (files.rows[0].ownerid !== req.user.id) {
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

module.exports = files;
