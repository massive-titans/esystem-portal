const ObjectId = require("mongoose").Types.ObjectId;
const SingleSession = require("../model/singleSession");
const { v4: uuidv4 } = require("uuid");

// convert string to array if not
arrayValidation = (array) => {
  if (!Array.isArray(array)) {
    return [array];
  } else return array;
};

// check monday
checkMonday = function (startDate, endDate, array) {
  let sessionDate;
  if (new Date(startDate).getDay() !== 1)
    sessionDate = new Date(startDate).monday();
  else sessionDate = new Date(startDate);
  while (new Date(sessionDate).getTime() <= new Date(endDate).getTime()) {
    let temDate = sessionDate;
    array.push(sessionDate);
    sessionDate = new Date(temDate).monday();
  }
};

// check tuesday
checkTuesday = (startDate, endDate, array) => {
  let sessionDate;
  if (new Date(startDate).getDay() !== 2)
    sessionDate = new Date(startDate).tuesday();
  else sessionDate = new Date(startDate);
  while (new Date(sessionDate).getTime() <= new Date(endDate).getTime()) {
    let temDate = sessionDate;
    array.push(sessionDate);
    sessionDate = new Date(temDate).tuesday();
  }
};

// check wednesday
checkWednesday = (startDate, endDate, array) => {
  let sessionDate;
  if (new Date(startDate).getDay() !== 3)
    sessionDate = new Date(startDate).wednesday();
  else sessionDate = new Date(startDate);
  while (new Date(sessionDate).getTime() <= new Date(endDate).getTime()) {
    let temDate = sessionDate;
    array.push(sessionDate);
    sessionDate = new Date(temDate).wednesday();
  }
};

// check thursday
checkThursday = (startDate, endDate, array) => {
  let sessionDate;
  if (new Date(startDate).getDay() !== 4)
    sessionDate = new Date(startDate).thursday();
  else sessionDate = new Date(startDate);
  while (new Date(sessionDate).getTime() <= new Date(endDate).getTime()) {
    let temDate = sessionDate;
    array.push(sessionDate);
    sessionDate = new Date(temDate).thursday();
  }
};

// check friday
checkFriday = (startDate, endDate, array) => {
  let sessionDate;
  if (new Date(startDate).getDay() !== 5)
    sessionDate = new Date(startDate).friday();
  else sessionDate = new Date(startDate);
  while (new Date(sessionDate).getTime() <= new Date(endDate).getTime()) {
    let temDate = sessionDate;
    array.push(sessionDate);
    sessionDate = new Date(temDate).friday();
  }
};

// check saturday
checkSaturday = (startDate, endDate, array) => {
  let sessionDate;
  if (new Date(startDate).getDay() !== 5)
    sessionDate = new Date(startDate).saturday();
  else sessionDate = new Date(startDate);
  while (new Date(sessionDate).getTime() <= new Date(endDate).getTime()) {
    let temDate = sessionDate;
    array.push(sessionDate);
    sessionDate = new Date(temDate).saturday();
  }
};

// check sunday
checkSunday = (startDate, endDate, array) => {
  let sessionDate;
  if (new Date(startDate).getDay() !== 5)
    sessionDate = new Date(startDate).sunday();
  else sessionDate = new Date(startDate);
  while (new Date(sessionDate).getTime() <= new Date(endDate).getTime()) {
    let temDate = sessionDate;
    array.push(sessionDate);
    sessionDate = new Date(temDate).sunday();
  }
};

// create array session dates between two dates
module.exports.createArrayDates = (repeatDates, startDate, endDate) => {
  const dates = [];
  const repeatDate = arrayValidation(repeatDates);
  for (let i = 0; i < repeatDate.length; i++) {
    switch (repeatDate[i]) {
      case "monday":
        checkMonday(startDate, endDate, dates);
        break;
      case "tuesday":
        checkTuesday(startDate, endDate, dates);
        break;
      case "wednesday":
        checkWednesday(startDate, endDate, dates);
        break;
      case "thursday":
        checkThursday(startDate, endDate, dates);
        break;
      case "friday":
        checkFriday(startDate, endDate, dates);
        break;
      case "saturday":
        checkSaturday(startDate, endDate, dates);
        break;
      case "sunday":
        checkSunday(startDate, endDate, dates);
        break;
    }
  }
  return dates.sort((date1, date2) => date1 - date2);
};

// return correct single session from array in object based on sessionId
module.exports.getSingleSession = (array, sessionId) => {
  for (let element of array) {
    for (let session of element.sessionRefs.sessions) {
      if (session._id == sessionId) return session;
    }
  }
};

module.exports.createSessions = (arrayDates, arrayStudents) => {
  const sessions = [];
  for (let i = 0; i < arrayDates.length; i++) {
    let singlesession = new SingleSession();
    singlesession.date = arrayDates[i];
    for (let j = 0; j < arrayStudents.length; j++) {
      singlesession.students.push({ student: arrayStudents[j] });
    }
    sessions.push(singlesession);
  }
  return sessions;
};

module.exports.createArrayIds = (array) => {
  const ids = [];
  for (let element of array) {
    ids.push(element._id);
  }
  return ids;
};

// create UUID
module.exports.createUUID = () => {
  return uuidv4();
};
