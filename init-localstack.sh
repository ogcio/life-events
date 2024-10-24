#!/bin/bash
# Show output for all main resources created
set -x

# Create S3 buckets
awslocal s3 mb s3://$FILES_S3_BUCKET
awslocal s3 mb s3://$IMAGES_S3_BUCKET
awslocal s3 mb s3://$FILE_UPLOAD_SERVICE_BUCKET

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

AWS_REGION="eu-west-1"

for SERVICE in "payments-api" "intg-api"; do
  echo "Creating KMS key for $SERVICE..."

  KMS_KEY_ID=$(aws kms create-key \
    --key-usage SIGN_VERIFY \
    --customer-master-key-spec RSA_2048 \
    --endpoint-url $LOCALSTACK_ENDPOINT \
    --region $AWS_REGION \
    --query 'KeyMetadata.KeyId' \
    --output text)

  echo "Created KMS key for $SERVICE with Key ID: $KMS_KEY_ID"

  echo "Creating KMS alias for $SERVICE..."

  aws kms create-alias \
    --alias-name "alias/life-events-$SERVICE-asymmetric-key" \
    --target-key-id "$KMS_KEY_ID" \
    --endpoint-url $LOCALSTACK_ENDPOINT \
    --region $AWS_REGION

  echo "KMS key and alias created for $SERVICE with Key ID: $KMS_KEY_ID"
done

set +x
