const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];
  const token = tokenHeader && tokenHeader.split(" ")[1];
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Not found access token",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    req.userId = decoded.id;
    req.userRule = decoded.rule;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "server error",
    });
  }
};

module.exports = verifyToken;
