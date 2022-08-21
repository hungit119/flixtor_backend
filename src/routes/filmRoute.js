const express = require("express");
const filmController = require("../controllers/filmController");
const Router = express.Router();

// [GET] /api/films
Router.get("/films", filmController.read);
// [GET] /api/film/:id
Router.get("/film/:id", filmController.film);
// [POST] /api/film/create
Router.post("/film/create", filmController.create);
// [GET] /api
Router.get("/", filmController.index);

module.exports = Router;
