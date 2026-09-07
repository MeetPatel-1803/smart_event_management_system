// cloudinary.provider.ts

import { v2 as cloudinary } from 'cloudinary';
import { CONSTANTS } from 'src/common/constants/app.constants';

export const CloudinaryProvider = {
  provide: CONSTANTS.CLOUDINARY,
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  },
};
