#!/bin/bash
# Show output for all main resources created
set -x

# Create S3 buckets
awslocal s3 mb s3://$FILES_S3_BUCKET
awslocal s3 mb s3://$IMAGES_S3_BUCKET

# Set CORS for S3 buckets
echo '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "POST", "PUT", "HEAD", "DELETE"],
      "AllowedOrigins": [
        "http://localhost:8000",
        "http://localhost:3000",
        "https://app.localstack.cloud",
        "http://app.localstack.cloud"
      ],
      "ExposeHeaders": ["ETag"]
    }
  ]
}' > cors-config.json

awslocal s3api put-bucket-cors --bucket "$IMAGES_S3_BUCKET" --cors-configuration file://cors-config.json

set +x
