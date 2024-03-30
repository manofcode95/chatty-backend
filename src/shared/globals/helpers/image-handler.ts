import { config } from '@root/config';
import { v2, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Types } from 'mongoose';

export function upload(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean) {
  return new Promise((resolve) => {
    v2.uploader.upload(
      file,
      {
        public_id,
        overwrite,
        invalidate
      },
      (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (err) resolve(err);
        resolve(result);
      }
    );
  });
}

export function getImageUrl(version: number, imageId: Types.ObjectId) {
  return `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${version}/${imageId}`;
}
