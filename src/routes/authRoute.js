const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");
const Router = express.Router();

// [GET] /api/auth/
Router.get("/", verifyToken, authController.auth);
// [POST] /api/auth/register
Router.post("/register", authController.register);
// [POST] /api/auth/login
Router.post("/login", authController.login);

module.exports = Router;
