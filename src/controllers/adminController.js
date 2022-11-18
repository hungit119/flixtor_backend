const { client } = require("../config/db");
const Response = require("../utils/Response");
class AdminController {
  // [GET] /api/admin/users
  getUsers(req, res) {
    const query = `select * from users where users.rule = 2 or users.rule = 1 `;
    client.query(query, (error, result) => {
      if (error) throw error;
      res.json(
        Response.response(true, "get all user successfully", result.rows)
      );
    });
  }
  // [POST]
  changeRule(req, res) {
    const { id, rule } = req.body;
    const query = `update users set rule=${rule} where id='${id}'`;
    client.query(query, (error) => {
      if (error) throw error;
      res.json({
        success: true,
        message: "Updated rule user",
      });
    });
  }
}

module.exports = new AdminController();
