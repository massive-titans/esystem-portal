const _ = require("lodash");

const globalObjects = require("../helper/globalObjects");
const Student = require("../model/student");
const Teacher = require("../model/teacher");
const Admin = require("../model/admin");

module.exports = async function (role, id) {
  if (role == globalObjects.accountType.student)
    return await Student.findOne({ accountLogin: id });

  if (role == globalObjects.accountType.teacher)
    return await Teacher.findOne({ accountLogin: id });

  if (role == globalObjects.accountType.admin)
    return await Admin.findOne({ accountLogin: id });
};
