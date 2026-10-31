import { Button, Card, Flex, Input, Pagination, Tabs, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  fetchAttemptHistory,
  fetchUserExams,
  startAttempt,
} from '@/services/userExams';
import type { AttemptHistoryItem, UserExamItem } from '@/types/attempt';
import { ApiError } from '@/utils/request';
import AttemptHistoryList from './components/AttemptHistoryList';
import AvailableExamGrid from './components/AvailableExamGrid';

type TabKey = 'available' | 'history';

export default function ExamCenterPage() {
  const navigate = useNavigate();
  const [messageApi, messageHolder] = message.useMessage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: TabKey = searchParams.get('tab') === 'history' ? 'history' : 'available';

  const [keyword, setKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [exams, setExams] = useState<UserExamItem[]>([]);
  const [examTotal, setExamTotal] = useState(0);
  const [examLoading, setExamLoading] = useState(true);
  const [examRefresh, setExamRefresh] = useState(0);
  const [startingId, setStartingId] = useState<number | null>(null);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [history, setHistory] = useState<AttemptHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchUserExams({ page, pageSize, keyword: keyword || undefined }, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setExams(result.records);
          setExamTotal(result.total);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          messageApi.error(cause instanceof ApiError ? cause.message : '加载考试失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setExamLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, pageSize, keyword, examRefresh, messageApi]);

  useEffect(() => {
    if (tab !== 'history') {
      return;
    }
    const controller = new AbortController();
    fetchAttemptHistory({ page: historyPage, pageSize: historyPageSize }, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setHistory(result.records);
          setHistoryTotal(result.total);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          messageApi.error(cause instanceof ApiError ? cause.message : '加载考试记录失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setHistoryLoading(false);
        }
      });
    return () => controller.abort();
  }, [tab, historyPage, historyPageSize, messageApi]);

  const handleStart = async (exam: UserExamItem) => {
    setStartingId(exam.id);
    try {
      const paper = await startAttempt(exam.id);
      navigate(`/exam-center/attempt/${paper.attemptId}`);
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '开始考试失败');
      setExamLoading(true);
      setExamRefresh((value) => value + 1);
    } finally {
      setStartingId(null);
    }
  };

  const handleResume = (item: AttemptHistoryItem) => {
    navigate(`/exam-center/attempt/${item.id}`);
  };

  const handleViewResult = (item: AttemptHistoryItem) => {
    navigate(`/exam-center/result/${item.id}`);
  };

  return (
    <Card styles={{ body: { padding: 16 } }}>
      {messageHolder}
      <Tabs
        activeKey={tab}
        onChange={(key) => {
          if (key === 'history') {
            setHistoryLoading(true);
          }
          setSearchParams(key === 'history' ? { tab: 'history' } : {});
        }}
        items={[
          {
            key: 'available',
            label: '可参加的考试',
            children: (
              <Flex vertical gap={16}>
                <Flex justify="space-between" align="center" wrap gap={12}>
                  <Input.Search
                    allowClear
                    value={keywordInput}
                    placeholder="搜索考试或试卷"
                    style={{ maxWidth: 320 }}
                    onChange={(event) => setKeywordInput(event.target.value)}
                    onSearch={(value) => {
                      setExamLoading(true);
                      setKeyword(value.trim());
                      setPage(1);
                    }}
                  />
                  <Button
                    onClick={() => {
                      setExamLoading(true);
                      setExamRefresh((value) => value + 1);
                    }}
                  >
                    刷新
                  </Button>
                </Flex>
                <AvailableExamGrid
                  items={exams}
                  loading={examLoading}
                  startingId={startingId}
                  onStart={(exam) => void handleStart(exam)}
                />
                {examTotal > 0 ? (
                  <Flex justify="flex-end">
                    <Pagination
                      current={page}
                      pageSize={pageSize}
                      total={examTotal}
                      showSizeChanger
                      pageSizeOptions={[6, 12, 24]}
                      showTotal={(value) => `共 ${value} 场考试`}
                      onChange={(nextPage, nextPageSize) => {
                        setExamLoading(true);
                        setPage(nextPage);
                        setPageSize(nextPageSize);
                      }}
                    />
                  </Flex>
                ) : null}
              </Flex>
            ),
          },
          {
            key: 'history',
            label: '我的考试记录',
            children: (
              <AttemptHistoryList
                items={history}
                loading={historyLoading}
                page={historyPage}
                pageSize={historyPageSize}
                total={historyTotal}
                onPageChange={(nextPage, nextPageSize) => {
                  setHistoryLoading(true);
                  setHistoryPage(nextPage);
                  setHistoryPageSize(nextPageSize);
                }}
                onResume={handleResume}
                onViewResult={handleViewResult}
              />
            ),
          },
        ]}
      />
    </Card>
  );
}
