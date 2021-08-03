const router = require("express").Router();
const loginController = require("../controllers/controller_login");

// const cookieParser = require("cookie-parser");

// router.use(cookieParser());
router.post(
  "/",
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  loginController.authenticateUser_Check_EmailAndPassword,
  loginController.loginSuccess
);

module.exports = router;
