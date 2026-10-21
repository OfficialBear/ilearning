import { Alert, Descriptions, Divider, Grid, Image, Space, Tag, Typography, theme } from 'antd';
import type { QuestionDetail } from '@/types/question';
import {
  formatDateTime,
  IMAGE_FALLBACK,
  optionLabel,
  QUESTION_DIFFICULTY_META,
  QUESTION_TYPE_META,
} from '../questionMeta';

interface QuestionPreviewProps {
  question: QuestionDetail;
}

export default function QuestionPreview({ question }: QuestionPreviewProps) {
  const screens = Grid.useBreakpoint();
  const isWide = screens.lg ?? false;
  const { token } = theme.useToken();
  const typeMeta = QUESTION_TYPE_META[question.questionType];
  const difficultyMeta = QUESTION_DIFFICULTY_META[question.difficulty];
  const isSaq = question.questionType === 4;
  const correctOptions = question.options.filter((option) => option.isCorrect === 1);
  const correctLabels = question.options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => option.isCorrect === 1)
    .map(({ option, index }) => option.optionKey || optionLabel(index));
  const correctAnswerText =
    question.questionType === 3
      ? correctOptions.map((option) => option.content).join('、')
      : correctLabels.join('、');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isWide ? 'minmax(0, 1fr) 240px' : 'minmax(0, 1fr)',
        gap: 24,
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        {question.paperReferenceCount > 0 ? (
          <Alert
            type="warning"
            showIcon
            message={`该试题已被 ${question.paperReferenceCount} 份试卷引用，题干、选项和正确答案不可修改；如需变更请使用复制功能。`}
          />
        ) : null}

        <section>
          <Typography.Text strong>题干</Typography.Text>
          <Typography.Paragraph
            style={{
              whiteSpace: 'pre-wrap',
              marginTop: 8,
              marginBottom: question.imageUrl ? 12 : 0,
            }}
          >
            {question.content || '暂无题干'}
          </Typography.Paragraph>
          {question.imageUrl ? (
            <Image src={question.imageUrl} width={240} fallback={IMAGE_FALLBACK} alt="题目图片" />
          ) : null}
        </section>

        <Divider style={{ margin: 0 }} />

        {isSaq ? (
          <Typography.Text type="secondary">本题为简答题，无选项。</Typography.Text>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Typography.Text strong>选项</Typography.Text>
            {question.options.length === 0 ? (
              <Alert type="warning" showIcon message="题目数据异常：未配置选项" />
            ) : (
              question.options.map((option, index) => {
                const correct = option.isCorrect === 1;
                return (
                  <div
                    key={option.id ?? index}
                    style={{
                      border: correct ? '1px solid #52c41a' : `1px solid ${token.colorBorderSecondary}`,
                      background: correct ? '#f6ffed' : token.colorBgContainer,
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <Space align="start" style={{ width: '100%' }}>
                      <Tag color={correct ? 'success' : undefined}>
                        {option.optionKey || optionLabel(index)}
                      </Tag>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>
                          {option.content}
                        </Typography.Text>
                        {correct ? (
                          <Tag color="success" style={{ marginLeft: 8 }}>
                            正确答案
                          </Tag>
                        ) : null}
                        {option.imageUrl ? (
                          <div style={{ marginTop: 8 }}>
                            <Image
                              src={option.imageUrl}
                              width={160}
                              fallback={IMAGE_FALLBACK}
                              alt={`选项 ${option.optionKey || optionLabel(index)} 图片`}
                            />
                          </div>
                        ) : null}
                      </div>
                    </Space>
                  </div>
                );
              })
            )}
            {question.options.length > 0 && correctOptions.length === 0 ? (
              <Alert type="warning" showIcon message="未设置正确答案" />
            ) : null}
            {correctOptions.length > 0 ? (
              <Typography.Text strong>正确答案：{correctAnswerText}</Typography.Text>
            ) : null}
          </div>
        )}

        <Divider style={{ margin: 0 }} />

        <section>
          <Typography.Text strong>{isSaq ? '参考答案 / 解析' : '试题解析'}</Typography.Text>
          <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {question.analysis || (isSaq ? '暂无参考答案/解析' : '暂无解析')}
          </Typography.Paragraph>
        </section>
      </div>

      <aside
        style={{
          background: token.colorFillAlter,
          borderRadius: 8,
          padding: 16,
          alignSelf: 'start',
        }}
      >
        <Typography.Text strong>题目信息</Typography.Text>
        <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
          <Descriptions.Item label="题型">
            <Tag color={typeMeta.color}>{typeMeta.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="难度">
            <Tag color={difficultyMeta.color}>{difficultyMeta.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="所属题库">
            {question.questionBank ? (
              <Tag>{question.questionBank.title}</Tag>
            ) : (
              <Typography.Text type="secondary">未归类</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDateTime(question.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {formatDateTime(question.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </aside>
    </div>
  );
}
