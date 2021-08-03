const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mysql = require("mysql");
const fs = require("fs");
const { promisify } = require("util");
const Busboy = require("busboy");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Routes

const CheckCookieRoute = require("./routes/route_CheckCookie");
app.use("/CheckCookie", CheckCookieRoute);

/////////////
const loginRoute = require("./routes/route_login");
app.use("/login", loginRoute);
/////////////

/////////////
const indexRoute = require("./routes/route_index");
app.use("/index", indexRoute);
/////////////////

/////////////////
// Upload
const uploadRoute = require("./routes/route_upload");
app.use("/upload", uploadRoute);
// Upload End
/////////////////

/////////////
const getUserDataRoute = require("./routes/route_getUserData");
app.use("/getData", getUserDataRoute);
/////////////////

/////////////
const actionBtnsRoute = require("./routes/route_actionBtns");
app.use("/actionBtns", actionBtnsRoute);
/////////////////

/////////////
const filedownloadPageRoute = require("./routes/route_fileDownloadPage");
app.use(
  "/file/:id",
  (req, res, next) => {
    req.file_id = req.params.id;
    next();
  },
  filedownloadPageRoute
);
/////////////////

/////////////
const filedownloaderRoute = require("./routes/route_fileDownloader");
app.use("/file", filedownloaderRoute);
/////////////////

/////////////////
//Server Listen
var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});
