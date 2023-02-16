const controller = require("../controller/controller");
const express = require("express");
const router = express.Router();
const authorization = require("../../middleware/authorization");
const globalObjects = require("../helper/globalObjects");

//******************************************************************
// testing area
router.get("/test", controller.testController);

router.put("/test", controller.testEnrollsStudent);

router.post("/test", controller.testAddAttendance);

//******************************************************************
// Android Java RESTful web services
router.get(
  "/mobile",
  authorization.tokenValidation,
  authorization.studentAccess,
  controller.mobileUserLogin
);

// Login from mobile
router.post("/mobile/auth", controller.authMobileUser);

// get all course's participants
router.get(
  "/mobile/course/participants",
  authorization.tokenValidation,
  authorization.studentAccess,
  controller.getAllParticipants
);

// get all attendances for a user on one course
router.get(
  "/mobile/course/attendances",
  authorization.tokenValidation,
  authorization.studentAccess,
  controller.getAllAttendances
);
//******************************************************************
//get request

router.get(
  "/api/course",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.displayCourse
);

router.get(
  "/api/course/participants",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.enrolledParticipants
);

router.get(
  "/api/course/participants/enrolls",
  controller.enrollsParticipantsOption
);

router.get("/", authorization.publicAccess, (req, res) => {
  res.render("index", {
    userInfos: req.user,
    navMenu: globalObjects.indexNavigation,
  });
});

router.get("/auth", authorization.publicAccess, (req, res) => {
  res.render("login", { userInfos: req.user });
});

router.get("/auth/logout", (req, res) => {
  res.clearCookie("x-auth-token");
  res.redirect("/auth");
});

router.get(
  "/api/courses/editCourse",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.displayCreateCourse
);

router.get(
  "/api/courses/editCategory",
  authorization.tokenValidation,
  authorization.adminAccess,
  controller.displayCreateCategory
);

router.get(
  "/api/courses/my_courses",
  authorization.tokenValidation,
  controller.getMyCourses
);

router.get(
  "/admin/site_admin",
  authorization.tokenValidation,
  authorization.adminAccess,
  controller.showAdminAccess
);

router.get(
  "/api/course/attendance",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.getAttendance
);

router.get(
  "/api/course/session_check",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.getSessionSingleCheck
);

// Admin access role only
router.get(
  "/users/add_user",
  authorization.tokenValidation,
  authorization.adminAccess,
  controller.showCreateNewUser
);
//******************************************************************

//******************************************************************
// post request
// create new user route
router.post("/auth", controller.authUser);

router.post(
  "/users/add_user",
  authorization.tokenValidation,
  controller.createUser
);

router.post(
  "/api/courses/editCategory",
  authorization.tokenValidation,
  controller.createCategory
);

router.post(
  "/api/courses/editCourse",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.createCourse,
  controller.displayCreateCourse
);

router.post(
  "/api/course/attendance",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.addAttendance
);

router.post(
  "/api/course/session_check/qrCode",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.createQRSession
);
//******************************************************************

//******************************************************************
// delete request
// request delete multiple courses
router.delete(
  "/api/courses",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.deleteCourses
);

// request delete single course
router.delete(
  "/api/courses/:sysId",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.deleteCourse
);

// delete QRCode session
router.delete(
  "/api/course/session_check/qrCode",
  authorization.tokenValidation,
  authorization.teacherAccess,
  controller.deleteQRCodeSession
);

//******************************************************************

//******************************************************************
// put/update request
// request update enrolled students to the course
router.put(
  "/api/course/participants/enrolls",
  controller.updateEnrolledStudents
);

router.put("/api/course/session_check", controller.saveAttendanceSession);

//******************************************************************

//******************************************************************
// rest from all routes above
router.get("/*", (req, res) => {
  res.render("404");
});
//******************************************************************
module.exports = router;
