const mongoose = require("mongoose");

const dynamicProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: "accountType" },
  accountType: {
    type: String,
    required: true,
    enum: ["Student", "Teacher", "Admin"],
  },
});

module.exports = mongoose.model("DynamicProfile", dynamicProfileSchema);
