require("dotenv").config();
const appwrite = require("node-appwrite");
const multer = require("multer");


// AppWrite Configuration
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

// AppWrite Image Uploader Function
const AppWriteFilesUploader = async (images) => {
  const files = [];
  for (let i = 0; i < images.length; ) {
    const uniqueImageId = Math.random().toString(36).substring(2, 8);
    const uniqueFilename =
      Math.random().toString(36).substring(2, 8) + "-" + images[i].originalname;

    const file = await storage.createFile(
      process.env.Appwrite_BucketId,
      uniqueImageId,
      appwrite.InputFile.fromBuffer(images[i].buffer, uniqueFilename)
    );
    files.push(file.$id);
    i++;
    if (files.length == images.length) return files;
  }
};

module.exports = { storage, fileuploader, AppWriteFilesUploader };