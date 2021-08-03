const router = require("express").Router();

const CheckCookieController = require("../controllers/controller_CheckCookie");

router.post(
  "/",
  (req, res, next) => {
    console.log("cookie called");
    next();
  },
  CheckCookieController.cookieValidCheck
);

module.exports = router;
