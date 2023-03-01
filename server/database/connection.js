const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "config.env"});

mongoose.connect(process.env.MONGODB_URL);
const conn = mongoose.connection;
conn.on("error", () => console.error.bind(console, "connection error:"));
conn.once("open", () => console.info(`Connected to Database: ${conn.host}`));

module.exports = conn;
