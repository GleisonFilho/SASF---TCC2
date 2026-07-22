import { familyMembersService } from './familyMembers.service';
import { conditionRepository } from '../repositories/condition.repository';
import { allergyRepository } from '../repositories/allergy.repository';
import { medicationRepository } from '../repositories/medication.repository';
import { vitalSignRepository } from '../repositories/vitalSign.repository';
import { symptomRepository } from '../repositories/symptom.repository';
import { nutritionRepository } from '../repositories/nutrition.repository';
import { exerciseRepository } from '../repositories/exercise.repository';
import { psychologyRepository } from '../repositories/psychology.repository';

export const reportService = {
  async generate(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);

    const [
      condicoes,
      alergias,
      medicamentos,
      sinaisVitais,
      sintomas,
      perfil,
      pesoRecente,
      exercicios,
      psicologico,
    ] = await Promise.all([
      conditionRepository.findAllByMemberId(membroId),
      allergyRepository.findAllByMemberId(membroId),
      medicationRepository.findAllByMemberId(membroId),
      vitalSignRepository.findAllByMemberId(membroId),
      symptomRepository.findAllByMemberId(membroId),
      nutritionRepository.findProfile(membroId),
      nutritionRepository.findWeightRecords(membroId, 5),
      exerciseRepository.findByMemberId(membroId, 10),
      psychologyRepository.findByMemberId(membroId, 10),
    ]);

    return {
      condicoes,
      alergias,
      medicamentos,
      sinaisVitais: sinaisVitais.slice(0, 10),
      sintomas: sintomas.slice(0, 10),
      nutricional: { perfil, pesoRecente },
      exercicios,
      psicologico,
      geradoEm: new Date().toISOString(),
    };
  },
};
