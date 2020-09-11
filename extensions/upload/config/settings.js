module.exports = {
  "provider": "aws-s3",
  "providerOptions": {
    "accessKeyId": process.env.AWS_S3_ACCESS_KEY,
    "secretAccessKey": process.env.AWS_S3_SECRET_KEY,
    "region": process.env.AWS_S3_REGION,
    "params": {
      "Bucket": process.env.AWS_BUCKET_NAME
    }
  }
};