const filmRoute = require("./filmRoute");
function router(app) {
  app.use("/api/", filmRoute);
}
module.exports = router;
