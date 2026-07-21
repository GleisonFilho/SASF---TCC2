import { deviceRepository } from './devices.repository';
import type { DeviceProvider, ConnectedDevice, DeviceProviderId } from '../types';

/**
 * Camada de regras de negócio para integração com dispositivos vestíveis.
 * Hoje delega ao `deviceRepository` (mock). Futuramente irá orquestrar
 * autenticação OAuth/SDK nativo por provedor, normalizar as medições
 * recebidas (passos, frequência cardíaca, sono) e persistir via API REST
 * (tabela `DispositivoConectado` já reservada no schema do backend).
 */
export const devicesService = {
  async listProviders(): Promise<DeviceProvider[]> {
    return deviceRepository.listProviders();
  },

  async listConnected(): Promise<ConnectedDevice[]> {
    return deviceRepository.listConnected();
  },

  async connect(providerId: DeviceProviderId): Promise<void> {
    await deviceRepository.connect(providerId);
  },

  async disconnect(providerId: DeviceProviderId): Promise<void> {
    await deviceRepository.disconnect(providerId);
  },
};
