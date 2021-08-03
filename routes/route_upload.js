const router = require("express").Router();
const cors = require("cors");
const mysql = require("mysql");
const fs = require("fs");
const { promisify } = require("util");
const Busboy = require("busboy");
const Controller_checkCookieEveryRequest = require("../controllers/controller_CheckCookieEveryRequest");

// const cookieParser = require("cookie-parser");
// router.use(cookieParser());

let dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const AllowedExtentions = [
  "7z",
  "a",
  "apk",
  "ar",
  "bz2",
  "cab",
  "cpio",
  "deb",
  "dmg",
  "egg",
  "gz",
  "iso",
  "jar",
  "lha",
  "mar",
  "pea",
  "rar",
  "rpm",
  "s7z",
  "shar",
  "tar",
  "tbz2",
  "tgz",
  "tlz",
  "war",
  "whl",
  "xpi",
  "zip",
  "zipx",
  "xz",
  "pak",
  "aac",
  "aiff",
  "ape",
  "au",
  "flac",
  "gsm",
  "it",
  "m3u",
  "m4a",
  "mid",
  "mod",
  "mp3",
  "mpa",
  "pls",
  "ra",
  "s3m",
  "sid",
  "wav",
  "wma",
  "xm",
  "mobi",
  "epub",
  "azw1",
  "azw3",
  "azw4",
  "azw6",
  "azw",
  "cbr",
  "cbz",
  "eot",
  "otf",
  "ttf",
  "woff",
  "woff2",
  "3dm",
  "3ds",
  "max",
  "bmp",
  "dds",
  "gif",
  "jpg",
  "jpeg",
  "png",
  "psd",
  "xcf",
  "tga",
  "thm",
  "tif",
  "tiff",
  "yuv",
  "ai",
  "eps",
  "ps",
  "svg",
  "dwg",
  "dxf",
  "gpx",
  "kml",
  "kmz",
  "webp",
  "ods",
  "xls",
  "xlsx",
  "csv",
  "ics",
  "vcf",
  "ppt",
  "odp",
  "doc",
  "docx",
  "ebook",
  "log",
  "md",
  "msg",
  "odt",
  "org",
  "pages",
  "pdf",
  "rtf",
  "rst",
  "tex",
  "txt",
  "wpd",
  "wps",
  "3g2",
  "3gp",
  "aaf",
  "asf",
  "avchd",
  "avi",
  "drc",
  "flv",
  "m2v",
  "m4p",
  "m4v",
  "mkv",
  "mng",
  "mov",
  "mp2",
  "mp4",
  "mpe",
  "mpeg",
  "mpg",
  "mpv",
  "mxf",
  "nsv",
  "ogg",
  "ogv",
  "ogm",
  "qt",
  "rm",
  "rmvb",
  "roq",
  "srt",
  "svi",
  "vob",
  "webm",
  "wmv",
  "yuv",
];

const getFileDetails = promisify(fs.stat);

const uniqueAlphaNumericId = (() => {
  const heyStack = "0123456789abcdefghijklmnopqrstuvwxyz";
  const randomInt = () =>
    Math.floor(Math.random() * Math.floor(heyStack.length));

  return (length = 24) =>
    Array.from({ length }, () => heyStack[randomInt()]).join("");
})();

const getFilePath = (fileName, fileId) =>
  `./uploads/file-${fileId}-${fileName}`;

