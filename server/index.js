const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");

// default port
const port = 3000;

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// routes
app.use("/api", require("./routes/routes"));

app.listen(process.env.PORT || port, () => {
  console.log(
    `Server is running on port ${process.env.PORT ? process.env.PORT : port}.`
  );
});
