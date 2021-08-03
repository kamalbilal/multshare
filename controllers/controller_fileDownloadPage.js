const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

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

exports.fileDownloader = (req, res) => {
  console.log(req.file_id);
  try {
    dbConnection.query(
      "SELECT * FROM users_files WHERE file_id = ?",
      [req.file_id],
      (error, result) => {
        if (error) {
          console.log("error");
          return res.json({ error });
        }
        if (
          !result ||
          result === null ||
          result === undefined ||
          result.length === 0
        ) {
          return res.json({ error: "file not found" });
        } else {
          console.log(result[0]);
          if (result[0].removed === "yes") {
            return res.json({ error: "file is removed by owner" });
          }
          if (result[0].dmca_removed === "yes") {
            return res.json({ error: "file is removed by dmca" });
          }
          let token = jwt.sign(
            {
              data: "2 days expiry",
            },
            process.env.JWT_KEY,
            { expiresIn: "172800s" } // 2 days
          );
          // token = crypt(process.env.JAVASCRIPT_COOKIE_ENCRYPTION_CODE, token);
          return res.status(200).json({
            cookie: token,
            originalfilename: result[0].originalfilename,
            modifiedfilename: result[0].modifiedfilename,
            file_id: result[0].file_id,
            size: result[0].size,
            modifieddate: result[0].modifieddate,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
};
