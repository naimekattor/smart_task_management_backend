import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const s3Configured =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET;

let s3Client: S3Client | null = null;
if (s3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export interface UploadedFileResult {
  url: string;
  key: string;
}

export async function uploadFile(
  file: Express.Multer.File
): Promise<UploadedFileResult> {
  const fileExtension = path.extname(file.originalname);
  const key = `${crypto.randomUUID()}${fileExtension}`;

  if (s3Client && process.env.AWS_S3_BUCKET) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return { url, key };
  } else {
    // Local fallback
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, key);
    fs.writeFileSync(filePath, file.buffer);
    
    // Returns relative server path
    const url = `/uploads/${key}`;
    return { url, key };
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (s3Client && process.env.AWS_S3_BUCKET) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
  } else {
    // Local fallback delete
    const filePath = path.join(process.cwd(), 'uploads', key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
