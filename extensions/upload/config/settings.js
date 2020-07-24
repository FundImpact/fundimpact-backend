module.exports = ({
  env
}) => ({
  "provider": "aws-s3",
  "providerOptions": {
    "accessKeyId": env('AWS_S3_ACCESS_KEY'),
    "secretAccessKey": env('AWS_S3_SECRET_KEY'),
    "region": env('AWS_S3_REGION'),
    "params": {
      "Bucket": env('AWS_BUCKET_NAME')
    }
  }
});