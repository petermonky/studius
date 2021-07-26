const pool = require("../db");

const assignments = async (req, res, next) => {
  try {
    if (req.method === "DELETE") {
      const { key } = req.params;

      const assignments = await pool.query(
        "SELECT * FROM assignments WHERE aws_name = $1",
        [key]
      );

      if (assignments.rows.length === 0) {
        return res.status(404).json("No file to delete");
      } else if (
        req.user.type === "Student" &&
        assignments.rows[0].ownerid !== req.user.id
      ) {
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

module.exports = assignments;
