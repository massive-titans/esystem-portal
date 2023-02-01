const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, trim: true, min: 1, max: 255 },
  categoryShortName: {
    type: String,
    required: true,
    trim: true,
    min: 1,
    max: 255,
  },
  description: { type: String, trim: true, max: 2505 },
});

module.exports = mongoose.model("Category", categorySchema);
