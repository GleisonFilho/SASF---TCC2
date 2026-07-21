import { userRepository } from '../repositories/user.repository';

export const usersService = {
  async updateProfile(userId: string, data: {
    nome?: string;
    telefone?: string;
    fotoUrl?: string;
    dataNascimento?: string;
    sexo?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  }) {
    const user = await userRepository.update(userId, {
      ...(data.nome && { nome: data.nome }),
      ...(data.telefone !== undefined && { telefone: data.telefone }),
      ...(data.fotoUrl !== undefined && { fotoUrl: data.fotoUrl }),
      ...(data.dataNascimento && { dataNascimento: new Date(data.dataNascimento) }),
      ...(data.sexo && { sexo: data.sexo }),
      ...(data.endereco !== undefined && { endereco: data.endereco }),
      ...(data.cidade !== undefined && { cidade: data.cidade }),
      ...(data.estado && { estado: data.estado }),
    });

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      fotoUrl: user.fotoUrl,
      dataNascimento: user.dataNascimento,
      sexo: user.sexo,
      endereco: user.endereco,
      cidade: user.cidade,
      estado: user.estado,
      tipoPerfil: user.tipoPerfil,
      statusConta: user.statusConta,
      profissionalDetalhe: user.profissionalDetalhe,
    };
  },
};
