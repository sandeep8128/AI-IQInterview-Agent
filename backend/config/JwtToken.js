const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is missing in environment variables");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is missing in environment variables");
  }

  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

module.exports = {
  generateToken,
  verifyToken,
};
