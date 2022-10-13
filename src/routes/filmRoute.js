const express = require("express");
const filmController = require("../controllers/filmController");
const verifyToken = require("../middlewares/verifyToken");
const Router = express.Router();
// [GET] /api/film/watchlist/addedWatchlist
Router.get(
  "/film/watchlist/addedWatchlist",
  verifyToken,
  filmController.addedWatchlist
);
// [POST] /api/film/watchlist/add
Router.post("/film/watchlist/add", verifyToken, filmController.addToWatchlist);
// [GET] /api/film/watch-list/remove
Router.get(
  "/film/watch-list/remove",
  verifyToken,
  filmController.removeWatchList
);
// [POST] /api/film/remove
Router.post("/film/remove", filmController.remove);
// [POST] /api/film/sortDelete
Router.post("/film/sortDelete", filmController.sortDel);
// [POST] /api/film/update?idFilm=
Router.post("/film/update", filmController.updateFilmById);
// [GET] /api/films/:condition/key/value
Router.get("/films/:condition/:key/:value", filmController.selectByCondition);
// [GET] /api/films/type/:params
Router.get("/films/type/:params", filmController.filmsType);
// [GET] /api/film/:id
Router.get("/film/:id", filmController.film);
// [POST] /api/film/create
Router.post("/film/create", filmController.create);
// [POST] /api/films/filter
Router.post("/films/filter", filmController.filter);
// [GET] /api/films/byType
Router.get("/films/byType", filmController.filmByType);
// [GET] /api/films/search
Router.get("/films/search", filmController.search);
// [GET] /api/films/watch-list
Router.get("/films/watch-list", verifyToken, filmController.watchlist);
// [GET] /api/films/lastest/:type
Router.get("/films/lastest/:type", filmController.selectLastest);
// [GET] /api/films/suggest/:id
Router.get("/films/suggest/:id", filmController.selectFilmsSuggest);
// [GET] /api/films
Router.get("/films", filmController.read);
// [GET] /api
Router.get("/", filmController.index);

module.exports = Router;
