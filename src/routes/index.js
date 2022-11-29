const filmRoute = require("./filmRoute");
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const commentRoute = require("./commentRouter");
function router(app) {
  app.use("/api/", filmRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/admin", adminRoute);
  app.use("/api/comment", commentRoute);
}
module.exports = router;
