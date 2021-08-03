const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

exports.cookieValidCheckEveryRequest = (req, res, next) => {
  // Cookie Decryter function
  const decrypt = (salt, encoded) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) =>
      textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded
      .match(/.{1,2}/g)
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
  };
  let userCookie;
  req.cookieExpired = true;
  console.log(req.params.data);
  if (
    !req.params.data ||
    req.params.data === "" ||
    req.params.data === null ||
    req.params.data === undefined
  ) {
    if (
      !req.body.cookie ||
      req.body.cookie === "" ||
      req.body.cookie === null ||
      req.body.cookie === undefined
    ) {
      if (
        !req.headers.cookies ||
        req.headers.cookies === "" ||
        req.headers.cookies === null ||
        req.headers.cookies === undefined
      ) {
        return res.status(400).json({
          cookie: "not-valid",
        });
      } else {
        userCookie = req.headers.cookies;
        console.log("checking header " + userCookie);
      }
    } else {
      userCookie = req.body.cookie;
      console.log("checking body " + userCookie);
    }
  } else {
    try {
      userCookie = req.params.data; // for fileDownloader
    } catch (error) {
      return res.status(400).json({
        cookie: "not-valid",
      });
    }
  }

  if (userCookie === "" || userCookie === null || userCookie === undefined) {
    console.log("Cookies Empty");
    return res.status(400).json({
      cookie: "not-valid",
    });
  }

  if (!userCookie.includes("file_download")) {
    console.log("file_download cookie not found");
    return res.status(400).json({
      cookie: "not-valid",
    });
  }

  //converting cookie string to object
  let output = {};
  userCookie.split(/\s*;\s*/).forEach(function (pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.splice(1).join("=");
  });
  let jsonCookie = JSON.stringify(output, null, 4);
  userCookie = JSON.parse(jsonCookie);

  if (userCookie["file_download"] !== undefined) {
    // console.log("eeeeeaaaa " + userCookie.file_download);
    userCookie = userCookie.file_download; // remove this line if you want to decrypt
    console.log("file download cookie = " + userCookie); // remove this line if you want to decrypt
    //Decrypting cookie
    // userCookie = decrypt(
    //   process.env.JAVASCRIPT_COOKIE_ENCRYPTION_CODE,
    //   userCookie.file_download
    // );
    // console.log("file download decypted cookie = " + userCookie);
    try {
      const cookieValidorNot = jwt.verify(userCookie, process.env.JWT_KEY);
      console.log(
        "file download valid cookie userID = " + cookieValidorNot.data
      );
      req.userId = cookieValidorNot.data;

      next();
    } catch (error) {
      //cookie expired
      console.log(error);
      return res.status(400).json({
        cookie: "not-valid",
      });
    }
  }
};
