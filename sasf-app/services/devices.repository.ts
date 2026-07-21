import type { DeviceProvider, ConnectedDevice, DeviceProviderId } from '../types';

/**
 * Camada de acesso a dados de dispositivos conectados.
 *
 * Esta é uma implementação MOCK (sem rede/persistência real), criada para
 * deixar a arquitetura pronta para a integração futura com SDKs nativos
 * (Samsung Health, Google Fit/Health Connect, Apple HealthKit, Garmin Connect,
 * Fitbit Web API). Quando essa integração for implementada, basta substituir
 * o corpo destes métodos por chamadas reais — a interface pública (assinatura
 * dos métodos) permanece a mesma, então `DeviceService` e os hooks que o
 * consomem não precisam mudar.
 */
export const PROVIDERS: DeviceProvider[] = [
  { id: 'samsung_health', nome: 'Samsung Health', icone: 'watch-outline', cor: '#1428A0', disponivel: false },
  { id: 'google_fit', nome: 'Google Fit', icone: 'fitness-outline', cor: '#4285F4', disponivel: false },
  { id: 'apple_health', nome: 'Apple Health', icone: 'heart-outline', cor: '#FF2D55', disponivel: false },
  { id: 'garmin', nome: 'Garmin', icone: 'compass-outline', cor: '#007CC3', disponivel: false },
  { id: 'fitbit', nome: 'Fitbit', icone: 'pulse-outline', cor: '#00B0B9', disponivel: false },
];

class DeviceRepositoryMock {
  private connected: ConnectedDevice[] = [];

  async listProviders(): Promise<DeviceProvider[]> {
    return PROVIDERS;
  }

  async listConnected(): Promise<ConnectedDevice[]> {
    return this.connected;
  }

  async connect(_providerId: DeviceProviderId): Promise<never> {
    throw new Error('Integração ainda não disponível. Em breve!');
  }

  async disconnect(_providerId: DeviceProviderId): Promise<void> {
    this.connected = this.connected.filter((d) => d.providerId !== _providerId);
  }
}

export const deviceRepository = new DeviceRepositoryMock();
