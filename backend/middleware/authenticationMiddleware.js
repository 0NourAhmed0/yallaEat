const jwt = require("jsonwebtoken");
const User = require("../models/user");
const secretKey = process.env.SECRET_KEY;

module.exports = async function authenticationMiddleware(req, res, next) {
  try {
    const cookie = req.cookies;
    if (!cookie || !cookie.token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = cookie.token;

    // Verify token
    const decoded = jwt.verify(token, secretKey);

    // Adjust according to how your JWT is structured
    const userId = decoded.user?.id || decoded.id; // check both

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.disabled) {
      return res.status(403).json({
        message: "Your account has been disabled. Please contact the restaurant.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token or authentication failed", error: error.message });
  }
};
