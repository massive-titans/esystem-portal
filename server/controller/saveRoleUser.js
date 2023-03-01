const _ = require("lodash");
const connection = require("../database/connection");

const globalObjects = require("../helper/globalObjects");
const Account = require("../model/account");
const Student = require("../model/student");
const Teacher = require("../model/teacher");
const Admin = require("../model/admin");
const DynamicProfile = require("../model/dynamicRef");

module.exports = async function (role, obj) {
  // start transaction session
  const session = await connection.startSession();
  try {
    // start transaction
    session.startTransaction();
    const account = new Account(
      _.pick(obj, ["email", "password", "accountType"])
    );
    await account.save({session});

    // check which role is the assign to new user, then navigate to correct role table
    if (role == globalObjects.accountType.student) {
      const infoDetails = _.pick(obj, ["firstName", "lastName", "birthdate"]);
      infoDetails.accountLogin = _.pick(account, ["_id"]);

      const student = new Student(infoDetails);
      await student.save({session});

      const dynamicProfile = new DynamicProfile({
        userId: student._id,
        accountType: "Student",
      });
      await dynamicProfile.save({session});
    }
    if (role == globalObjects.accountType.teacher) {
      const infoDetails = _.pick(obj, ["firstName", "lastName", "birthdate"]);
      infoDetails.accountLogin = _.pick(account, ["_id"]);

      const teacher = new Teacher(infoDetails);
      await teacher.save({session});

      const dynamicProfile = new DynamicProfile({
        userId: teacher._id,
        accountType: "Teacher",
      });
      await dynamicProfile.save({session});
    }
    if (role == globalObjects.accountType.admin) {
      const infoDetails = _.pick(obj, ["firstName", "lastName", "birthdate"]);
      infoDetails.accountLogin = _.pick(account, ["_id"]);

      const admin = new Admin(infoDetails);
      await admin.save({session});

      const dynamicProfile = new DynamicProfile({
        userId: admin._id,
        accountType: "Admin",
      });
      await dynamicProfile.save({session});
    }

    //Finish Transaction
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log("Failed to create new user!");
  }
  session.endSession();
};
