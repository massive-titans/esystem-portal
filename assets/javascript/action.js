const BASE_URL = "https://esystem-portal.herokuapp.com";
import {
  confirm,
  enrollment,
  warningBox,
  qrCodeInputBox,
  displayQRCode,
} from "./actionHelper.js";

const qrCodeBody = `<form class="qrcode-form">
<div class="margin-bottom-1">
  <label for="">Maximum Length</label>
  <select name="maxLength" id="maxLength">
    <option value="10" selected>10&nbsp;m</option>
    <option value="15">15&nbsp;m</option>
    <option value="20">20&nbsp;m</option>
    <option value="30">30&nbsp;m</option>
    <option value="50">50&nbsp;m</option>
  </select>
</div>
<div>
  <label for="">Attendance Duration</label>
  <select name="attendanceDuration" id="attendanceDuration">
    <option value="5" selected>5&nbsp;min</option>
    <option value="10">10&nbsp;min</option>
    <option value="20">20&nbsp;min</option>
    <option value="30">30&nbsp;min</option>
  </select>
</div
</form>`;

// Select sort course by category
$(function () {
  $("#sortCoursesByCategory").on("change", function () {
    // get value from select option
    let filter = $("#sortCoursesByCategory option:selected")
      .text()
      .toUpperCase()
      .trim();

    if (filter !== "ALL") $("#categoryTitleDisplay").text(filter);
    else $("#categoryTitleDisplay").text("All My Courses");

    let tr = $("#myCoursesTable tr");
    tr.each(function (index) {
      if (index !== 0) {
        let row = $(this);
        let categoryCell = row.find("td:nth-child(3)").text().toUpperCase();
        // alert(categoryCell);
        if (filter !== "ALL") {
          if (categoryCell === filter) row.show();
          else row.hide();
        } else row.show();
      }
    });
  });
});

// form create and append attr and value on button delete
$(function () {
  $("#btnDeleteCourses").on("click", function () {
    $("html").css("overflow-y", "hidden");

    const courseIds = [];
    // get form by id
    $("#myCoursesTable tr input[type=checkbox]:checked").each(function () {
      const row = $(this).closest("tr");
      let column = $("td:nth-child(2)", row);
      // let sysId = result.find("input").val();
      courseIds.push(column.find("input").val());
    });

    confirm(
      "Confirm deletion",
      "Are you sure to delete these all items?",
      "Yes",
      "Cancel",
      function () {
        deleteCourses(courseIds);
      }
    );
  });
});

