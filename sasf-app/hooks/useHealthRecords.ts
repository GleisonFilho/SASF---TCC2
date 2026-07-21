import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthRecordsService } from '../services/healthRecords.service';

export function useConditions(membroId: string) {
  return useQuery({
    queryKey: ['conditions', membroId],
    queryFn: () => healthRecordsService.listConditions(membroId),
    enabled: !!membroId,
  });
}

export function useCreateCondition(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { nomeCondicao: string; dataDiagnostico?: string; status?: string; observacoes?: string }) =>
      healthRecordsService.createCondition(membroId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conditions', membroId] }),
  });
}

export function useDeleteCondition(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthRecordsService.deleteCondition(membroId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conditions', membroId] }),
  });
}

export function useAllergies(membroId: string) {
  return useQuery({
    queryKey: ['allergies', membroId],
    queryFn: () => healthRecordsService.listAllergies(membroId),
    enabled: !!membroId,
  });
}

export function useCreateAllergy(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { substancia: string; gravidade?: string; reacao?: string }) =>
      healthRecordsService.createAllergy(membroId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allergies', membroId] }),
  });
}

export function useDeleteAllergy(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthRecordsService.deleteAllergy(membroId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allergies', membroId] }),
  });
}

export function useMedications(membroId: string) {
  return useQuery({
    queryKey: ['medications', membroId],
    queryFn: () => healthRecordsService.listMedications(membroId),
    enabled: !!membroId,
  });
}

export function useCreateMedication(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { nomeMedicamento: string; dosagem?: string; frequencia?: string; dataInicio?: string; dataFim?: string; usoContinuo?: boolean }) =>
      healthRecordsService.createMedication(membroId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications', membroId] }),
  });
}

export function useDeleteMedication(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthRecordsService.deleteMedication(membroId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications', membroId] }),
  });
}

export function useEmergencyContacts(membroId: string) {
  return useQuery({
    queryKey: ['emergencyContacts', membroId],
    queryFn: () => healthRecordsService.listEmergencyContacts(membroId),
    enabled: !!membroId,
  });
}

export function useCreateEmergencyContact(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { nome: string; parentesco: string; telefone: string }) =>
      healthRecordsService.createEmergencyContact(membroId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emergencyContacts', membroId] }),
  });
}

export function useDeleteEmergencyContact(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthRecordsService.deleteEmergencyContact(membroId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emergencyContacts', membroId] }),
  });
}

export function useVitalSigns(membroId: string) {
  return useQuery({
    queryKey: ['vitalSigns', membroId],
    queryFn: () => healthRecordsService.listVitalSigns(membroId),
    enabled: !!membroId,
  });
}

export function useCreateVitalSign(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { tipoMedicao: string; valorPrimario: number; valorSecundario?: number; unidade: string; dataHoraMedicao: string; observacoes?: string }) =>
      healthRecordsService.createVitalSign(membroId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vitalSigns', membroId] }),
  });
}

export function useDeleteVitalSign(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthRecordsService.deleteVitalSign(membroId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vitalSigns', membroId] }),
  });
}

export function useSymptoms(membroId: string) {
  return useQuery({
    queryKey: ['symptoms', membroId],
    queryFn: () => healthRecordsService.listSymptoms(membroId),
    enabled: !!membroId,
  });
}

export function useCreateSymptom(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { descricao: string; intensidade: number; dataHoraOcorrencia: string; observacoes?: string }) =>
      healthRecordsService.createSymptom(membroId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['symptoms', membroId] }),
  });
}

export function useDeleteSymptom(membroId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthRecordsService.deleteSymptom(membroId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['symptoms', membroId] }),
  });
}
