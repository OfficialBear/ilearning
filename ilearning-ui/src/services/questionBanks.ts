import type { BankBrief } from '@/types/question';
import { http } from '@/utils/request';

export function fetchAvailableBanks(signal?: AbortSignal): Promise<BankBrief[]> {
  return http.get<BankBrief[]>('/question-banks/available', { signal });
}
