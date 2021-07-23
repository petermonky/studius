const router = require("express").Router();

// register and login routes
router.use("/auth", require("./jwtAuth"));

// main route
router.use("/main", require("./main"));

// marketplace route
router.use("/marketplace", require("./marketplace"));

// profile route
router.use("/profile", require("./profile"));

// account route
router.use("/account", require("./account"));

// file route
router.use("/files", require("./fileUpload"));

// forum route
router.use("/forum", require("./forum"));

// dashboard routes
router.use("/dashboard", require("./routes/dashboard"));

module.exports = router;
