import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Grid, message, theme } from 'antd';
import { useEffect, useState } from 'react';
import { copyQuestion, deleteQuestion, fetchQuestions } from '@/services/questions';
import { fetchAvailableBanks } from '@/services/questionBanks';
import type { BankBrief, QuestionListItem } from '@/types/question';
import { ApiError } from '@/utils/request';
import QuestionDetailDrawer from './components/QuestionDetailDrawer';
import QuestionFilterBar from './components/QuestionFilterBar';
import QuestionFormDrawer from './components/QuestionFormDrawer';
import QuestionTable from './components/QuestionTable';
import type { QuestionFilters } from './types';

type FormState = { mode: 'create' } | { mode: 'edit'; id: number };

export default function QuestionsPage() {
  const [messageApi, messageHolder] = message.useMessage();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [records, setRecords] = useState<QuestionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [banks, setBanks] = useState<BankBrief[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestions({ page, pageSize, ...filters }, controller.signal)
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
        messageApi.error(cause instanceof ApiError ? cause.message : '加载试题失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, pageSize, filters, messageApi, refreshToken]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAvailableBanks(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setBanks(data);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          messageApi.error(cause instanceof ApiError ? cause.message : '加载题库失败');
        }
      });
    return () => controller.abort();
  }, [messageApi]);

  const refreshCurrentPage = () => {
    setLoading(true);
    if (page !== 1) {
      setPage(1);
    } else {
      setRefreshToken((value) => value + 1);
    }
  };

  const handleSearch = (nextFilters: QuestionFilters) => {
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

  const handleDelete = async (record: QuestionListItem) => {
    try {
      await deleteQuestion(record.id);
      messageApi.success('试题已删除');
      setLoading(true);
      if (records.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshToken((value) => value + 1);
      }
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '删除试题失败');
    }
  };

  const handleCopy = async (id: number) => {
    try {
      const newId = await copyQuestion(id);
      messageApi.success('已复制为新题');
      setDetailId(null);
      setFormState({ mode: 'edit', id: newId });
      refreshCurrentPage();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '复制试题失败');
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
          <QuestionFilterBar
            banks={banks}
            loading={loading}
            stacked={isMobile}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormState({ mode: 'create' })}
            style={{ flexShrink: 0, width: isMobile ? '100%' : undefined }}
          >
            新增试题
          </Button>
        </Flex>
        <QuestionTable
          records={records}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPreview={(record) => setDetailId(record.id)}
          onEdit={(record) => setFormState({ mode: 'edit', id: record.id })}
          onCopy={(record) => void handleCopy(record.id)}
          onDelete={(record) => void handleDelete(record)}
        />
      </Card>
      <QuestionDetailDrawer
        open={detailId != null}
        questionId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(id) => {
          setDetailId(null);
          setFormState({ mode: 'edit', id });
        }}
        onCopy={(id) => void handleCopy(id)}
      />
      <QuestionFormDrawer
        open={formState != null}
        mode={formState?.mode ?? 'create'}
        questionId={formState && formState.mode === 'edit' ? formState.id : null}
        banks={banks}
        onClose={() => setFormState(null)}
        onSaved={() => {
          setFormState(null);
          refreshCurrentPage();
        }}
      />
    </>
  );
}
