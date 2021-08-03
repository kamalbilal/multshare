const router = require("express").Router();
const actionBtnController = require("../controllers/controller_actionBtns");
const Controller_checkCookieEveryRequest = require("../controllers/controller_CheckCookieEveryRequest");

router.get("/download/:data", Controller_checkCookieEveryRequest.cookieValidCheckEveryRequest, actionBtnController.actionBtn_download);
router.post("/delete", Controller_checkCookieEveryRequest.cookieValidCheckEveryRequest, actionBtnController.actionBtn_delete);
router.post("/rename", Controller_checkCookieEveryRequest.cookieValidCheckEveryRequest, actionBtnController.actionBtn_rename);

module.exports = router;
