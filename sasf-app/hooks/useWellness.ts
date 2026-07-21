import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wellnessService } from '../services/wellness.service';

export function useNutritionProfile(membroId: string) {
  return useQuery({ queryKey: ['nutritionProfile', membroId], queryFn: () => wellnessService.getNutritionProfile(membroId), enabled: !!membroId });
}
export function useUpsertNutritionProfile(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => wellnessService.upsertNutritionProfile(membroId, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['nutritionProfile', membroId] }) });
}

export function useWeightRecords(membroId: string) {
  return useQuery({ queryKey: ['weight', membroId], queryFn: () => wellnessService.listWeight(membroId), enabled: !!membroId });
}
export function useCreateWeight(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: { pesoKg: number; dataHora: string }) => wellnessService.createWeight(membroId, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['weight', membroId] }); qc.invalidateQueries({ queryKey: ['nutritionProfile', membroId] }); qc.invalidateQueries({ queryKey: ['insights', membroId] }); qc.invalidateQueries({ queryKey: ['healthScore', membroId] }); } });
}
export function useDeleteWeight(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => wellnessService.deleteWeight(membroId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['weight', membroId] }); qc.invalidateQueries({ queryKey: ['healthScore', membroId] }); } });
}

export function useWaterRecords(membroId: string) {
  return useQuery({ queryKey: ['water', membroId], queryFn: () => wellnessService.listWater(membroId), enabled: !!membroId });
}
export function useCreateWater(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: { quantidadeMl: number; dataHora: string }) => wellnessService.createWater(membroId, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['water', membroId] }); qc.invalidateQueries({ queryKey: ['insights', membroId] }); } });
}

export function useMeals(membroId: string) {
  return useQuery({ queryKey: ['meals', membroId], queryFn: () => wellnessService.listMeals(membroId), enabled: !!membroId });
}
export function useCreateMeal(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => wellnessService.createMeal(membroId, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['meals', membroId] }); qc.invalidateQueries({ queryKey: ['insights', membroId] }); } });
}
export function useDeleteMeal(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => wellnessService.deleteMeal(membroId, id), onSuccess: () => qc.invalidateQueries({ queryKey: ['meals', membroId] }) });
}

export function useExercises(membroId: string) {
  return useQuery({ queryKey: ['exercises', membroId], queryFn: () => wellnessService.listExercises(membroId), enabled: !!membroId });
}
export function useCreateExercise(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => wellnessService.createExercise(membroId, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises', membroId] }); qc.invalidateQueries({ queryKey: ['exerciseStats', membroId] }); qc.invalidateQueries({ queryKey: ['insights', membroId] }); } });
}
export function useDeleteExercise(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => wellnessService.deleteExercise(membroId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises', membroId] }); qc.invalidateQueries({ queryKey: ['exerciseStats', membroId] }); } });
}
export function useExerciseWeeklyStats(membroId: string) {
  return useQuery({ queryKey: ['exerciseStats', membroId], queryFn: () => wellnessService.exerciseWeeklyStats(membroId), enabled: !!membroId });
}

export function usePsychologyRecords(membroId: string) {
  return useQuery({ queryKey: ['psychology', membroId], queryFn: () => wellnessService.listPsychology(membroId), enabled: !!membroId });
}
export function useCreatePsychology(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => wellnessService.createPsychology(membroId, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['psychology', membroId] }); qc.invalidateQueries({ queryKey: ['insights', membroId] }); qc.invalidateQueries({ queryKey: ['healthScore', membroId] }); } });
}
export function useDeletePsychology(membroId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => wellnessService.deletePsychology(membroId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['psychology', membroId] }); qc.invalidateQueries({ queryKey: ['healthScore', membroId] }); } });
}

export function useHealthInsights(membroId: string) {
  return useQuery({ queryKey: ['insights', membroId], queryFn: () => wellnessService.getInsights(membroId), enabled: !!membroId, staleTime: 60_000 });
}

export function useHealthScore(membroId: string) {
  return useQuery({ queryKey: ['healthScore', membroId], queryFn: () => wellnessService.getHealthScore(membroId), enabled: !!membroId, staleTime: 60_000 });
}