// axios delete courses request
const deleteCourses = async (array) => {
  try {
    const result = await axios({
      url: `${BASE_URL}/api/courses`,
      method: "delete",
      params: {
        sysId: array,
      },
    });
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
};

// button delete from each row click
$(function () {
  const btnCourseDelete = $("#myCoursesTable tbody tr td a.courseDelete");
  btnCourseDelete.click(function () {
    const sysId = $(this).attr("data-id");
    deleteCourse(sysId);
  });
});

const deleteCourse = async (id) => {
  try {
    await axios({url: `${BASE_URL}/api/courses/${id}`, method: "delete"});
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
};

// This function is used for Courses.
// if at least one checkbox select, then the move and delete button will be enable
$(function () {
  const checkboxs = $(".records_tables input[type=checkbox]");
  const group_button_enable = $(".group_button");
  const btnMoveCourse = $("#btnMoveCourses");
  const selectMoveCategory = $("#selectCategoryMove");
  checkboxs.on("change", function () {
    if (checkboxs.is(":checked")) {
      $(btnMoveCourse).attr("disabled", false);
      $(selectMoveCategory).attr("disabled", false);
      $(group_button_enable).attr("disabled", false);
    } else {
      $(btnMoveCourse).attr("disabled", true);
      $(selectMoveCategory).attr("disabled", true);
      $(group_button_enable).attr("disabled", true);
    }
  });
});

// This function is used for Participants.
// if at least one checkbox select, then the move and delete button will be enable
$(function () {});

// when enroll student's button click, the function is called to fetch students and display
$(function () {
  $("#enrollStudents").click(function () {
    showParticipants();
  });
});

// get students not enrolled
function showParticipants() {
  const urlSplit = window.location.href.split("?");
  const pathUrl = window.location.pathname;
  const url = `${BASE_URL}${pathUrl}/enrolls?${urlSplit[1]}`;
  $("html").css("overflow-y", "hidden");
  axios
    .get(url)
    .then((response) => {
      const enrolledStudents = response.data.enrolledStudents.student;
      const unenrolledStudents = response.data.unenrolledStudents;
      enrollment(unenrolledStudents, enrolledStudents, "Cancel", "Save", url);
    })
    .catch((error) => {
      console.log(error);
    });
}

// Select type grade event
$(function () {
  $("#selectTypeGrade").change(function () {
    if ($(".inputGrade").is(":disabled")) {
      $(".inputGrade").prop("disabled", false);
    } else {
      $(".inputGrade").val("10");
      $(".inputGrade").prop("disabled", true);
    }
  });
});

// TODO: Save Attendance event click
$(function () {
  $("#btnSaveAttendanceSession").on("click", async function () {
    const update = [];
    //get a url to update the attendance
    const url = `${window.location.pathname}?${
      window.location.href.split("?")[1]
    }`;

    //get an Id and attendance status
    $("#singleSessionRecord tr").each(function (index) {
      if (index !== 0) {
        update.push({
          student: $(this).find("td:eq(0) input").val().trim(),
          isPresent: $(this).find("td:eq(3) input[type=radio]:checked").val(),
        });
      }
    });
    // send update to update the attendance in database
    try {
      await axios({
        method: "put",
        url: url,
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  });
});

// Button event remove students click
$(function () {
  $("#btnRemoveStudents").on("click", function () {
    $("html").css("overflow-y", "hidden");

    const studentIds = [];
    // get form by id
    $("#participantsTable tbody tr input[type=checkbox]:checked").each(
      function () {
        const row = $(this).closest("tr");
        let column = $("td:nth-child(2)", row);
        studentIds.push(column.find(".participant_id").val());
      }
    );

    confirm(
      "Confirm deletion",
      "Are you sure to delete these all items?",
      "Yes",
      "Cancel",
      function () {
        // deleteCourses(courseIds);
      }
    );
  });
});

// Button event generate and display QR Code
$(function () {
  $("#btnGenerateQR").on("click", function () {
    if (navigator.geolocation) {
      $("html").css("overflow-y", "hidden");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          qrCodeInputBox(
            "Generate QR Code",
            "Generate",
            "Cancel",
            qrCodeBody,
            function () {
              createQRCode(location);
            }
          );
        },
        (error) => {
          const warningContent = `QR Code are only permitted when location sharing is enabled. Instruction to enable location, please follow the&nbsp;<a class="link"
          href="https://help.yahoo.com/kb/SLN24008.html" target="_blank">Link</a>`;
          warningBox("Warning", warningContent, "Close");
          console.log(error);
        }
      );
    } else {
      warningBox(
        "Warning",
        "Geolocation is not supported on your browser!",
        "Close"
      );
    }
  });
});

// callback function for QR code form
const createQRCode = async (objectLocation) => {
  const data = {};

  // assign object location to
  data.objectLocation = objectLocation;
  $(".qrcode-form select").each(function (index) {
    let value = $(this).val();
    let key = $(this).attr("name");
    if (key === "maxLength") {
      data.maxLength = value;
    } else if (key === "attendanceDuration") {
      data.attendanceDuration = value;
    }
  });
  const url = `${window.location.pathname}/qrCode?${
    window.location.href.split("?")[1]
  }`;
  try {
    const response = await axios({
      url: url,
      method: "post",
      data: data,
    });
    displayQRCode(
      response.data.sessionId,
      response.data.attendanceDuration,
      url
    );
  } catch (error) {
    alert(new Error(error));
  }
};
