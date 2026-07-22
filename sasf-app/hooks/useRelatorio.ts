import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/report.service';

export function useRelatorio(membroId: string) {
  return useQuery({
    queryKey: ['relatorio', membroId],
    queryFn: () => reportService.get(membroId),
    enabled: !!membroId,
    staleTime: 60_000,
  });
}
