const { con } = require("../config/db");
const argon2 = require("argon2");
const { v4 } = require("uuid");
const jwt = require("jsonwebtoken");
class AuthController {
  // [POST] /api/auth/register
  async register(req, res) {
    const { username, email, password } = req.body;
    try {
      // check existing user
      const query = `select username from user where username = '${username}'`;
      con.query(query, async function (error, rows) {
        if (error) throw error;
        if (rows.length > 0) {
          res.json({
            success: false,
            message: "username was existed !",
          });
        } else {
          // username not exist
          // hash password
          try {
            const passwordEcoded = await argon2.hash(password);
            const newUser = {
              id: v4(),
              username,
              passwordEcoded,
              email,
              rule: 1,
            };
            const accessToken = jwt.sign(
              {
                id: newUser.id,
              },
              process.env.SECRET_KEY_TOKEN
            );
            const query = `insert into user (id,username,email,password,rule)
            values ('${newUser.id}','${newUser.username}','${newUser.email}','${newUser.passwordEcoded}','${newUser.rule}')`;
            con.query(query, function (error, rows) {
              if (error) throw error;
              res.json({
                success: true,
                message: "register successfully !",
                reply: {
                  username: newUser.username,
                  email: newUser.email,
                  accessToken,
                },
              });
            });
          } catch (error) {
            console.log(error.message);
          }
        }
      });
      // hashed password
      // create new user
      // return token
    } catch (error) {
      console.log(error.message);
    }
  }
  // [POST] /api/auth/login
  async login(req, res) {
    const { username, password } = req.body;
    try {
      // check username existing
      const query = `select id,username,password from user where username = '${username}'`;
      con.query(query, async function (error, rows) {
        if (error) throw error;
        if (rows.length === 0) {
          return res.json({
            success: false,
            message: "user not existed",
          });
        } else {
          const decodedPassword = await argon2.verify(
            rows[0].password,
            password
          );
          if (!decodedPassword) {
            return res.status(400).json({
              success: false,
              message: "Incorrect username or password!",
            });
          } else {
            const accessToken = jwt.sign(
              { id: rows[0].id },
              process.env.SECRET_KEY_TOKEN
            );
            return res.json({
              success: true,
              message: "login successfully!",
              reply: {
                username: rows[0].username,
                accessToken,
              },
            });
          }
        }
      });
      // check password valid
      //   return token
    } catch (error) {
      console.log(error.message);
    }
  }
  auth(req, res) {
    const { userId } = req;
    const query = `select username,email from user where id = '${userId}'`;
    con.query(query, function (error, rows) {
      if (error) throw error;
      res.json({
        success: true,
        message: "load user successfully",
        userInfo: rows[0],
      });
    });
  }
}
module.exports = new AuthController();
