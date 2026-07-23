import { PendingApprovalScreen } from '../../components/professional/PendingApprovalScreen';
import { useAuthStore } from '../../store/authStore';
import { useMe, useLogout } from '../../hooks/useAuth';

export default function AguardandoAprovacaoScreen() {
  const user = useAuthStore((s) => s.user);
  const { refetch, isFetching } = useMe();
  const logout = useLogout();

  return (
    <PendingApprovalScreen
      profissionalDetalhe={user?.profissionalDetalhe}
      checking={isFetching}
      onCheckStatus={() => refetch()}
      onLogout={() => logout.mutate()}
    />
  );
}
