const accountType = {
  admin: "admin",
  teacher: "teacher",
  student: "student",
};

const indexNavigation = {
  myDashboard: {
    id: "dashboard",
    content: "My Dashboard",
    link: "#",
  },
  myCourses: {
    id: "courses",
    content: "My Courses",
    link: "/api/courses/my_courses",
  },
  siteAdmin: {
    id: "site_admin",
    content: "Site Administration",
    link: "/admin/site_admin",
  },
};

module.exports = { accountType, indexNavigation };
