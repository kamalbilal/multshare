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
  const requstedFile_id = req.params.file_id;
  console.log("Download file id = " + requstedFile_id);
  try {
    dbConnection.query(
      "SELECT * FROM users_files WHERE file_id = ?",
      [requstedFile_id],
      (error, result) => {
        if (error) {
          console.log("error");
          return res.json({ error });
        }
        console.log(result);
        return res.download(result[0].path, result[0].originalfilename);
      }
    );
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
};
