import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'dating02',
          transformation: [{ width: 800, height: 800, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(new BadRequestException(error.message));
          else resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async getSignedUrl(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
  }
}
