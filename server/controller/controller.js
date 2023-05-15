const _ = require("lodash");
const bcrypt = require("bcrypt");
const ObjectId = require("mongoose").Types.ObjectId;
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const connection = require("../database/connection");

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
const Classroom = require("../model/classroom");

// Helper function import
const UIMessage = require("../helper/uiMessage");
const saveRoleUser = require("./saveRoleUser");
const globalObjects = require("../helper/globalObjects");
const DynamicProfile = require("../model/dynamicRef");
const extFuntion = require("../helper/additionalFunction");
require("datejs");

module.exports.createUser = async (req, res, next) => {
  // check if the body if the request are not empty
  const {error} = validation.accountValidation(req.body);
  if (error)
    return res.status(400).render("addUser", {alert: error.details[0].message});

  // check if the email is already existed
  const existedEmail = await Account.findOne({email: req.body.email});
  if (existedEmail)
    return res
      .status(400)
      .render("addUser", {alert: UIMessage.alert_existed_email});

  // generate an encrypted password using module called bcrypt
  const salt = await bcrypt.genSalt(12);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  // proceed saving user to database by calling saveRoleUser()
  const authRole = req.body.accountType;
  await saveRoleUser(authRole, req.body);

  return res
    .status(200)
    .redirect("/users/add_user", {alert: "User had been added!"});
};

module.exports.authUser = async (req, res, next) => {
  // check if the inputs are empty
  const {error} = validation.authValidation(req.body);
  const alert = UIMessage.alert_invalid_login;
  if (error) return res.status(400).render("login", {alert});

  // check if the email is not existed
  const user = await Account.findOne({email: req.body.email});
  if (!user) return res.status(400).render("login", {alert});

  // compare the input password with the password found on database
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).render("login", {alert});

  // generate a jwt token for storing on client-side
  const token = await user.generateAuthJWT();
  res.cookie("x-auth-token", token, {
    httpOnly: true,
    sameSite: "lax",
  });
  return res.status(200).redirect("/");
};

module.exports.createCategory = async (req, res, next) => {
  // validation input field
  const {error} = validation.categoryValidation(req.body);
  if (error)
    return res
      .status(400)
      .render("createCategory", {alert: error.details[0].message});

  // check if the category short name is already existed
  const existedShortNameCategory = await Category.findOne({
    categoryShortName: req.body.categoryShortName,
  });
  if (existedShortNameCategory)
    return res.status(400).render("createCategory", {
      alert: UIMessage.alert_existed_category_shortName,
    });

  // save category to database
  const category = new Category(
    _.pick(req.body, ["categoryName", "categoryShortName", "description"])
  );
  const result = await category.save();
  res.status(200).redirect("/");
};

// show create new category form
module.exports.displayCreateCategory = async (req, res, next) => {
  res.render("createCategory", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.siteAdmin.id,
  });
};

module.exports.createCourse = async (req, res, next) => {
  // validation an empty form. If empty, pass next() with error display to user
  const {error} = validation.courseValidation(req.body);
  if (error) {
    req.alertMessage = error.details[0].message;
    return next();
  }

  // check if the selected category is exited,
  // else pass next() with error display to user
  const existedCategory = await Category.findById(req.body.category);
  if (!existedCategory) {
    req.alertMessage = UIMessage.alert_notExisted_category;
    return next();
  }

  // same check for course short name
  const existedShortNameCourse = await Course.findOne({
    courseShortName: req.body.courseShortName,
  });
  if (existedShortNameCourse) {
    req.alertMessage = UIMessage.alert_existed_course_ShortName;
    return next();
  }

  // append creator to course, then same to database
  const dynamicProfile = await DynamicProfile.findOne({userId: req.user.id});
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
  return res.status(200).redirect("/api/courses/my_courses");
};

module.exports.displayCreateCourse = async (req, res, next) => {
  // get all categories
  const categories = await Category.find();
  const alert = req.alertMessage;
  return res.status(200).render("createCourse", {
    userInfos: req.user,
    categories,
    alert,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.myCourses.id,
  });
};

module.exports.getMyCourses = async (req, res, next) => {
  // get all categories, and all courses which created by user
  const categories = await Category.find();
  const dynamicProfile = await DynamicProfile.findOne({userId: req.user.id});
  const courses = await Course.find({creator: dynamicProfile.id})
    .populate("category", "categoryName")
    .populate("creator", "userId");
  for (let i in courses) {
    const demo = await DynamicProfile.findOne({
      userId: courses[i].creator.userId,
    }).populate("userId");
    courses[i].creatorName = `${demo.userId.firstName} ${demo.userId.lastName}`;
  }
  return res.status(200).render("myCourse", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.myCourses.id,
    categories,
    courses,
  });
};

