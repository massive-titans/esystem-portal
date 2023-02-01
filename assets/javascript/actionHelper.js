// function to create a confirmation box message
function confirm(title, msg, $true, $false, callback) {
  /*change*/
  const $content =
    "<div class='dialog-ovelay'>" +
    "<div class='dialog'>" +
    "<header>" +
    " <h3> " +
    title +
    " </h3> " +
    "<i class='fa fa-close'></i>" +
    "</header>" +
    "<div class='dialog-msg'>" +
    " <p> " +
    msg +
    " </p> " +
    "</div>" +
    "<footer>" +
    "<div class='controls'>" +
    " <button class='button w3-button w3-red doAction'>" +
    $true +
    "</button> " +
    " <button class='button w3-button w3-light-grey cancelAction'>" +
    $false +
    "</button> " +
    "</div>" +
    "</footer>" +
    "</div>" +
    "</div>";
  $("body").prepend($content);
  $(".doAction").click(function () {
    $("html").css("overflow-y", "visible");
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(200, function () {
        $(this).remove();
      });
    callback();
  });
  $(".cancelAction, .fa-close").click(function () {
    $("html").css("overflow-y", "visible");
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(200, function () {
        $(this).remove();
      });
  });
}

function warningBox(title, msg, $true) {
  const $content =
    "<div class='dialog-ovelay'>" +
    "<div class='dialog'>" +
    "<header>" +
    " <h3> " +
    title +
    " </h3> " +
    "<i class='fa fa-close'></i>" +
    "</header>" +
    "<div class='dialog-msg'>" +
    `<p>${msg}</p>` +
    "</div>" +
    "<footer>" +
    "<div class='controls'>" +
    " <button class='button w3-button w3-red doAction'>" +
    $true +
    "</button> " +
    "</div>" +
    "</footer>" +
    "</div>" +
    "</div>";
  $("body").prepend($content);
  $(".doAction, .fa-close").click(function () {
    $("html").css("overflow-y", "visible");
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(200, function () {
        $(this).remove();
      });
  });
}

function qrCodeInputBox(title, $true, $false, $body, callback) {
  const $content = `
  <div class='dialog-ovelay'>
  <div class='dialog'>
  <header>
  <h3>${title}</h3>
  <i class='fa fa-close'></i>
  </header>
  <div class='dialog-msg'>
  ${$body}
  </div>
  <footer>
  <div class='controls'>
  <button class="button w3-button w3-blue doAction">${$true}</button>
  <button class="button w3-button w3-red cancelAction">${$false}</button>
  </div>
  </footer>
  </div>
  </div>`;
  $("body").prepend($content);
  $(".doAction").click(function () {
    $("html").css("overflow-y", "visible");
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(200, function () {
        $(this).remove();
      });
    callback();
  });
  $(".cancelAction, .fa-close").click(function () {
    $("html").css("overflow-y", "visible");
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(200, function () {
        $(this).remove();
      });
  });
}

