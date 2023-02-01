const _ = require("lodash");

const globalObjects = require("../helper/globalObjects");
const Account = require("../model/account");
const Student = require("../model/student");
const Teacher = require("../model/teacher");
const Admin = require("../model/admin");
const DynamicProfile = require("../model/dynamicRef");

async function saveAccount(obj) {
  const account = new Account(
    _.pick(obj, ["email", "password", "accountType"])
  );
  return await account.save();
}

module.exports = async function (role, obj) {
  if (role == globalObjects.accountType.student) {
    const resultAccount = await saveAccount(obj);
    const infoDetails = _.pick(obj, ["firstName", "lastName", "birthdate"]);
    infoDetails.accountLogin = _.pick(resultAccount, ["_id"]);

    const student = new Student(infoDetails);

    const resultSavedStudent = await student.save();
    const dynamicProfile = new DynamicProfile({
      userId: resultSavedStudent._id,
      accountType: "Student",
    });
    await dynamicProfile.save();
  }
  if (role == globalObjects.accountType.teacher) {
    const resultAccount = await saveAccount(obj);
    const infoDetails = _.pick(obj, ["firstName", "lastName", "birthdate"]);
    infoDetails.accountLogin = _.pick(resultAccount, ["_id"]);

    const teacher = new Teacher(infoDetails);

    const resultSavedTeacher = await teacher.save();
    const dynamicProfile = new DynamicProfile({
      userId: resultSavedTeacher._id,
      accountType: "Teacher",
    });
    await dynamicProfile.save();
  }

  if (role == globalObjects.accountType.admin) {
    const resultAccount = await saveAccount(obj);
    const infoDetails = _.pick(obj, ["firstName", "lastName", "birthdate"]);
    infoDetails.accountLogin = _.pick(resultAccount, ["_id"]);

    const admin = new Admin(infoDetails);

    const resultSavedAdmin = await admin.save();
    const dynamicProfile = new DynamicProfile({
      userId: resultSavedAdmin._id,
      accountType: "Admin",
    });
    await dynamicProfile.save();
  }
};
