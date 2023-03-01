// load third parties modules
const cookieParser = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv");
const bodyparser = require("body-parser");
const path = require("path");
const connectDB = require("./server/database/connection");

// create main app for application
const app = express();

app.connectDB;

// set the app to use morgan
app.use(cookieParser());

//set render engine to ejs view engine
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// first define the static root folder before loading the elements
app.use(express.static("assets"));

// render public content to frontend such as css, images and javascript
// render css folder to public
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));

// render javascript folder to public

app.use(
  "/javascript",
  express.static(path.resolve(__dirname, "assets/javascript"))
);

//render images folder to public
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));

//parse request to body-parser
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.json());

// load router to main index js
app.use("/", require("./server/routes/router"));

dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listen on port http://localhost:${PORT}`);
});
