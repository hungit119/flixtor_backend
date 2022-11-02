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
// [GET] /api/auth/activate/:token
Router.get("/activate/:token", authController.activateToken);
// [POST] /api/auth/forgotPassword
Router.post("/forgotPassword", authController.forgotPassword);
// [POST] /api/auth/changePassword
Router.post("/changePassword/:token", authController.changePassword);

module.exports = Router;
