const mysql = require("mysql");
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tranduyhung11",
  database: "flixtor",
  multipleStatements: true,
});
function connect() {
  con.connect(function (err) {
    if (err) throw err;
    console.log("connected");
  });
}
module.exports = { connect, con };
