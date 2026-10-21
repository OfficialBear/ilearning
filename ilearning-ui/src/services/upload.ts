import { ApiError, http } from '@/utils/request';

type UploadResponse = string | {
  url?: string;
  fileUrl?: string;
  path?: string;
};

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL ?? '/files/upload';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await http.post<UploadResponse>(UPLOAD_URL, formData);
  const url = typeof result === 'string'
    ? result
    : result?.url ?? result?.fileUrl ?? result?.path;
  if (!url) {
    throw new ApiError('上传接口未返回图片地址');
  }
  return url;
}
