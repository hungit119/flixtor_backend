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
// [POST] /api/auth/checkConfirmPassword
Router.post(
  "/checkConfirmPassword",
  verifyToken,
  authController.checkConfirmPassword
);

module.exports = Router;
