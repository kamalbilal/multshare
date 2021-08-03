const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv").config();
// const cookieParser = require("cookie-parser");

let dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

exports.loginSuccess = (req, res) => {};
