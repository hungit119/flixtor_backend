const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

function connect() {
  client.connect();

  client.query("SELECT now();", (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log("Connected to database at");
      console.log(JSON.stringify(row));
    }
  });
}
module.exports = { connect, client };
