const accountType = {
  admin: "admin",
  teacher: "teacher",
  student: "student",
};

const indexNavigation = {
  myDashboard: { content: "My Dashboard", link: "/api/my_dashboard" },
  myCourses: { content: "My Courses", link: "/api/courses/my_courses" },
  siteAdmin: { content: "Site Administration", link: "/admin/site_admin" },
};

module.exports = { accountType, indexNavigation };
