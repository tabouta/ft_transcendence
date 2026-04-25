import { type S3ListObjectsOptions, s3 } from "bun";
import {
  PrivateStorage as _PrivateStorage,
  PublicStorage as _PublicStorage,
} from "../../storage";

export const PublicStorage = {
  url: (key: string) => _PublicStorage.url(key),
  get: (key: string) => s3.file(key),
  stat: (key: string) => s3.stat(key),
  exists: (key: string) => s3.exists(key),
  upload: async (key: string, file: Blob | File, type?: string) =>
    s3.write(key, await file.bytes(), { type }),
  list: (input?: S3ListObjectsOptions) => s3.list(input),
  delete: (key: string) => s3.delete(key),
};

const bucket = process.env.S3_BUCKET_PRIVATE;
if (!bucket) {
  throw "S3_BUCKET_PRIVATE is not defined";
}

export const PrivateStorage = {
  url: (key: string) => _PrivateStorage.url(key),
  presignedUrl: (key: string, expiresIn?: number) => {
    console.error(`bucket: ${bucket}`);
    return s3.presign(key, {
      endpoint: process.env.ORIGIN,
      expiresIn,
      bucket,
    });
  },
  get: (key: string) => s3.file(key, { bucket }),
  stat: (key: string) => s3.stat(key),
  exists: (key: string) => s3.exists(key, { bucket }),
  upload: async (key: string, file: Blob | File, type?: string) =>
    s3.write(key, await file.bytes(), { type, bucket }),
  list: (input?: S3ListObjectsOptions) => s3.list(input, { bucket }),
  delete: (key: string) => s3.delete(key, { bucket }),
};
