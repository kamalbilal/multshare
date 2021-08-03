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

exports.getUserData = (req, res) => {
  const userId = req.userId;
  dbConnection.query(
    "SELECT file_id, originalfilename, modifiedfilename, size, modifieddate FROM users_files WHERE removed = 'no' AND dmca_removed = 'no' AND user_id = ?",
    [userId],
    (error, result, feilds) => {
      if (error) {
        return res.status(204).json({
          error: error,
        });
      }
      //   console.log(result);
      if (result.length === 0) {
        console.log("No data found");
        return res.status(204).json({
          error: "No data found",
        });
      } else {
        return res.status(200).json(result);
      }
    }
  );
};