router.post(
  "/request",
  Controller_checkCookieEveryRequest.cookieValidCheckEveryRequest,
  (req, res) => {
    const userId = req.userId;

    console.log(req.body.fileName);
    if (!req.body || !req.body.fileName) {
      return res.status(400).json({ message: 'Missing "fileName"' });
    }
    if (!AllowedExtentions.includes(req.body.fileName.split(".").pop())) {
      console.log({ message: "File extention not supported" });
      return res.status(400).json({ message: "File extention not supported" });
    }
    if (req.body.fileName.length >= 80) {
      return res.status(400).json({ message: "fileName to long" });
    } else {
      const fileId = uniqueAlphaNumericId();
      const path = getFilePath(req.body.fileName, fileId);
      const modifiedFileName = path.replace("./uploads/", "");
      const orignalFileName = req.body.fileName;
      const userId = req.userId;
      const fileSize = req.body.fileSize;

      //current date formate
      const date = new Date(Date.now());
      const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(
        date
      );
      const month = new Intl.DateTimeFormat("en", { month: "short" }).format(
        date
      );
      const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(
        date
      );
      const modifiedDate = `${day} ${month} ${year}`;
      //current date formate end

      fs.createWriteStream(path, {
        flags: "w",
      });

      try {
        //db write
        dbConnection.query(
          "SELECT * FROM users WHERE user_id = ?",
          [userId],
          (error, result, feilds) => {
            if (error) {
              return res.status(204).json({
                error: error,
              });
            }
            console.log(result);
            if (result.length === 0) {
              console.log("No data found");
              return res.status(204).json({
                error: "No data found",
              });
            }
            let file_id = `${Date.now() + Math.random(99999) * 5 * 75 + 5}`;
            file_id = file_id.replace(".", "");
            dbConnection.query(
              "INSERT INTO users_files (user_id, name, email, file_id, originalfilename, modifiedfilename, path, size, modifieddate) VALUES (?,?,?,?,?,?,?,?,?)",
              [
                userId,
                result[0].name,
                result[0].email,
                file_id,
                orignalFileName,
                modifiedFileName,
                path,
                fileSize,
                modifiedDate,
              ],
              function (err, result) {
                if (err) {
                  return res.status(204).json({
                    error: error,
                  });
                }
                console.log("userId " + userId + ": 1 record inserted");
              }
            );
          }
        );
        //db write end
      } catch (error) {
        return res.status(204).json({
          error: "please try again",
        });
      }
      res.status(200).json({ fileId });
    }
  }
);

router.get("/status", (req, res) => {
  if (req.query && req.query.fileName && req.query.fileId) {
    getFileDetails(getFilePath(req.query.fileName, req.query.fileId))
      .then((stats) => {
        res.status(200).json({ totalChunkUploaded: stats.size });
      })
      .catch((err) => {
        console.error("failed to read file", err);
        res.status(400).json({
          message: "No file with such credentials",
          credentials: req.query,
        });
      });
  }
});

router.post(
  "/",
  Controller_checkCookieEveryRequest.cookieValidCheckEveryRequest,
  (req, res) => {
    const contentRange = req.headers["content-range"];
    const fileId = req.headers["x-file-id"];

    if (!contentRange) {
      console.log("Missing Content-Range");
      return res
        .status(400)
        .json({ message: 'Missing "Content-Range" header' });
    }

    if (!fileId) {
      console.log("Missing File Id");
      return res.status(400).json({ message: 'Missing "X-File-Id" header' });
    }

    const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);

    if (!match) {
      console.log("Invalid Content-Range Format");
      return res
        .status(400)
        .json({ message: 'Invalid "Content-Range" Format' });
    }

    const rangeStart = Number(match[1]);
    const rangeEnd = Number(match[2]);
    const fileSize = Number(match[3]);

    if (
      rangeStart >= fileSize ||
      rangeStart >= rangeEnd ||
      rangeEnd > fileSize
    ) {
      return res
        .status(400)
        .json({ message: 'Invalid "Content-Range" provided' });
    }

    const busboy = new Busboy({ headers: req.headers });

    busboy.on("file", (_, file, fileName) => {
      const filePath = getFilePath(fileName, fileId);
      if (!fileId) {
        req.pause();
      }

      getFileDetails(filePath)
        .then((stats) => {
          if (stats.size !== rangeStart) {
            return res.status(400).json({ message: 'Bad "chunk" provided' });
          }

          file
            .pipe(fs.createWriteStream(filePath, { flags: "a" }))
            .on("error", (e) => {
              console.error("failed upload", e);
              res.sendStatus(500);
            });
        })
        .catch((err) => {
          console.log("No File Match", err);
          res.status(400).json({
            message: "No file with such credentials",
            credentials: req.query,
          });
        });
    });

    busboy.on("error", (e) => {
      console.error("failed upload", e);
      res.sendStatus(500);
    });

    busboy.on("finish", () => {
      res.sendStatus(200);
    });

    req.pipe(busboy);
  }
);

module.exports = router;
