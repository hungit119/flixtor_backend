require("dotenv").config();
const express = require("express");
const router = require("./routes");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./config/db");
const app = express();
const PORT = process.env.PORT || 4000;

var cors = require("cors");
dotenv.config();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
db.connect();
router(app);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
