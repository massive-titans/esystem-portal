const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const globalObjects = require("../server/helper/globalObjects");

dotenv.config({ path: "config.env" });

function tokenValidation(req, res, next) {
  const token = req.cookies["x-auth-token"] || req.query.token;
  if (!token) return res.status(401).send("access denied!");
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token!");
  }
}

function publicAccess(req, res, next) {
  const token = req.cookies["x-auth-token"];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (ex) {
      res.status(400).send("Invalid token!");
    }
  } else next();
}

function adminAccess(req, res, next) {
  if (req.user.role === globalObjects.accountType.admin) {
    next();
  } else return res.status(401).send("access denied!");
}

function teacherAccess(req, res, next) {
  if (
    req.user.role === globalObjects.accountType.admin ||
    req.user.role === globalObjects.accountType.teacher
  ) {
    next();
  } else return res.status(401).send("access denied!");
}

function studentAccess(req, res, next) {
  if (
    req.user.role === globalObjects.accountType.student ||
    req.user.role === globalObjects.accountType.teacher ||
    req.user.role === globalObjects.accountType.admin
  ) {
    next();
  } else return res.status(401).send("access denied!");
}

module.exports = {
  tokenValidation,
  publicAccess,
  adminAccess,
  teacherAccess,
  studentAccess,
};
