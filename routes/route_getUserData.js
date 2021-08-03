const router = require("express").Router();
const getUserDataController = require("../controllers/controller_getUserData");
const Controller_checkCookieEveryRequest = require("../controllers/controller_CheckCookieEveryRequest");

// const cookieParser = require("cookie-parser");

// router.use(cookieParser());
router.post(
  "/",
  Controller_checkCookieEveryRequest.cookieValidCheckEveryRequest,
  getUserDataController.getUserData
);

module.exports = router;
