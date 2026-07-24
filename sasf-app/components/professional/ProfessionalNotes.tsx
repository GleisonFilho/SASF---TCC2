import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../ui/Icon';
import { Input } from '../ui/Input';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { useProfessionalNotes, useCreateProfessionalNote, useDeleteProfessionalNote } from '../../hooks/useSharing';

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ProfessionalNotes({ token }: { token: string }) {
  const { data: notes, isLoading } = useProfessionalNotes(token);
  const createNote = useCreateProfessionalNote(token);
  const deleteNote = useDeleteProfessionalNote(token);
  const toast = useToast();
  const [texto, setTexto] = useState('');

  const submit = () => {
    const trimmed = texto.trim();
    if (!trimmed) return;
    createNote.mutate(trimmed, {
      onSuccess: () => setTexto(''),
      onError: () => toast.show('Falha ao salvar anotação.', 'error'),
    });
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-1">
        <Icon name="create-outline" size={17} color="#0F172A" />
        <Text className="text-base font-bold text-gray-900 ml-2">Anotações Profissionais</Text>
      </View>
      <Text className="text-xs text-gray-400 mb-3">Visíveis apenas para você. O paciente não tem acesso a este conteúdo.</Text>

      <View className="bg-surface rounded-2xl p-3.5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-3">
        <Input label="Nova anotação" icon="pencil-outline" placeholder="Ex: Pressão controlada, manter dose atual." value={texto} onChangeText={setTexto} multiline />
        <TouchableOpacity className="bg-primary rounded-xl py-2.5 items-center" style={createNote.isPending ? { opacity: 0.5 } : undefined} onPress={submit} activeOpacity={0.8} disabled={createNote.isPending}>
          <Text className="text-white text-sm font-semibold">{createNote.isPending ? 'Salvando...' : 'Salvar Anotação'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Skeleton width="100%" height={60} />
      ) : !notes?.length ? (
        <Text className="text-xs text-gray-400 text-center py-3">Nenhuma anotação registrada ainda.</Text>
      ) : (
        notes.map((note) => (
          <View key={note.id} className="bg-white rounded-2xl p-3.5 mb-2 border border-gray-100 shadow-sm shadow-gray-900/5">
            <View className="flex-row items-start justify-between">
              <Text className="text-sm text-gray-700 flex-1 mr-2">{note.texto}</Text>
              <TouchableOpacity onPress={() => deleteNote.mutate(note.id)} hitSlop={8}>
                <Icon name="trash-outline" size={14} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-400 mt-1.5">{fmtDateTime(note.createdAt)}</Text>
          </View>
        ))
      )}
    </View>
  );
}
