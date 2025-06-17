import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../../configs/app.config.js';
import logger from '../../../utils/logger.js';

// AWS S3 Configuration
const s3 = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

export const getUploadVideoUrlService = async (fileName, fileType) => {
  try {
    const uniqueId = uuidv4();
    const s3Key = `videos/${uniqueId}/${fileName}`;
    const bucket = config.S3_BUCKET_NAME;
    const cloudfrontDomain = config.CLOUDFRONT_DOMAIN;

    // Create presigned upload URL for direct S3 upload
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 mins

    // Construct CloudFront URL for playback/download
    const videoUrl = `https://${cloudfrontDomain}/${s3Key}`;

    return { uploadUrl, videoUrl };
  } catch (error) {
    logger.error('Failed to generate S3 upload URL:', error);
    throw error;
  }
};