module.exports.showAdminAccess = async (req, res, next) => {
  return res.status(200).render("site_admin", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.siteAdmin.id,
  });
};

module.exports.showCreateNewUser = async (req, res, next) => {
  return res.render("addUser", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.siteAdmin.id,
  });
};

// display single course detail
module.exports.displayCourse = async (req, res, next) => {
  if (ObjectId.isValid(req.query.sysId)) {
    const course = await Course.findById(req.query.sysId);
    if (course) {
      return res.render("courseDisplay", {
        course: course,
        userInfos: req.user,
        navMenu: globalObjects.indexNavigation,
        tabId: globalObjects.indexNavigation.myCourses.id,
      });
    }
  } else return res.redirect("/api/courses/my_courses");
};

// load students both enrolled and not yet enrolled to the popup select
module.exports.enrollsParticipantsOption = async (req, res, next) => {
  if (ObjectId.isValid(req.query.sysId)) {
    // get all students
    const allStudents = await Student.find().select("_id firstName lastName");

    // get students who are already enrolled to selected course
    const enrolledStudents = await Course.findById(req.query.sysId)
      .populate({
        path: "student",
        populate: {path: "accountLogin", select: "email"},
      })
      .select("student");

    //get students who are not enrolled yet
    const unenrolledStudents = allStudents.filter(
      // get element on the first array and find it on second array
      (element) =>
        !enrolledStudents.student.find(
          ({_id}) => element._id.toString() === _id.toString()
        )
    );
    return res.status(200).send({enrolledStudents, unenrolledStudents});
  } else next();
};

// get attandance
module.exports.getAttendance = async (req, res, next) => {
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
    return res.render("attendance", {
      course: course,
      userInfos: req.user,
      navMenu: globalObjects.indexNavigation,
      tabId: globalObjects.indexNavigation.myCourses.id,
    });
  } else return res.redirect("/api/course");
};

// get single session attendance
module.exports.getSessionSingleCheck = async (req, res, next) => {
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
    return res.render("sessionAttendance", {
      course: course,
      session: session,
      userInfos: req.user,
      navMenu: globalObjects.indexNavigation,
      tabId: globalObjects.indexNavigation.myCourses.id,
    });
  } else return res.redirect("/api/course");
};

// create qrcode session which store creator location and sessionId for mobile app verification
module.exports.createQRSession = async (req, res, next) => {
  const courseId = req.query.sysId;
  const sessionId = req.query.sessionId;

  // first, check if there is an existing QR Session. If exists, remove
  if (ObjectId.isValid(sessionId)) {
    await QRSession.findOneAndDelete({
      singleSessionId: sessionId,
    });
  } else next();

  // then start proceed creating new QR Session and saving to database
  const qrSession = req.body;
  qrSession.courseId = courseId;
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
      const qrCodeSession = await QRSession(qrSession).save();
      return res.send(qrCodeSession);
    }
  } else next();
};

// delete QRCode session with providing url or sessionId
module.exports.deleteQRCodeSession = async (req, res, next) => {
  const courseId = req.query.sysId;
  const sessionId = req.query.sessionId;
  const qrSession = req.body;
  if (ObjectId.isValid(courseId) && ObjectId.isValid(sessionId)) {
    const result = await QRSession.findOneAndDelete({
      singleSessionId: sessionId,
    });
    res.status(200).send(result);
  } else next();
};

