const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URL;

    if (!mongoURI) {
      throw new Error("MONGODB_URL is missing in environment variables");
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.error(
      `❌ MongoDB Connection Error: ${error.message}`
    );

    // Let server.js handle startup failure.
    throw error;
  }
};

module.exports = connectDB;
