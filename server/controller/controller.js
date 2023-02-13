const _ = require("lodash");
const bcrypt = require("bcrypt");
const ObjectId = require("mongoose").Types.ObjectId;
const QRCode = require("qrcode");

// Schema import
const validation = require("../helper/validation");
const Attendance = require("../model/attendance");
const Session = require("../model/session");
const SingleSession = require("../model/singleSession");
const Account = require("../model/account");
const Category = require("../model/category");
const Course = require("../model/course");
const Student = require("../model/student");
const QRSession = require("../model/qrcodesession");

// Helper function import
const UIMessage = require("../helper/uiMessage");
const saveRoleUser = require("./saveRoleUser");
const globalObjects = require("../helper/globalObjects");
const DynamicProfile = require("../model/dynamicRef");
const extFuntion = require("../helper/additionalFunction");
require("datejs");

module.exports.createUser = async (req, res) => {
  const { error } = validation.accountValidation(req.body);
  if (error) {
    const alert = error.details[0].message;
    console.log(error.details);
    res.status(400).render("addUser", { alert });
    return;
  }

  const existedEmail = await Account.findOne({ email: req.body.email });
  if (existedEmail)
    return res
      .status(400)
      .render("addUser", { alert: UIMessage.alert_existed_email });

  const salt = await bcrypt.genSalt(12);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  const authRole = req.body.accountType;
  await saveRoleUser(authRole, req.body);

  res.redirect("/users/add_user");
};

module.exports.authUser = async (req, res) => {
  const { error } = validation.authValidation(req.body);
  const alert = UIMessage.alert_invalid_login;
  if (error) return res.status(400).render("login", { alert });

  const user = await Account.findOne({ email: req.body.email });
  if (!user) return res.status(400).render("login", { alert });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).render("login", { alert });

  const token = await user.generateAuthJWT();
  res.cookie("x-auth-token", token, {
    httpOnly: true,
    sameSite: "lax",
  });
  res.status(200).redirect("/");
};

// create category
module.exports.createCategory = async (req, res) => {
  const { error } = validation.categoryValidation(req.body);
  if (error) {
    const alert = error.details[0].message;
    res.status(400).render("createCategory", { alert });
    return;
  }

  const existedShortNameCategory = await Category.findOne({
    categoryShortName: req.body.categoryShortName,
  });

  if (existedShortNameCategory) {
    const alert = UIMessage.alert_existed_category_shortName;
    res.status(400).render("createCategory", { alert });
    return;
  }

  const category = new Category(
    _.pick(req.body, ["categoryName", "categoryShortName", "description"])
  );

  const result = await category.save();
  res.status(200).redirect("/");
};

// show create new category form
module.exports.displayCreateCategory = async (req, res) => {
  res.render("createCategory", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.siteAdmin.id,
  });
};

// create course
module.exports.createCourse = async (req, res, next) => {
  const { error } = validation.courseValidation(req.body);
  if (error) {
    req.alertMessage = error.details[0].message;
    return next();
  }
  const existedCategory = await Category.findById(req.body.category);
  if (!existedCategory) {
    req.alertMessage = UIMessage.alert_notExisted_category;
    return next();
  }
  const existedShortNameCourse = await Course.findOne({
    courseShortName: req.body.courseShortName,
  });
  if (existedShortNameCourse) {
    req.alertMessage = UIMessage.alert_existed_course_ShortName;
    return next();
  }

  const dynamicProfile = await DynamicProfile.findOne({ userId: req.user.id });

  const course = new Course(
    _.pick(req.body, [
      "courseName",
      "courseShortName",
      "category",
      "startDate",
      "endDate",
      "description",
      "totalCreadit",
    ])
  );
  course.creator = dynamicProfile._id;

  await course.save();
  res.status(200).redirect("/api/courses/my_courses");
};

// show create new course form
module.exports.displayCreateCourse = async (req, res) => {
  const categories = await Category.find();
  const alert = req.alertMessage;
  res.status(200).render("createCourse", {
    userInfos: req.user,
    categories,
    alert,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.myCourses.id,
  });
};

