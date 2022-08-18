const express = require("express");
const filmController = require("../controllers/filmController");
const Router = express.Router();

// [POST] /api/film/create
Router.post("/film/create", filmController.create);
// [GET] /api
Router.get("/", filmController.index);

module.exports = Router;
