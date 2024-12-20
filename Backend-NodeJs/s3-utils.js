const fs = require('fs');

const uploadToS3 = async (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${Date.now()}-${file.originalname}`,
    Body: fileStream,
  };

  try {
    const data = await s3.upload(uploadParams).promise();
    fs.unlinkSync(file.path); // Remove file from server after upload
    return data.Location; // Return the URL of the uploaded file
  } catch (err) {
    throw new Error(`Error uploading file to S3: ${err.message}`);
  }
};

module.exports = { uploadToS3 };
