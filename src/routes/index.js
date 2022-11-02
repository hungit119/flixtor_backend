const filmRoute = require("./filmRoute");
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
function router(app) {
  app.use("/api/", filmRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/admin", adminRoute);
}
module.exports = router;
