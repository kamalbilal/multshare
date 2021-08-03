const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv").config();

let dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

exports.actionBtn_download = (req, res) => {
  const userId = req.userId;
  console.log(req.downloadFileName);
  try {
    dbConnection.query(
      "SELECT * FROM users_files WHERE removed='no' AND dmca_removed='no' AND user_id = ? AND modifiedfilename = ?",
      [userId, req.downloadFileName],
      (error, result, feilds) => {
        if (error) {
          return res.status(204).json({
            error: error,
          });
        }
        console.log(result);
        return res.download(result[0].path, result[0].originalfilename);
      }
    );
  } catch (error) {
    return res.status(204).json({
      error: error,
    });
  }
};
exports.actionBtn_delete = (req, res) => {
  const userId = req.userId;
  const deleteFileName = req.body.filename;
  console.log(userId + " = " + deleteFileName);
  try {
    dbConnection.query(
      "UPDATE users_files SET removed = 'yes' WHERE user_id = ? AND modifiedfilename = ?",
      [userId, deleteFileName],
      (error, result, fields) => {
        if (error) console.log(error);
        console.log(result);
        res.status(200).json({
          delete: "success",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(204).json({
      delete: "fail",
    });
  }
};

exports.actionBtn_rename = (req, res) => {
  const userId = req.userId;
  const renameFileName = req.body.filename.rename;
  const orignalFileName = req.body.filename.originalfilename;
  console.log(userId + " = " + renameFileName);
  console.log(userId + " = " + orignalFileName);
  try {
    dbConnection.query(
      "UPDATE users_files SET originalfilename = ? WHERE user_id = ? AND originalfilename = ?",
      [renameFileName, userId, orignalFileName],
      (error, result, fields) => {
        if (error) console.log(error);
        console.log(result);
        res.status(200).json({
          rename: "success",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(204).json({
      rename: "fail",
    });
  }
};
