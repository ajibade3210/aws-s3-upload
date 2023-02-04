const { S3 } = require("aws-sdk");
const uuid = require("uuid").v4;

exports.s3Uploadv2 = async (file) => {
  const s3 = new S3();

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${uuid()}-name`,
    Body: file.buffer,
  };
  return s3.upload(param).promise();
};


// https://javascript.plainenglish.io/file-upload-to-amazon-s3-using-node-js-42757c6a39e9