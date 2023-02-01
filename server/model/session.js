const mongoose = require("mongoose");
const student = require("./student");

const sessionSchema = new mongoose.Schema({
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "SingleSession" }],
});

module.exports = mongoose.model("Session", sessionSchema);
