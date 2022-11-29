const express = require("express");
const commentController = require("../controllers/commentController");
const Router = express.Router();

Router.post("/", commentController.writeComment);
Router.get("/", commentController.index);

module.exports = Router;
