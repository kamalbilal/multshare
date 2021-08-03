const router = require("express").Router();
const controller_fileDownload = require("../controllers/controller_fileDownloadPage");

router.get("/", controller_fileDownload.fileDownloader);

module.exports = router;
