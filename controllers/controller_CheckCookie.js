const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

exports.cookieValidCheck = (req, res, next) => {
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

  req.cookieExpired = true;
  let userCookie = req.body.cookie;
  console.log(req.body);
  if (userCookie === "" || userCookie === null || userCookie === undefined) {
    console.log("Cookies Empty");
    return res.status(400).json({
      cookie: "not-valid",
    });
  }

  if (!userCookie.includes("login_to_app")) {
    console.log("login_to_app cookie not found");
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

  if (userCookie["login_to_app"] !== undefined) {
    console.log(userCookie.login_to_app);
    //Decrypting cookie
    userCookie = decrypt(
      process.env.JAVASCRIPT_COOKIE_ENCRYPTION_CODE,
      userCookie.login_to_app
    );
    console.log("decypted cookie = " + userCookie);
    try {
      const cookieValidorNot = jwt.verify(userCookie, process.env.JWT_KEY);
      console.log("valid cookie data = " + cookieValidorNot.data);
      return res.json({
        cookie: "valid",
        cookieExpiry: cookieValidorNot.exp,
      });
    } catch (error) {
      //cookie expired
      console.log(error);
      return res.status(400).json({
        cookie: "not-valid",
      });
    }
  }
};
