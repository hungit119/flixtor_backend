const filmRoute = require("./filmRoute");
const authRoute = require("./authRoute");
function router(app) {
  app.use("/api/", filmRoute);
  app.use("/api/auth", authRoute);
}
module.exports = router;
