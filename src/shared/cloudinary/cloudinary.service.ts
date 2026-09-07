// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import streamifier from 'streamifier';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_FOLDER_PATH, public_id: fileName },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          resolve(result as CloudinaryResponse);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  getImageUrl(fileName: string): string {
    return cloudinary.url(`${process.env.CLOUDINARY_FOLDER_PATH}/${fileName}`, {
      secure: true,
    });
  }
}
