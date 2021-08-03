const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
// const cookieParser = require("cookie-parser");

let dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

//Cookie Encryption
const crypt = (salt, text) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

// Exports

exports.authenticateUser_Check_EmailAndPassword = (req, res, next) => {
  try {
    const requestedEmail = req.body.email;
    const requestedPassword = req.body.password;
    dbConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [requestedEmail],
      (error, result, feilds) => {
        if (error) {
          return res.json({
            error: "invalid credentials",
          });
        }

        if (result.length === 0) {
          console.log("user not found");
          return res.json({
            error: "invalid credentials",
          });
        }
        const userRealEmail = result[0].email;
        const userRealCryptedpassword = result[0].password;

        if (requestedEmail === userRealEmail) {
          bcrypt.compare(
            requestedPassword,
            userRealCryptedpassword,
            function (err, response) {
              if (err) {
                console.log(err);
              }
              if (response) {
                // Send JWT
                req.userData = result;
                console.log("user authenticated");
                next();
              } else {
                console.log("invalid credentials");
                return res.json({
                  error: "invalid credentials",
                });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    res.json({
      error: "please try again",
    });
  }
};

exports.loginSuccess = (req, res) => {
  console.log(req.userData);
  console.log(req.userData[0].user_id);
  let token = jwt.sign(
    {
      data: req.userData[0].user_id,
    },
    process.env.JWT_KEY,
    { expiresIn: "1200s" }
  );
  token = crypt(process.env.JAVASCRIPT_COOKIE_ENCRYPTION_CODE, token);
  res.json({
    login_status: "success",
    login_token: token,
    cookieExpired: req.cookieExpired,
  });
};
