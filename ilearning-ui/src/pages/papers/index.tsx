import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Grid, message, theme } from 'antd';
import { useEffect, useState } from 'react';
import { archivePaper, deletePaper, fetchPapers, publishPaper } from '@/services/papers';
import type { PaperListItem } from '@/types/paper';
import { ApiError } from '@/utils/request';
import PaperDetailDrawer from './components/PaperDetailDrawer';
import PaperEditorDrawer from './components/PaperEditorDrawer';
import PaperFilterBar from './components/PaperFilterBar';
import PaperTable from './components/PaperTable';
import type { PaperFilters } from './types';

type EditorState = { mode: 'create' } | { mode: 'edit'; id: number } | null;

export default function PapersPage() {
  const [messageApi, messageHolder] = message.useMessage();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;
  const [filters, setFilters] = useState<PaperFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [records, setRecords] = useState<PaperListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPapers({ page, pageSize, ...filters }, controller.signal)
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
        messageApi.error(cause instanceof ApiError ? cause.message : '加载试卷失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, pageSize, filters, messageApi, refreshToken]);

  const handleSearch = (nextFilters: PaperFilters) => {
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

  const handlePublish = async (record: PaperListItem) => {
    try {
      await publishPaper(record.id);
      messageApi.success('试卷已发布');
      refreshCurrentPage();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '发布试卷失败');
    }
  };

  const handleArchive = async (record: PaperListItem) => {
    try {
      await archivePaper(record.id);
      messageApi.success('试卷已归档');
      refreshCurrentPage();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '归档试卷失败');
    }
  };

  const handleDelete = async (record: PaperListItem) => {
    try {
      await deletePaper(record.id);
      messageApi.success('试卷已删除');
      setLoading(true);
      if (records.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshToken((value) => value + 1);
      }
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '删除试卷失败');
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
          <PaperFilterBar
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
            新增试卷
          </Button>
        </Flex>
        <PaperTable
          records={records}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPreview={(record) => setDetailId(record.id)}
          onEdit={(record) => setEditorState({ mode: 'edit', id: record.id })}
          onPublish={(record) => void handlePublish(record)}
          onArchive={(record) => void handleArchive(record)}
          onDelete={(record) => void handleDelete(record)}
        />
      </Card>
      <PaperEditorDrawer
        open={editorState != null}
        paperId={editorState?.mode === 'edit' ? editorState.id : null}
        onClose={() => setEditorState(null)}
        onSaved={() => handleSaved(editorState?.mode ?? 'create')}
      />
      <PaperDetailDrawer
        open={detailId != null}
        paperId={detailId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}
