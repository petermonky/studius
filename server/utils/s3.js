require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// upload a file to s3 bucket
const uploadFile = (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
};

// retrieve file from s3 bucket
const getFileStream = (key) => {
  const retrieveParams = {
    Key: key,
    Bucket: bucketName,
  };

  return s3.getObject(retrieveParams).createReadStream();
};

// delete file from s3 bucket
const deleteFile = (key) => {
  const deleteParams = {
    Key: key,
    Bucket: bucketName,
  };

  return s3.deleteObject(deleteParams).promise();
};

module.exports = { uploadFile, getFileStream, deleteFile };
