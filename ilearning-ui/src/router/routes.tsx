import {
  DatabaseOutlined,
  FileTextOutlined,
  HomeOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import ExamsPage from '@/pages/exams';
import HomePage from '@/pages/home';
import QuestionBanksPage from '@/pages/question-banks';
import QuestionsPage from '@/pages/questions';

export interface AppRoute {
  path: string;
  title: string;
  icon: ReactNode;
  element: ReactNode;
}

export const APP_ROUTES: AppRoute[] = [
  { path: '/', title: '首页', icon: <HomeOutlined />, element: <HomePage /> },
  {
    path: '/questions',
    title: '试题管理',
    icon: <FileTextOutlined />,
    element: <QuestionsPage />,
  },
  {
    path: '/question-banks',
    title: '题库管理',
    icon: <DatabaseOutlined />,
    element: <QuestionBanksPage />,
  },
  {
    path: '/exams',
    title: '考试管理',
    icon: <ScheduleOutlined />,
    element: <ExamsPage />,
  },
];

export function resolveRoute(pathname: string): AppRoute {
  const matched = APP_ROUTES.find(
    (route) =>
      route.path !== '/' &&
      (pathname === route.path || pathname.startsWith(`${route.path}/`)),
  );
  return matched ?? APP_ROUTES[0];
}