module.exports.getMyCourses = async (req, res) => {
  const categories = await Category.find();

  const dynamicProfile = await DynamicProfile.findOne({ userId: req.user.id });

  const courses = await Course.find({ creator: dynamicProfile.id })
    .populate("category", "categoryName")
    .populate("creator", "userId");

  for (let i in courses) {
    const demo = await DynamicProfile.findOne({
      userId: courses[i].creator.userId,
    }).populate("userId");

    courses[i].creatorName = `${demo.userId.firstName} ${demo.userId.lastName}`;
  }
  res.status(200).render("myCourse", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.myCourses.id,
    categories,
    courses,
  });
};

// display extra admin access tabs
module.exports.showAdminAccess = async (req, res) => {
  res.status(200).render("site_admin", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.siteAdmin.id,
  });
};

// show create new user form
module.exports.showCreateNewUser = async (req, res) => {
  res.render("addUser", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.siteAdmin.id,
  });
};

// controller to delete many courses
module.exports.deleteCourses = async (req, res) => {
  const result = await Course.deleteMany({ _id: { $in: req.query.sysId } });
  res.status(200).send(result);
};

// controller to delete single course
module.exports.deleteCourse = async (req, res) => {
  const result = await Course.deleteOne({ _id: req.params.sysId });
  res.send(result);
};

// display single course detail
module.exports.displayCourse = async (req, res) => {
  if (ObjectId.isValid(req.query.sysId)) {
    const course = await Course.findById(req.query.sysId);
    if (course) {
      res.render("courseDisplay", {
        course: course,
        userInfos: req.user,
        navMenu: globalObjects.indexNavigation,
        tabId: globalObjects.indexNavigation.myCourses.id,
      });
    }
  } else res.redirect("/api/courses/my_courses");
};

// display participants on course detail parent > child > subchild
module.exports.enrolledParticipants = async (req, res) => {
  if (ObjectId.isValid(req.query.sysId)) {
    const course = await Course.findById(req.query.sysId).populate({
      path: "student",
      populate: { path: "accountLogin", select: "email" },
    });
    if (course) {
      res.render("participants", {
        course: course,
        userInfos: req.user,
        navMenu: globalObjects.indexNavigation,
        tabId: globalObjects.indexNavigation.myCourses.id,
      });
    }
  } else res.redirect("/api/course");
};

// load students both enrolled and not yet enrolled to the popup select
module.exports.enrollsParticipantsOption = async (req, res) => {
  if (ObjectId.isValid(req.query.sysId)) {
    const allStudents = await Student.find().select("_id firstName lastName");

    const enrolledStudents = await Course.findById(req.query.sysId)
      .populate({
        path: "student",
        populate: { path: "accountLogin", select: "email" },
      })
      .select("student");

    const unenrolledStudents = allStudents.filter(
      // get element on the first array and find it on second array
      (element) =>
        !enrolledStudents.student.find(
          ({ _id }) => element._id.toString() === _id.toString()
        )
    );
    res.send({ enrolledStudents, unenrolledStudents });
  }
};

// update the enrolled students based new selection
module.exports.updateEnrolledStudents = async (req, res) => {
  const courseId = req.query.sysId;
  const update = { student: req.body.student };
  if (ObjectId.isValid(courseId)) {
    try {
      const result = await Course.findOneAndUpdate({ _id: courseId }, update, {
        returnOriginal: true,
      });
      res.send(result);
    } catch (error) {
      res.redirect("/api/course");
    }
  } else res.redirect("/api/course");
};

// get attandance
module.exports.getAttendance = async (req, res) => {
  const courseId = req.query.sysId;
  if (ObjectId.isValid(courseId)) {
    const course = await Course.findById(courseId).populate({
      path: "hasAttendance",
      select: "sessions",
      populate: {
        path: "sessions.sessionRefs",
        populate: {
          path: "sessions",
        },
      },
    });
    res.render("attendance", {
      course: course,
      userInfos: req.user,
      navMenu: globalObjects.indexNavigation,
      tabId: globalObjects.indexNavigation.myCourses.id,
    });
  }
};

