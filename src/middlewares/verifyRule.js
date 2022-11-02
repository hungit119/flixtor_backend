const verifyRule = (req, res, next) => {
  if (req.userRule > 3) {
    res.status(401).json({
      success: false,
      message: "Permission not access!",
    });
  }
  next();
};
module.exports = verifyRule;
