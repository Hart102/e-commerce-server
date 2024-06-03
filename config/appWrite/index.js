require("dotenv").config();
const appwrite = require("node-appwrite");
const multer = require("multer");

const client = new appwrite.Client();
const storage = new appwrite.Storage(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.Appwrite_ProjectId)
  .setKey(process.env.AppWrite_ApiKey);

const upload = multer.memoryStorage({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 5 MB
  },
});
const fileuploader = multer({ storage: upload }).array("file", 4);

module.exports = { storage, fileuploader };