// create an attendance for course
module.exports.addAttendance = async (req, res) => {
  const data = req.body;
  const courseId = req.query.sysId;
  let arrayDates;
  if (ObjectId.isValid(courseId)) {
    const course = await Course.findById(courseId);
    const { error } = validation.attendanceValidation(
      req.body,
      course.startDate,
      course.endDate
    );
    if (error) {
      const alert = error.details[0].message;
      res.status(400).render("attendance", { alert, course });
      return;
    } else {
      arrayDates = extFuntion.createArrayDates(
        req.body.repeatDay,
        data.startDate,
        data.endDate
      );
      const Ids = [];
      // 1.step: create new sessions with all students enrolled course
      const students = course.student;

      // append students to each date
      const singleSessionsSaved = await SingleSession.insertMany(
        extFuntion.createSessions(arrayDates, students)
      );

      // get all sessionIds into array
      const arraySingleSessionIds =
        extFuntion.createArrayIds(singleSessionsSaved);

      // save all sessionIdsArray into session
      const sessionsSaved = await Session({
        sessions: arraySingleSessionIds,
      }).save();

      // 2.step: create new attendance
      const attendance = new Attendance(
        _.pick(data, ["name", "description", "typeGrade", "grade", "minGrade"])
      );

      //3.step add sessions ref ObjectId to attendance
      attendance.sessions.push({
        sessionRefs: sessionsSaved._id,
        attendanceType: data.attendanceType,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      const attendanceSaved = await attendance.save();

      // 4.step: add attendance _id to course
      course.hasAttendance = attendanceSaved._id;
      await course.save();

      const courseFull = await Course.findById(courseId).populate({
        path: "hasAttendance",
        select: "sessions",
        populate: {
          path: "sessions.sessionRefs",
          populate: {
            path: "sessions",
          },
        },
      });

      res.render("attendance", { course: courseFull });
      // res.send(courseFull);
    }
  }
};

// get single session attendance
module.exports.getSessionSingleCheck = async (req, res) => {
  const courseId = req.query.sysId;
  const sessionId = req.query.sessionId;
  if (ObjectId.isValid(courseId) && ObjectId.isValid(sessionId)) {
    const course = await Course.findById(courseId)
      .populate({
        path: "hasAttendance",
        select: "sessions",
        populate: {
          path: "sessions.sessionRefs",
          populate: {
            path: "sessions",
            populate: {
              path: "students.student",
              populate: {
                path: "accountLogin",
                select: "email",
              },
            },
          },
        },
      })
      .select("courseName");
    const session = extFuntion.getSingleSession(
      course.hasAttendance.sessions,
      sessionId
    );
    res.render("sessionAttendance", {
      course: course,
      session: session,
      userInfos: req.user,
      navMenu: globalObjects.indexNavigation,
    });
  } else {
    res.redirect("/*");
  }
  // const result = await SingleSession.findById(sessionId);
  // res.send(result);
};

// save attendance session after modify
module.exports.saveAttendanceSession = async (req, res) => {
  const courseId = req.query.sysId;
  const sessionId = req.query.sessionId;
  if (ObjectId.isValid(courseId) && ObjectId.isValid(sessionId)) {
    const course = await Course.findById(courseId)
      .populate({
        path: "hasAttendance",
        select: "sessions",
        populate: {
          path: "sessions.sessionRefs",
          populate: {
            path: "sessions.students.student",
          },
        },
      })
      .select("courseName");
    const session = extFuntion.getSingleSession(
      course.hasAttendance.sessions,
      sessionId
    );
    if (session) {
      const result = await SingleSession.findOneAndUpdate(
        { _id: sessionId },
        { students: req.body },
        { new: true }
      );
      res.send(result);
    }
  } else {
    res.redirect("/*");
  }
};

// create qrcode session which store creator location and sessionId for mobile app verification
module.exports.createQRSession = async (req, res) => {
  const courseId = req.query.sysId;
  const sessionId = req.query.sessionId;
  const qrSession = req.body;
  qrSession.sessionId = extFuntion.createUUID();
  qrSession.singleSessionId = sessionId;
  if (ObjectId.isValid(courseId) && ObjectId.isValid(sessionId)) {
    const course = await Course.findById(courseId)
      .populate({
        path: "hasAttendance",
        select: "sessions",
        populate: {
          path: "sessions.sessionRefs",
          populate: {
            path: "sessions.students.student",
          },
        },
      })
      .select("courseName");
    const session = extFuntion.getSingleSession(
      course.hasAttendance.sessions,
      sessionId
    );
    if (session) {
      try {
        const qrCodeSession = await QRSession(qrSession).save();
        res.send(qrCodeSession);
      } catch (error) {
        console.log(error);
      }
    }
  }
};

// delete QRCode session with providing url or sessionId
module.exports.deleteQRCodeSession = async (req, res) => {
  const courseId = req.query.sysId;
  const sessionId = req.query.sessionId;
  const qrSession = req.body;
  if (ObjectId.isValid(courseId) && ObjectId.isValid(sessionId)) {
    try {
      await QRSession.findOneAndDelete({ singleSessionId: sessionId });
    } catch (error) {
      console.log("Error", new Error(error));
    }
  }
};

// Start Mobile RESTful API
module.exports.mobileUserLogin = async (req, res) => {
  const universityId = req.user.id;
  const courses = await Course.find({ student: universityId }).select(
    "courseName courseShortName category"
  );

  res.send(courses);
};

module.exports.authMobileUser = async (req, res) => {
  const { error } = validation.authValidation({
    email: req.query.email,
    password: req.query.password,
  });

  if (error) return res.status(400).send(error);

  const user = await Account.findOne({ email: req.query.email });
  if (!user) return res.status(400).send("Invalid email or password!");

  const validPassword = await bcrypt.compare(req.query.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password!");

  const token = await user.generateAuthJWT();
  res.status(200).send("Token: " + token);
};
// End Mobile RESTful API

// Start testing part
// update student to course
module.exports.testEnrollsStudent = async (req, res) => {
  if (ObjectId.isValid(req.query.sysId)) {
    // convert array sringId to array objectId
    const arrayId = [];
    for (let i = 0; i < req.body.student.length; i++) {
      arrayId.push({ student: req.body.student[i] });
    }

    const update = { students: arrayId };
    try {
      const course = await Course.findOneAndUpdate(
        { _id: req.query.sysId },
        update,
        {
          overwrite: false,
          upsert: true,
          returnOriginal: false,
        }
      );
      res.send(course);
    } catch (error) {
      console.log("Error: ", error);
    }
  } else res.send("Course not found!");
};

// get student record and timestamps
module.exports.testController = async (req, res) => {
  if (ObjectId.isValid(req.query.sysId)) {
    const course = await Course.findById(req.query.sysId).populate({
      path: "student",
      populate: { path: "accountLogin", select: "email" },
    });
    if (course) {
      res.send(course);
    }
  } else res.send("Course not found!");
};

module.exports.testAddAttendance = async (req, res) => {
  const data = req.body;
  const repeatDate = extFuntion.arrayValidation(req.body.repeatDay);
  const arrayDates = [];
  for (let i = 0; i < repeatDate.length; i++) {
    switch (repeatDate[i]) {
      case "monday":
        extFuntion.checkMonday(data.startDate, data.endDate, arrayDates);
        break;
      case "tuesday":
        extFuntion.checkTuesday(data.startDate, data.endDate, arrayDates);
        break;
      case "wednesday":
        extFuntion.checkWednesday(data.startDate, data.endDate, arrayDates);
        break;
      case "thursday":
        extFuntion.checkThursday(data.startDate, data.endDate, arrayDates);
        break;
      case "friday":
        extFuntion.checkFriday(data.startDate, data.endDate, arrayDates);
        break;
      case "saturday":
        extFuntion.checkSaturday(data.startDate, data.endDate, arrayDates);
        break;
      case "sunday":
        extFuntion.checkSunday(data.startDate, data.endDate, arrayDates);
        break;
    }
  }
  res.send(arrayDates.sort((date1, date2) => date1 - date2));
};
// End testing part
