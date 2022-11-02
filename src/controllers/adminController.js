const { con } = require("../config/db");
const Response = require("../utils/Response");
class AdminController {
  // [GET] /api/admin/users
  getUsers(req, res) {
    const query = `select * from user where user.rule = 2 or user.rule = 1 `;
    con.query(query, (error, rows) => {
      if (error) throw error;
      res.json(Response.response(true, "get all user successfully", rows));
    });
  }
  // [POST]
  changeRule(req, res) {
    const { id, rule } = req.body;
    const query = `update user set rule=${rule} where id='${id}'`;
    con.query(query, (error) => {
      if (error) throw error;
      res.json({
        success: true,
        message: "Updated rule user",
      });
    });
  }
}

module.exports = new AdminController();
