const mysql = require("mysql");
function connect(callback) {
  const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Tranduyhung11",
    database: "flixtor",
    multipleStatements: true,
  });
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected !");
    callback(con);
  });
}
module.exports = { connect };
