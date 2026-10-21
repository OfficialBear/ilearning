import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Grid, message, theme } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { deleteQuestionBank, fetchQuestionBanks, updateQuestionBankStatus } from '@/services/questionBanks';
import type { BankStatus, QuestionBankListItem } from '@/types/question';
import { ApiError } from '@/utils/request';
import QuestionBankFilterBar from './components/QuestionBankFilterBar';
import QuestionBankFormDrawer from './components/QuestionBankFormDrawer';
import QuestionBankTable from './components/QuestionBankTable';
import type { QuestionBankFilters } from './types';

type FormState = { mode: 'create' } | { mode: 'edit'; record: QuestionBankListItem };

export default function QuestionBanksPage() {
  const [messageApi, messageHolder] = message.useMessage();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const isMobile = !screens.sm;
  const [filters, setFilters] = useState<QuestionBankFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [records, setRecords] = useState<QuestionBankListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestionBanks({ page, pageSize, ...filters }, controller.signal)
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
        messageApi.error(cause instanceof ApiError ? cause.message : '加载题库失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, pageSize, filters, messageApi, refreshToken]);

  const refreshCurrentPage = () => {
    setLoading(true);
    if (page !== 1) {
      setPage(1);
    } else {
      setRefreshToken((value) => value + 1);
    }
  };

  const handleSearch = (nextFilters: QuestionBankFilters) => {
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

  const handleToggleStatus = async (record: QuestionBankListItem) => {
    const nextStatus: BankStatus = record.status === 1 ? 0 : 1;
    setStatusUpdatingId(record.id);
    try {
      await updateQuestionBankStatus(record.id, nextStatus);
      messageApi.success(nextStatus === 1 ? '题库已启用' : '题库已停用');
      setRefreshToken((value) => value + 1);
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '更新题库状态失败');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async (record: QuestionBankListItem) => {
    try {
      await deleteQuestionBank(record.id);
      messageApi.success('题库已删除');
      setLoading(true);
      if (records.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshToken((value) => value + 1);
      }
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '删除题库失败');
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
          <QuestionBankFilterBar
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
            新增题库
          </Button>
        </Flex>
        <QuestionBankTable
          records={records}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          statusUpdatingId={statusUpdatingId}
          onPageChange={handlePageChange}
          onEdit={(record) => setFormState({ mode: 'edit', record })}
          onToggleStatus={(record) => void handleToggleStatus(record)}
          onDelete={(record) => void handleDelete(record)}
          onViewQuestions={(record) => navigate(`/questions?questionBankId=${record.id}`)}
        />
      </Card>
      <QuestionBankFormDrawer
        open={formState != null}
        mode={formState?.mode ?? 'create'}
        record={formState?.mode === 'edit' ? formState.record : null}
        onClose={() => setFormState(null)}
        onSaved={() => {
          setFormState(null);
          refreshCurrentPage();
        }}
      />
    </>
  );
}
