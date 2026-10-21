import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Image, Space, Typography, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { useState } from 'react';
import { IMAGE_FALLBACK } from '@/pages/questions/questionMeta';
import { uploadImage } from '@/services/upload';
import { ApiError } from '@/utils/request';

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({
  value = '',
  onChange,
  disabled = false,
  compact = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [messageApi, messageHolder] = message.useMessage();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange?.(url);
      messageApi.success('图片上传成功');
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.type.startsWith('image/')) {
      messageApi.error('只能上传图片文件');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      messageApi.error('图片大小不能超过 5MB');
      return Upload.LIST_IGNORE;
    }
    void handleFile(file);
    return false;
  };

  const remove = () => onChange?.('');

  if (compact) {
    return (
      <>
        {messageHolder}
        <Space align="center" wrap>
          {value ? (
            <Image
              src={value}
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 6 }}
              fallback={IMAGE_FALLBACK}
              alt="选项图片"
            />
          ) : null}
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={beforeUpload}
            disabled={disabled || uploading}
          >
            <Button size="small" icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
              上传图片
            </Button>
          </Upload>
          {value ? (
            <Button size="small" type="link" danger onClick={remove} disabled={disabled}>
              移除
            </Button>
          ) : null}
        </Space>
      </>
    );
  }

  return (
    <>
      {messageHolder}
      <Space orientation="vertical" size={8}>
        {value ? (
          <Image
            src={value}
            width={120}
            height={120}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            fallback={IMAGE_FALLBACK}
            alt="题目图片"
          />
        ) : null}
        <Space wrap>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={beforeUpload}
            disabled={disabled || uploading}
          >
            <Button
              icon={value ? <UploadOutlined /> : <PlusOutlined />}
              loading={uploading}
              disabled={disabled}
            >
              {value ? '替换图片' : '上传图片'}
            </Button>
          </Upload>
          {value ? (
            <Button danger onClick={remove} disabled={disabled}>
              移除
            </Button>
          ) : null}
        </Space>
        <Typography.Text type="secondary">支持 JPG、PNG、GIF、WebP，最大 5MB</Typography.Text>
      </Space>
    </>
  );
}
