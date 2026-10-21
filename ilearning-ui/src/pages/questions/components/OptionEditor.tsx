import { Button, Checkbox, Form, Input, Radio, Tag, Typography } from 'antd';
import type { FormInstance } from 'antd';
import ImageUpload from '@/components/ImageUpload';
import type { QuestionType } from '@/types/question';
import type { OptionFormValue, QuestionFormValues } from '../formTypes';
import { optionLabel } from '../questionMeta';

interface OptionEditorProps {
  form: FormInstance<QuestionFormValues>;
  type: QuestionType;
  disabled?: boolean;
}

export default function OptionEditor({ form, type, disabled = false }: OptionEditorProps) {
  const isJudge = type === 3;
  const isMultiple = type === 2;
  const watchedOptions = Form.useWatch('options', form) as OptionFormValue[] | undefined;
  const optionCount = watchedOptions?.length ?? 0;
  const answerOptions = Array.from({ length: optionCount }, (_, index) => ({
    label: optionLabel(index),
    value: index,
  }));

  const handleRemove = (remove: (index: number) => void, index: number) => {
    remove(index);
    form.setFieldsValue({ correctIndex: undefined, correctIndexes: [] });
  };

  return (
    <>
      <Form.List name="options">
        {(fields, { add, remove }) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Typography.Text strong>选项</Typography.Text>
            {fields.map((field, index) => (
              <div
                key={field.key}
                style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    width: '100%',
                  }}
                >
                  <Tag style={{ marginTop: 4 }}>{optionLabel(index)}</Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Form.Item
                      name={[field.name, 'content']}
                      rules={[
                        { required: true, message: '请输入选项内容' },
                        { max: 5000, message: '选项内容最长 5000 位' },
                      ]}
                      style={{ marginBottom: 8 }}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        placeholder={`选项 ${optionLabel(index)} 内容`}
                        disabled={disabled || isJudge}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'imageUrl']} style={{ marginBottom: 0 }}>
                      <ImageUpload compact disabled={disabled} />
                    </Form.Item>
                  </div>
                  {!isJudge ? (
                    <Button
                      type="link"
                      danger
                      size="small"
                      disabled={disabled || fields.length <= 2}
                      onClick={() => handleRemove(remove, field.name)}
                    >
                      删除
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {!isJudge ? (
              <Button
                type="dashed"
                block
                disabled={disabled || fields.length >= 8}
                onClick={() => add({ content: '', imageUrl: '' })}
              >
                添加选项
              </Button>
            ) : null}
          </div>
        )}
      </Form.List>
      {optionCount > 0
        ? isMultiple
          ? (
              <Form.Item
                label="正确答案"
                name="correctIndexes"
                rules={[
                  {
                    validator: (_, value: number[] | undefined) =>
                      value && value.length >= 2
                        ? Promise.resolve()
                        : Promise.reject(new Error('请至少选择两个正确答案')),
                  },
                ]}
              >
                <Checkbox.Group disabled={disabled} options={answerOptions} />
              </Form.Item>
            )
          : (
              <Form.Item
                label="正确答案"
                name="correctIndex"
                rules={[{ required: true, message: '请选择正确答案' }]}
              >
                <Radio.Group disabled={disabled} options={answerOptions} />
              </Form.Item>
            )
        : null}
    </>
  );
}
