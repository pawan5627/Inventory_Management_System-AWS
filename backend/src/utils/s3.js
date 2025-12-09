const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.AVATAR_S3_BUCKET;

const s3 = new S3Client({ region });

const getPresignedPutUrl = async (key, contentType) => {
  if (!bucket) throw new Error("AVATAR_S3_BUCKET is not configured");
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  // 10 minutes expiry
  return await getSignedUrl(s3, cmd, { expiresIn: 600 });
};

module.exports = { getPresignedPutUrl };
