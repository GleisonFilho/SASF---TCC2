import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesService } from '../services/devices.service';
import type { DeviceProviderId } from '../types';

export function useDeviceProviders() {
  return useQuery({ queryKey: ['deviceProviders'], queryFn: devicesService.listProviders, staleTime: Infinity });
}

export function useConnectedDevices() {
  return useQuery({ queryKey: ['connectedDevices'], queryFn: devicesService.listConnected });
}

export function useConnectDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (providerId: DeviceProviderId) => devicesService.connect(providerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connectedDevices'] }),
  });
}
