const express = require("express");
const adminController = require("../controllers/adminController");
const verifyRule = require("../middlewares/verifyRule");
const verifyToken = require("../middlewares/verifyToken");
const Router = express.Router();

// [GET] api/admin/users
Router.get("/users", verifyToken, verifyRule, adminController.getUsers);
// [POST] api/admin/changeRule
Router.post("/changeRule", verifyToken, verifyRule, adminController.changeRule);

module.exports = Router;
