const Joi = require("joi");
require("datejs");

// Validation for login form
module.exports.authValidation = function (obj) {
  const inputValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(255).required(),
  });
  return inputValidation.validate(obj);
};

// Validation for create new account user
module.exports.accountValidation = function (obj) {
  const inputValidation = Joi.object({
    firstName: Joi.string().min(1).max(255).required(),
    lastName: Joi.string().min(1).max(255).required(),
    birthdate: Joi.date().less("now").required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(255).required(),
    accountType: Joi.string().alphanum().min(1).max(255).required(),
  });
  return inputValidation.validate(obj);
};

// Validation for create new category
module.exports.categoryValidation = function (obj) {
  const inputValidation = Joi.object({
    categoryName: Joi.string().min(1).max(255).required(),
    categoryShortName: Joi.string().min(1).max(255).required().alphanum(),
    description: Joi.string().min(0).max(2505),
  });

  return inputValidation.validate(obj);
};

// module.exports.userValidation = function (obj) {
//   const userSchema = Joi.object({
//     firstName: Joi.string().min(1).max(255).required(),
//     lastName: Joi.string().min(1).max(255).required(),
//     username: Joi.string().min(4).max(255).alphanum().required(),
//     password: Joi.string().min(8).max(355).required(),
//   });
//   return userSchema.validate(obj);
// };

// Validation for create new course
module.exports.courseValidation = function (obj) {
  const inputValidation = Joi.object({
    courseName: Joi.string().required().min(1).max(255),
    courseShortName: Joi.string().required().min(1).max(255).alphanum(),
    category: Joi.string().alphanum().required(),
    startDate: Joi.date().greater("now").required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).required(),
    description: Joi.string().allow(null, "").max(2505),
    totalCreadit: Joi.number().min(1).max(1000).required(),
  });

  return inputValidation.validate(obj);
};

// Validation input for creating new attendance
module.exports.attendanceValidation = function (
  obj,
  courseStartDate,
  courseEndDate
) {
  const inputValidation = Joi.object({
    name: Joi.string().required().min(1).max(255).messages({
      "string.empty": "Name is not allowed to be empty!",
      "string.max":
        "Name length must be less than or equal to 255 characters long",
    }),
    description: Joi.string().allow(null, "").max(2505),
    typeGrade: Joi.string().min(1).max(100),
    grade: Joi.number().integer().min(1).max(2505).messages({
      "number.base": "Maximum grade must be a number!",
      "number.max": "Maximum grade must be less than or equal to 2505",
      "number.min": "Maximum grade must be greater than or equal to 1",
    }),
    minGrade: Joi.number()
      .integer()
      .min(1)
      .max(2505)
      .less(Joi.ref("grade"))
      .messages({
        "number.min": "Grade to pass must be greater than or equal to 1",
        "number.less": "Grade to pass must be less than Maximun grade!",
        "number.max": "Grade to pass must be less than or equal to 2505",
        "number.base": "Grade to pass must be a number!",
      }),

    startDate: Joi.date()
      .greater(courseStartDate)
      .messages({
        "date.greater": `Start Date must be greater than ${Date.parse(
          courseStartDate
        ).toLocaleDateString("en-GB")}`,
        "date.base": "Start Date must be a valid date",
      }),
    startTime: Joi.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.empty": "Start Time is not allowed to be empty",
        "string.pattern.base": "End Time is not a correct format!",
      }),
    endTime: Joi.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .messages({
        "string.empty": "End Time is not allowed to be empty",
        "string.pattern.base": "End Time is not a correct format!",
      }),
    endDate: Joi.date()
      .less(courseEndDate)
      .greater(Joi.ref("startDate"))
      .messages({
        "date.greater": `End Date must be greater than Start Date`,
        "date.base": "End Date must be a valid date",
        "date.less": `End Date must be less than ${Date.parse(
          courseEndDate
        ).toLocaleDateString("en-GB")}`,
      }),
    repeatDay: Joi.required().messages({
      "any.required": "Repeat Day must be at least one selected!",
    }),
    repeatTime: Joi.number().integer().min(1).max(4).messages({
      "number.base": "Select repeat number must be a number!",
      "number.max": "Select repeat number must be less than or equal to 4",
      "number.min": "Select repeat number must be greater than or equal to 1",
    }),
  });
  return inputValidation.validate(obj);
};

// Validation input for creating new classroom location
module.exports.classroomValidation = function (obj) {
  const inputValidation = Joi.object({
    classroomNumber: Joi.string().required().min(3).max(4),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  });

  return inputValidation.validate(obj);
};
