const router = require("express").Router();
const controller_fileDownloader = require("../controllers/controller_fileDownloader");
const controller_CheckCookie_FileDownload = require("../controllers/controller_CheckCookie_FileDownload");

router.get(
  "/download/:file_id/:data",
  controller_CheckCookie_FileDownload.cookieValidCheckEveryRequest,
  controller_fileDownloader.fileDownloader
);

module.exports = router;
