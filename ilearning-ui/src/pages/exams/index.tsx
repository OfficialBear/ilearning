import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Grid, message, theme } from 'antd';
import { useEffect, useState } from 'react';
import { closeExam, deleteExam, fetchExams, publishExam } from '@/services/exams';
import type { ExamListItem, ExamStatus } from '@/types/exam';
import { ApiError } from '@/utils/request';
import ExamDetailDrawer from './components/ExamDetailDrawer';
import ExamEditorDrawer from './components/ExamEditorDrawer';
import ExamFilterBar from './components/ExamFilterBar';
import ExamTable from './components/ExamTable';

interface ExamFilters {
  keyword?: string;
  status?: ExamStatus;
}

type EditorState = { mode: 'create' } | { mode: 'edit'; id: number } | null;

export default function ExamsPage() {
  const [messageApi, messageHolder] = message.useMessage();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;
  const [filters, setFilters] = useState<ExamFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [records, setRecords] = useState<ExamListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchExams({ page, pageSize, ...filters }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setRecords(result.records);
        setTotal(result.total);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        messageApi.error(cause instanceof ApiError ? cause.message : '加载考试失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, pageSize, filters, messageApi, refreshToken]);

  const handleSearch = (nextFilters: ExamFilters) => {
    setLoading(true);
    setFilters(nextFilters);
    setPage(1);
  };

  const handleReset = () => {
    setLoading(true);
    setFilters({});
    setPage(1);
  };

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setLoading(true);
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const refreshCurrentPage = () => {
    setLoading(true);
    setRefreshToken((value) => value + 1);
  };

  const handlePublish = async (record: ExamListItem) => {
    try {
      await publishExam(record.id);
      messageApi.success('考试已发布');
      refreshCurrentPage();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '发布考试失败');
    }
  };

  const handleClose = async (record: ExamListItem) => {
    try {
      await closeExam(record.id);
      messageApi.success('考试已关闭');
      refreshCurrentPage();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '关闭考试失败');
    }
  };

  const handleDelete = async (record: ExamListItem) => {
    try {
      await deleteExam(record.id);
      messageApi.success('考试已删除');
      setLoading(true);
      if (records.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshToken((value) => value + 1);
      }
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '删除考试失败');
    }
  };

  const handleSaved = (mode: 'create' | 'edit') => {
    setEditorState(null);
    setLoading(true);
    if (mode === 'create' && page !== 1) {
      setPage(1);
    } else {
      setRefreshToken((value) => value + 1);
    }
  };

  return (
    <>
      {messageHolder}
      <Card styles={{ body: { padding: 0 } }}>
        <Flex
          vertical={isMobile}
          justify={isMobile ? 'flex-start' : 'space-between'}
          align={isMobile ? 'stretch' : 'flex-start'}
          gap={16}
          wrap
          style={{
            padding: 16,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <ExamFilterBar
            loading={loading}
            stacked={isMobile}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditorState({ mode: 'create' })}
            style={{ flexShrink: 0, width: isMobile ? '100%' : undefined }}
          >
            新增考试
          </Button>
        </Flex>
        <ExamTable
          records={records}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPreview={(record) => setDetailId(record.id)}
          onEdit={(record) => setEditorState({ mode: 'edit', id: record.id })}
          onPublish={(record) => void handlePublish(record)}
          onClose={(record) => void handleClose(record)}
          onDelete={(record) => void handleDelete(record)}
        />
      </Card>
      <ExamEditorDrawer
        open={editorState != null}
        examId={editorState?.mode === 'edit' ? editorState.id : null}
        onClose={() => setEditorState(null)}
        onSaved={() => handleSaved(editorState?.mode ?? 'create')}
      />
      <ExamDetailDrawer
        open={detailId != null}
        examId={detailId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}
