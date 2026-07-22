import { Platform } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';

// No Expo Go (a partir do SDK 53), o módulo nativo de notificações não está
// presente no binário — mesmo chamadas locais (não-push) derrubam o app ao
// tentar registrar canal/handler. Detectamos isso e viramos no-op nesse caso;
// funciona normalmente num development build ou build de produção.
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

const MEDICATION_REMINDER_ID = 'sasf-lembrete-medicamentos';
const WEEKLY_SUMMARY_ID = 'sasf-resumo-semanal';

// Horários fixos (não configuráveis pelo usuário nesta versão): lembrete de
// medicamentos todo dia às 08:00, resumo semanal aos domingos às 18:00.
const MEDICATION_REMINDER_HOUR = 8;
const WEEKLY_SUMMARY_WEEKDAY = 1; // expo-notifications: 1 = domingo
const WEEKLY_SUMMARY_HOUR = 18;

let initialized = false;

/** Import + setup do módulo nativo, adiado e só executado fora do Expo Go. */
async function getNotifications() {
  const Notifications = await import('expo-notifications');

  if (!initialized) {
    initialized = true;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SASF',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }

  return Notifications;
}

export const notificationsService = {
  async requestPermission(): Promise<boolean> {
    if (isExpoGo) return false;
    const Notifications = await getNotifications();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async enableMedicationReminder(): Promise<boolean> {
    if (isExpoGo) return false;
    const granted = await this.requestPermission();
    if (!granted) return false;

    const Notifications = await getNotifications();
    await Notifications.cancelScheduledNotificationAsync(MEDICATION_REMINDER_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: MEDICATION_REMINDER_ID,
      content: {
        title: 'Lembrete de medicamentos',
        body: 'Não esqueça de tomar seus medicamentos de hoje.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: MEDICATION_REMINDER_HOUR,
        minute: 0,
      },
    });
    return true;
  },

  async disableMedicationReminder(): Promise<void> {
    if (isExpoGo) return;
    const Notifications = await getNotifications();
    await Notifications.cancelScheduledNotificationAsync(MEDICATION_REMINDER_ID).catch(() => {});
  },

  async enableWeeklySummary(): Promise<boolean> {
    if (isExpoGo) return false;
    const granted = await this.requestPermission();
    if (!granted) return false;

    const Notifications = await getNotifications();
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_SUMMARY_ID,
      content: {
        title: 'Resumo semanal',
        body: 'Confira o resumo de saúde da sua família desta semana no SASF.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: WEEKLY_SUMMARY_WEEKDAY,
        hour: WEEKLY_SUMMARY_HOUR,
        minute: 0,
      },
    });
    return true;
  },

  async disableWeeklySummary(): Promise<void> {
    if (isExpoGo) return;
    const Notifications = await getNotifications();
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_ID).catch(() => {});
  },

  /** Re-sincroniza os agendamentos com o estado salvo — chamado uma vez no boot do app. */
  async syncOnBoot(state: { lembretesMedicamentos: boolean; resumoSemanal: boolean }): Promise<void> {
    if (isExpoGo || Platform.OS === 'web') return;
    const Notifications = await getNotifications();
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    if (state.lembretesMedicamentos) await this.enableMedicationReminder();
    else await this.disableMedicationReminder();

    if (state.resumoSemanal) await this.enableWeeklySummary();
    else await this.disableWeeklySummary();
  },

  /** true quando rodando no Expo Go, onde notificações locais não funcionam (SDK 53+). */
  isAvailable(): boolean {
    return !isExpoGo;
  },
};
