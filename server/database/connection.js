const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

module.exports = async function connectDB() {
  try {
    const connected = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Database connect on: ${connected.connection.host}`);
  } catch (error) {
    console.log(`Could not connect to Database: , ${error}`);
  }
};
