import { View, Text } from 'react-native';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Icon, type IoniconsName } from '../../../components/ui/Icon';
import { Logo } from '../../../components/ui/Logo';

function Section({ icon, title, children }: { icon: IoniconsName; title: string; children: React.ReactNode }) {
  return (
    <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
      <View className="flex-row items-center mb-2.5">
        <View className="w-7 h-7 rounded-lg bg-primary-50 items-center justify-center">
          <Icon name={icon} size={14} color="#2563EB" />
        </View>
        <Text className="text-sm font-bold text-gray-900 ml-2.5">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View className="bg-gray-100 px-2.5 py-1 rounded-lg mr-1.5 mb-1.5">
      <Text className="text-xs font-medium text-gray-600">{label}</Text>
    </View>
  );
}

const FRONTEND_TAGS = ['React Native', 'Expo', 'Expo Router', 'NativeWind', 'TanStack Query', 'Zustand'];
const BACKEND_TAGS = ['Node.js', 'Express', 'Prisma', 'PostgreSQL', 'JWT'];
const OTHER_TAGS = ['Zod', 'react-native-svg'];

export default function SobreScreen() {
  return (
    <ScreenContainer>
      <View className="items-center mb-6 mt-2">
        <Logo size={72} />
        <Text className="text-2xl font-bold text-gray-900 mt-4 tracking-tight">SASF</Text>
        <View className="bg-gray-100 px-3 py-1 rounded-full mt-2">
          <Text className="text-xs font-semibold text-gray-500">Versão 1.0.0</Text>
        </View>
      </View>

      <Section icon="flag-outline" title="Missão">
        <Text className="text-sm text-gray-600 leading-5">
          Facilitar o acompanhamento da saúde de toda a família em um único lugar, de forma segura,
          organizada e em conformidade com a LGPD, conectando pacientes e profissionais de saúde
          com confiança e transparência.
        </Text>
      </Section>

      <Section icon="eye-outline" title="Visão">
        <Text className="text-sm text-gray-600 leading-5">
          Ser uma referência em saúde digital familiar no Brasil, integrando nutrição, exercícios,
          saúde mental e acompanhamento clínico em uma plataforma inteligente e acessível.
        </Text>
      </Section>

      <Section icon="clipboard-outline" title="Objetivo do Projeto">
        <Text className="text-sm text-gray-600 leading-5">
          O SASF (Sistema de Acompanhamento de Saúde Familiar) nasceu como Trabalho de Conclusão
          de Curso com o objetivo de demonstrar, na prática, a aplicação de arquitetura de software
          moderna na construção de um produto de saúde digital completo — do banco de dados à
          experiência do usuário.
        </Text>
      </Section>

      <Section icon="school-outline" title="Instituição">
        <Text className="text-sm text-gray-600 leading-5">
          Instituto Federal de Educação, Ciência e Tecnologia do Piauí (IFPI) — Campus Picos{'\n'}
          Trabalho de Conclusão de Curso (TCC)
        </Text>
      </Section>

      <Section icon="code-slash-outline" title="Tecnologias Utilizadas">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Frontend</Text>
        <View className="flex-row flex-wrap mb-3">
          {FRONTEND_TAGS.map((t) => <Tag key={t} label={t} />)}
        </View>
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Backend</Text>
        <View className="flex-row flex-wrap mb-3">
          {BACKEND_TAGS.map((t) => <Tag key={t} label={t} />)}
        </View>
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Validação · Gráficos</Text>
        <View className="flex-row flex-wrap">
          {OTHER_TAGS.map((t) => <Tag key={t} label={t} />)}
        </View>
      </Section>

      <Section icon="document-text-outline" title="Licença">
        <Text className="text-sm text-gray-600 leading-5">
          Projeto acadêmico desenvolvido para fins educacionais. Todos os direitos reservados aos autores.
        </Text>
      </Section>

      <Section icon="heart-outline" title="Agradecimentos">
        <Text className="text-sm text-gray-600 leading-5">
          Aos professores orientadores, à coordenação do curso e a todos que contribuíram com
          feedback durante o desenvolvimento deste projeto.
        </Text>
      </Section>

      <Section icon="mail-outline" title="Contato">
        <Text className="text-sm text-gray-600 leading-5">
          IFPI Campus Picos{'\n'}
          Picos — Piauí, Brasil
        </Text>
      </Section>
    </ScreenContainer>
  );
}