// display participants on course detail parent > child > subchild
module.exports.enrolledParticipants = async (req, res, next) => {
  if (ObjectId.isValid(req.query.sysId)) {
    const course = await Course.findById(req.query.sysId).populate({
      path: "student",
      populate: {path: "accountLogin", select: "email"},
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

// update the enrolled students based new selection
module.exports.updateEnrolledStudents = async (req, res, next) => {
  const courseId = req.query.sysId;
  const update = {student: req.body.student};
  const courseSingleSessionsId = [];

  // check if the courseId is valid
  if (!ObjectId.isValid(courseId)) return res.redirect("/api/course");

  // find course by Id
  const course = await Course.findById(courseId).populate({
    path: "hasAttendance",
    populate: {
      path: "sessions.sessionRefs",
      populate: {
        path: "sessions",
      },
    },
  });

  if (course.hasAttendance == undefined) {
    await Course.findOneAndUpdate({_id: courseId}, update, {
      returnOriginal: true,
    });
    return res.status(200).send("Successfully updated!");
  }

  // get the students to remove from selected change
  const studentsToRemove = course.student.filter(
    (elem) => !req.body.student.includes(elem.toString())
  );
  // get the students to save from selected change
  const studentsToEnroll = req.body.student.filter(
    (elem) => !course.student.includes(elem)
  );
  // start transaction session
  const moveStudentsSession = await connection.startSession();
  try {
    //start a transaction
    moveStudentsSession.startTransaction();

    // get all sessions attendance
    course.hasAttendance.sessions.forEach((element) => {
      element.sessionRefs.sessions.forEach((session) => {
        courseSingleSessionsId.push(session._id);
      });
    });

    // add students to sessions attendance
    await SingleSession.updateMany(
      {_id: {$in: courseSingleSessionsId}},
      {
        $push: {
          students: {
            $each: studentsToEnroll.map((studentId) => ({student: studentId})),
          },
        },
      },
      {moveStudentsSession}
    );

    // remove students from the sessions attendance
    await SingleSession.updateMany(
      {_id: {$in: courseSingleSessionsId}},
      {
        $pull: {
          students: {
            student: {
              $in: studentsToRemove,
            },
          },
        },
      },
      {moveStudentsSession}
    );

    // update students in course
    await Course.findOneAndUpdate({_id: courseId}, update, {
      returnOriginal: true,
      moveStudentsSession,
    });

    //commit transaction
    await moveStudentsSession.commitTransaction();
    res.status(200).send("Successfully updated!");
  } catch (error) {
    await moveStudentsSession.abortTransaction();
    console.log(error);
    res.status(500).send("Couldn't update the enrollment students!");
    next();
  } finally {
    await moveStudentsSession.endSession();
  }
};

// create an attendance for course
module.exports.addAttendance = async (req, res, next) => {
  const data = req.body;
  const courseId = req.query.sysId;
  let arrayDates;

  // check if the courseId is valid
  if (ObjectId.isValid(courseId)) {
    const course = await Course.findById(courseId);
    // give response 400 for bad request
    if (!course) return res.status(400).send("Course could not be found");

    // check if the input is valid
    const {error} = validation.attendanceValidation(
      req.body,
      course.startDate,
      course.endDate
    );

    // if missing input, send the response bad request
    if (error)
      return res
        .status(400)
        .render("attendance", {alert: error.details[0].message, course});

    // create an array of sessions' date
    arrayDates = extFuntion.createArrayDates(
      req.body.repeatDay,
      data.startDate,
      data.endDate
    );

    const addSessionsAttendance = await connection.startSession();
    try {
      addSessionsAttendance.startTransaction();

      // 1.step: create new sessions with all students enrolled course
      const students = course.student;

      // append students to each date
      const singleSessionsSaved = await SingleSession.insertMany(
        extFuntion.createSessions(arrayDates, students),
        {session: addSessionsAttendance}
      );

      // get all sessionIds into array
      const arraySingleSessionIds =
        extFuntion.createArrayIds(singleSessionsSaved);

      // save all sessionIdsArray into session
      const sessionsSaved = await Session({
        sessions: arraySingleSessionIds,
      }).save(addSessionsAttendance);

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

      const attendanceSaved = await attendance.save({
        session: addSessionsAttendance,
      });

      // 4.step: add attendance _id to course
      course.hasAttendance = attendanceSaved._id;
      await course.save({session: addSessionsAttendance});

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
      await addSessionsAttendance.commitTransaction();
      return res
        .status(200)
        .redirect(`/api/course/attendance?sysId=${courseId}`);
    } catch (error) {
      await addSessionsAttendance.abortTransaction();
      console.log(error);
      res.status(500).send("Couldn't create attendance sessions!");
      next();
    } finally {
      await addSessionsAttendance.endSession();
    }
  } else return res.redirect("/api/course");
};

// show an form for creating a new class room location
module.exports.showCreateNewClassLocation = async (req, res, next) => {
  return res.render("addGeolocation", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
    tabId: globalObjects.indexNavigation.siteAdmin.id,
  });
};

// create new classroom
module.exports.createNewClassLocation = async (req, res, next) => {
  const {error} = validation.classroomValidation(req.body);
  if (error)
    return res
      .status(400)
      .render("addGeolocation", {alert: error.details[0].message});

  const classroom = new Classroom(
    _.pick(req.body, ["classroomNumber", "latitude", "longitude"])
  );
  await classroom.save();

  return res.status(200).redirect(`/api/courses/my_courses`);
};

// get all created classroom
module.exports.getCreatedClassroom = async (req, res, next) => {
  const classrooms = await Classroom.find();
  return res.status(200).send({classrooms});
};

// Start Mobile RESTful API
module.exports.mobileUserLogin = async (req, res, next) => {
  const userId = req.user.id;
  const courses = await Course.find({student: userId})
    .populate("category", "categoryName -_id")
    .select("courseName courseShortName categoryName");
  if (!courses) return res.status(200).send([]);
  return res.status(200).send(courses);
};

module.exports.getAllParticipants = async (req, res) => {
  const errorMessage = "Invalid Requested!";
  const courseId = req.query._id;
  if (ObjectId.isValid(courseId)) {
    const participants = await Course.findById(courseId)
      .populate("student", "firstName lastName accountLogin")
      .select("student -_id");
    return res.status(200).send(participants.student);
  } else return res.status(400).send({errorMessage});
};

module.exports.authMobileUser = async (req, res, next) => {
  // valid if the input are not empty
  const errorMessage = UIMessage.alert_invalid_login;
  const {error} = validation.authValidation(req.body);
  if (error) return res.status(400).send({errorMessage});

  // check if the email is not existed
  const user = await Account.findOne({email: req.body.email});
  if (!user) return res.status(400).send({errorMessage});

  // comparing a password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send({errorMessage});

  // generate token
  const token = await user.generateAuthJWT();
  const student = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

  // find all courses that student is enrolled
  const courses = await Course.find({student: student.id})
    .populate("category", "categoryName -_id")
    .select("courseName courseShortName categoryName");
  if (!courses) return res.status(200).send([]);
  return res.status(200).send({token, courses});
};

module.exports.getAllAttendances = async (req, res, next) => {
  let allSessions = [];
  let attendances = [];
  const errorMessage = "Invalid Requested!";
  const userId = req.user.id;
  const courseId = req.query._id;
  if (ObjectId.isValid(courseId)) {
    const course = await Course.findById(courseId)
      .populate({
        path: "hasAttendance",
        select: "sessions",
        populate: {
          path: "sessions.sessionRefs",
          populate: {
            path: "sessions",
          },
        },
      })
      .select("courseName-_id");

    if (!course) return res.status(200).send([]);
    if (!ObjectId.isValid(course.hasAttendance))
      return res.status(200).send([]);
    // function and iteration to get an attendance for single student;
    for (let sessions1 of course.hasAttendance.sessions) {
      for (let sessions2 of sessions1.sessionRefs.sessions) {
        allSessions.push(sessions2);
      }
    }

    for (let session of allSessions) {
      for (let student of session.students) {
        if (student.student == userId) {
          attendances.push({
            isPresent: student.isPresent,
            point: student.point,
            date: session.date.toLocaleDateString("en-GB"),
            id: session._id,
          });
        }
      }
    }

    return res.status(200).send(attendances);
  } else return res.status(400).send({errorMessage});
};

module.exports.getQRSessionOneStudent = async (req, res) => {
  let sessionStored = {};
  const errorMessage = "Invalid Requested!";
  const userId = req.user.id;
  const sessionId = req.query.sessionId;

  const result = await QRSession.findOne({sessionId: sessionId})
    .populate("singleSessionId")
    .populate("courseId");
  if (result) {
    const students = result.singleSessionId.students;
    for (let student of students) {
      if (student.student == userId) {
        sessionStored.maxLength = result.maxLength;
        sessionStored.objectLocation = result.objectLocation;
        sessionStored.unitSessionId = result.singleSessionId._id;
        sessionStored.courseName = result.courseId.courseName;
      }
    }
    if (Object.keys(sessionStored).length != 0)
      return res.status(200).send(sessionStored);
    else return res.status(404).send(errorMessage);
  }
  return res.status(400).send(errorMessage);
};

module.exports.submitAttendance = async (req, res) => {
  const errorMessage = "Invalid Requested!";
  const userId = req.user.id;
  const unitSessionId = req.query.unitSessionId;
  if (ObjectId.isValid(unitSessionId) && ObjectId.isValid(userId)) {
    const updatedSingleSession = await SingleSession.findByIdAndUpdate(
      unitSessionId,
      {$set: {"students.$[elem].isPresent": "present"}},
      {arrayFilters: [{"elem.student": userId}], new: true}
    );
    return res.status(200).send({successUpdated: UIMessage.successUpdated});
  }
  return res.status(400).send(errorMessage);
};

// End Mobile RESTful API

// Functions that are not needed to modify now

// controller to delete many courses
module.exports.deleteCourses = async (req, res) => {
  const result = await Course.deleteMany({_id: {$in: req.query.sysId}});
  return res.status(200).send(result);
};

// controller to delete single course
module.exports.deleteCourse = async (req, res) => {
  const result = await Course.deleteOne({_id: req.params.sysId});
  return res.send(result);
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
      await SingleSession.findOneAndUpdate(
        {_id: sessionId},
        {students: req.body},
        {new: true}
      );
      return res
        .status(200)
        .redirect(
          `/api/course/session_check?sysId=${courseId}&sessionId=${sessionId}`
        );
    }
  } else return res.redirect("/api/course");
};
// End functions that are not needed to modify now
