const appwrite = require("node-appwrite");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const projectId = "660f30b6474fd486d62e";
const bucketId = "660f31232cf0b6c64dfc";
const apiKey =
  "4f91a4a7710d01c5956dbdf8e449d78cf25a71f363f28c5e6bdf771952b6fa4cc7677ff0068cbcc6da08107b753215fc3f60bf7bc945ab4d9f1d9b012e37ad69f456c4b9f64689e899c2a5e49e079e1c2ea02b260f603ef229ea976cd386396f19432dd32597fdcf9eac6649d2b8ef836ac2730c2b4072a342e151abbac3ea56";

const client = new appwrite.Client();
const storage = new appwrite.Storage(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(projectId)
  .setKey(apiKey);

const upload = multer.memoryStorage({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 5 MB
  },
});
const fileuploader = multer({ storage: upload }).array("file", 4);


module.exports = { storage, fileuploader, bucketId };
