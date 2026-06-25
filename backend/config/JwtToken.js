const jwt = require("jsonwebtoken");


console.log("JWT_SECRET_KEY =", process.env.JWT_SECRET_KEY);

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET_KEY
  );
};

module.exports = {
  generateToken,
  verifyToken,
};