// function to fate out the enrollment students
function enrollment(unenrolledStudents, enrolledStudents, $false, $true, url) {
  const $contentEnrollment = `<div class="dialog-ovelay">
  <div class="padding-2 w3-light-gray w3-round-large">
  <div class="container-row-center-flex-start">
    <div class="container-row-center">
      <div>
        <input
          class="width-30 w3-input w3-border padding-0_5 margin-bottom-1 w3-round"
          type="text"
          name=""
          id=""
          placeholder="search"
        />
        <select name="" multiple class="width-30 height-40 unregistered" id="unenroll-students"></select>
      </div>
      <div class="margin-horizontal-3 container-column-center">
        <button class="w3-button w3-gray margin-bottom-2 btnMoveLeft">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="w3-button w3-gray btnMoveRight">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
    <form id="enrollmentForm" action="${url}" method="put">
      <input
        class="width-30 w3-input w3-border padding-0_5 margin-bottom-1 w3-round"
        type="text"
        name=""
        id=""
        placeholder="search"
      />
      <select name="student" id="enroll-students" multiple class="width-30 height-40 registered"></select>
      <div class="container-row-flex-end margin-vertical-2">
        <button class="w3-button w3-red margin-horizontal-3 cancelAction">${$false}</button>
        <button class="w3-button w3-blue margin-horizontal-3 saveAction" type="submit">${$true}</button>
      </div>
    </form>
  </div>
  </div>
  </div>`;
  // create an enrollment templete and append it to body
  $("body").append($contentEnrollment);

  //
  const listStudentsUnenrolled = ejs.render(
    `<% if(typeof students !== "undefined"){ %>
      <% for(let i=0; i < students.length; i++){ %>
        <option value="<%=students[i]._id%>" class="padding-0_5"><%=students[i].firstName%>&nbsp;<%=students[i].lastName%></option>
      <% } %>
    <% } %>`,
    { students: unenrolledStudents }
  );

  const listStudentsEnrolled = ejs.render(
    `<% if(typeof students !== "undefined"){ %>
      <% for(let i=0; i < students.length; i++){ %>
        <option value="<%=students[i]._id%>" class="padding-0_5"><%=students[i].firstName%>&nbsp;<%=students[i].lastName%></option>
      <% } %>
    <% } %>`,
    { students: enrolledStudents }
  );

  $(".unregistered").append(listStudentsUnenrolled);
  $(".registered").append(listStudentsEnrolled);

  // move Left & Right button
  $(".btnMoveLeft").click(function () {
    $("#enroll-students option:selected").each(function (index) {
      $(this).appendTo("#unenroll-students");
    });
  });
  $(".btnMoveRight").click(function () {
    $("#unenroll-students option:selected").each(function (index) {
      $(this).appendTo("#enroll-students");
    });
  });

  // action button
  $(".cancelAction").click(function () {
    $("html").css("overflow-y", "visible");
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(100, function () {
        $(this).remove();
      });
  });
  $(".saveAction").click(function (e) {
    e.preventDefault();
    $("html").css("overflow-y", "visible");
    const selectedStudents = [];
    const options = $("#enrollmentForm option").map(function (i, option) {
      return $(option).val();
    });
    for (let i = 0; i < options.length; i++) {
      selectedStudents.push(options[i]);
    }
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(200, function () {
        $(this).remove();
      });
    updateEnrollment(url, selectedStudents);
    location.reload();
  });
}

// post or update students enrollments
async function updateEnrollment(url, students) {
  try {
    const result = await axios({
      method: "put",
      url: url,
      data: { student: students },
    });
    console.log(result.data);
  } catch (error) {
    console.log(error);
  }
}

async function removeQRCodeSession(sessionId, url) {
  await axios({
    method: "delete",
    url: url,
    data: { sessionId: sessionId },
  });
}

function displayQRCode(sessionId, duration, url) {
  // The Display generates on client side after receiving a sessionId from server
  // html content to display a QRCode
  const $content = `<div class='dialog-ovelay'>
  <div class="qrBackground w3-card-4">
  <h3>QR Code Attendance</h3>
  <div id="qrcodeCanvas"></div>
  <p class="timeDisplay"></p>
  </div>
  </div>`;
  $("body").prepend($content);
  $("html").css("overflow-y", "hidden");

  // Generate QRCode based on SessionId receiving from Server
  let qrcode = new QRCode(document.getElementById("qrcodeCanvas"), {
    text: sessionId,
    width: 250,
    height: 250,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M,
  });

  // After the QRCode displayed, the timer starts
  let intervalId;
  let timer = duration * 60;
  intervalId = setInterval(() => {
    let minutes = Math.floor((timer % (60 * 60)) / 60)
      .toString()
      .padStart(2, 0);
    let seconds = Math.floor(timer % 60)
      .toString()
      .padStart(2, 0);
    $(".timeDisplay").html(minutes + " min" + " : " + seconds + " s");
    timer--;

    // when time is over, the QRCode remove and remove the session from database.
    if (timer < 0) {
      clearInterval(intervalId);
      $(".timeDisplay").html("Time up!");
      removeQRCodeSession(sessionId, url);
      $("html").css("overflow-y", "visible");
      $(".dialog-ovelay").fadeOut(200, function () {
        $(this).remove();
      });
      window.reload();
    }
  }, 1000);
}

export { confirm, enrollment, warningBox, qrCodeInputBox, displayQRCode };
