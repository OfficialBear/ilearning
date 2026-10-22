import type { PaperStatus } from '@/types/paper';

export interface PaperFilters {
  keyword?: string;
  status?: PaperStatus;
}
