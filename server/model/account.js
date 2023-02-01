const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const getRoleUser = require("../controller/getRoleUser");

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, min: 1, max: 255 },
  password: { type: String, required: true, min: 1, max: 255 },
  accountType: { type: String, required: true },
});
dotenv.config({ path: "config.env" });

accountSchema.methods.generateAuthJWT = async function () {
  const user = await getRoleUser(this.accountType, this._id);
  return jwt.sign(
    {
      id: user._id,
      email: this.email,
      firstname: user.firstName,
      lastname: user.lastName,
      role: this.accountType,
    },
    process.env.TOKEN_SECRET_KEY
  );
};

module.exports = mongoose.model("Account", accountSchema);
