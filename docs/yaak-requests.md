# SASF — Requisições para Teste no Yaak

Base URL: `http://localhost:3333/api`

---

## 1. Health Check

```
GET {{base}}/health
```

---

## 2. Cadastro de Paciente

```
POST {{base}}/auth/register
Content-Type: application/json

{
  "nome": "Ana Costa",
  "email": "ana@email.com",
  "senha": "Teste@123",
  "telefone": "(89) 99999-0010"
}
```

Resposta esperada: `201 Created` com `user`, `accessToken`, `refreshToken`.

---

## 3. Cadastro de Profissional

```
POST {{base}}/auth/register/professional
Content-Type: application/json

{
  "nome": "Dra. Carla Lima",
  "email": "carla@email.com",
  "senha": "Teste@123",
  "telefone": "(89) 99999-0020",
  "registroProfissional": "COREN-54321",
  "categoriaConselho": "COREN",
  "ufConselho": "PI",
  "especialidade": "Enfermagem"
}
```

Resposta esperada: `201 Created` com `user` (statusConta: PENDENTE) e `message`.

Conselhos válidos: `CRM`, `COREN`, `CRP`, `CRN`, `CREFITO`, `CRF`, `CRO`.

---

## 4. Login

```
POST {{base}}/auth/login
Content-Type: application/json

{
  "email": "maria@email.com",
  "senha": "Senha@123"
}
```

Resposta esperada: `200 OK` com `user`, `accessToken`, `refreshToken`.

Copie o `accessToken` para usar como Bearer nas rotas protegidas.
Copie o `refreshToken` para usar no refresh e logout.

---

## 5. Refresh Token

```
POST {{base}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<cole o refreshToken do login>"
}
```

Resposta esperada: `200 OK` com novos `accessToken` e `refreshToken`.

O refresh token anterior é invalidado (rotação).

---

## 6. Dados do Usuário Logado

```
GET {{base}}/auth/me
Authorization: Bearer <accessToken>
```

Resposta esperada: `200 OK` com dados do usuário e `profissionalDetalhe` (se profissional).

---

## 7. Logout

```
POST {{base}}/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "<cole o refreshToken atual>"
}
```

Resposta esperada: `200 OK` com `message`.

Após logout, o refresh token não funciona mais.

---

## Membros da Família

Todas as rotas requerem `Authorization: Bearer {{token}}`.

### Cadastrar membro

```
POST {{base}}/family-members
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nome": "Pedro Silva",
  "dataNascimento": "2015-03-10",
  "sexo": "Masculino",
  "parentesco": "Filho"
}
```

Resposta esperada: `201 Created` com o membro criado.

Valores de `sexo`: `Masculino`, `Feminino`, `Outro`.

### Listar membros do responsável

```
GET {{base}}/family-members
Authorization: Bearer {{token}}
```

Resposta esperada: `200 OK` com array de membros do usuário logado.

### Buscar membro por ID

```
GET {{base}}/family-members/{{membroId}}
Authorization: Bearer {{token}}
```

Resposta esperada: `200 OK` com os dados do membro.

### Atualizar membro

```
PUT {{base}}/family-members/{{membroId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nome": "Pedro Silva Santos",
  "parentesco": "Filho mais velho"
}
```

Resposta esperada: `200 OK` com o membro atualizado. Todos os campos são opcionais.

### Excluir membro

```
DELETE {{base}}/family-members/{{membroId}}
Authorization: Bearer {{token}}
```

Resposta esperada: `200 OK` — `"Membro removido com sucesso."`

### Erros esperados — Membros

| Cenário | Esperado |
|---|---|
| Sem token | `401` — `"Token não fornecido."` |
| ID de membro de outro usuário | `403` — `"Acesso negado. Este membro não pertence à sua família."` |
| ID inexistente | `404` — `"Membro não encontrado."` |
| Body com dados inválidos | `400` — `"Dados inválidos."` com `details` |

---

## Condições de Saúde

Todas as rotas requerem `Authorization: Bearer {{token}}`.
Use o `{{membroId}}` obtido ao criar/listar membros da família.

### Criar condição

```
POST {{base}}/family-members/{{membroId}}/conditions
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nomeCondicao": "Asma",
  "dataDiagnostico": "2020-06-15",
  "status": "CONTROLADA",
  "observacoes": "Usa bombinha quando necessário"
}
```

Resposta esperada: `201 Created`.

Valores de `status`: `ATIVA` (padrão), `CONTROLADA`, `RESOLVIDA`.
Campos opcionais: `dataDiagnostico`, `status`, `observacoes`.

### Listar condições de um membro

```
GET {{base}}/family-members/{{membroId}}/conditions
Authorization: Bearer {{token}}
```

### Buscar condição por ID

```
GET {{base}}/family-members/{{membroId}}/conditions/{{conditionId}}
Authorization: Bearer {{token}}
```

### Atualizar condição

```
PUT {{base}}/family-members/{{membroId}}/conditions/{{conditionId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "RESOLVIDA",
  "observacoes": "Tratamento concluído"
}
```

Todos os campos são opcionais no update.

### Excluir condição

```
DELETE {{base}}/family-members/{{membroId}}/conditions/{{conditionId}}
Authorization: Bearer {{token}}
```

Resposta esperada: `200 OK` — `"Condição de saúde removida com sucesso."`

### Erros esperados — Condições

| Cenário | Esperado |
|---|---|
| Sem token | `401` — `"Token não fornecido."` |
| Membro de outro usuário | `403` — `"Acesso negado. Este membro não pertence à sua família."` |
| Membro inexistente | `404` — `"Membro não encontrado."` |
| Condição inexistente | `404` — `"Condição de saúde não encontrada."` |
| Body inválido (status errado, nome curto) | `400` — `"Dados inválidos."` com `details` |

---

## Alergias

Todas as rotas requerem `Authorization: Bearer {{token}}`.

### Criar alergia

```
POST {{base}}/family-members/{{membroId}}/allergies
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "substancia": "Dipirona",
  "gravidade": "GRAVE",
  "reacao": "Edema de glote"
}
```

Resposta esperada: `201 Created`.

Valores de `gravidade`: `LEVE` (padrão), `MODERADA`, `GRAVE`.
Campos opcionais: `gravidade`, `reacao`.

### Listar alergias

```
GET {{base}}/family-members/{{membroId}}/allergies
Authorization: Bearer {{token}}
```

### Buscar alergia por ID

```
GET {{base}}/family-members/{{membroId}}/allergies/{{allergyId}}
Authorization: Bearer {{token}}
```

### Atualizar alergia

```
PUT {{base}}/family-members/{{membroId}}/allergies/{{allergyId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "gravidade": "MODERADA",
  "reacao": "Urticária leve"
}
```

### Excluir alergia

```
DELETE {{base}}/family-members/{{membroId}}/allergies/{{allergyId}}
Authorization: Bearer {{token}}
```

### Erros esperados — Alergias

| Cenário | Esperado |
|---|---|
| Sem token | `401` |
| Membro de outro usuário | `403` |
| Membro inexistente | `404` — `"Membro não encontrado."` |
| Alergia inexistente | `404` — `"Alergia não encontrada."` |
| Body inválido | `400` — `"Dados inválidos."` |

---

## Medicamentos em Uso

### Criar medicamento

```
POST {{base}}/family-members/{{membroId}}/medications
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nomeMedicamento": "Losartana",
  "dosagem": "50mg",
  "frequencia": "1x ao dia",
  "dataInicio": "2023-01-10",
  "usoContinuo": true
}
```

Resposta esperada: `201 Created`.

Campos opcionais: `dosagem`, `frequencia`, `dataInicio`, `dataFim`, `usoContinuo`.

### Listar medicamentos

```
GET {{base}}/family-members/{{membroId}}/medications
Authorization: Bearer {{token}}
```

### Buscar medicamento por ID

```
GET {{base}}/family-members/{{membroId}}/medications/{{medicationId}}
Authorization: Bearer {{token}}
```

### Atualizar medicamento

```
PUT {{base}}/family-members/{{membroId}}/medications/{{medicationId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "dosagem": "100mg",
  "frequencia": "2x ao dia"
}
```

### Excluir medicamento

```
DELETE {{base}}/family-members/{{membroId}}/medications/{{medicationId}}
Authorization: Bearer {{token}}
```

### Erros esperados — Medicamentos

| Cenário | Esperado |
|---|---|
| Sem token | `401` |
| Membro de outro usuário | `403` |
| Medicamento inexistente | `404` — `"Medicamento não encontrado."` |
| Body inválido (data, boolean como string) | `400` — `"Dados inválidos."` |

---

## Contatos de Emergência

### Criar contato

```
POST {{base}}/family-members/{{membroId}}/emergency-contacts
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nome": "Carlos Silva",
  "parentesco": "Tio",
  "telefone": "(89) 99988-7766"
}
```

Resposta esperada: `201 Created`. Todos os campos são obrigatórios.

### Listar contatos

```
GET {{base}}/family-members/{{membroId}}/emergency-contacts
Authorization: Bearer {{token}}
```

### Buscar contato por ID

```
GET {{base}}/family-members/{{membroId}}/emergency-contacts/{{contactId}}
Authorization: Bearer {{token}}
```

### Atualizar contato

```
PUT {{base}}/family-members/{{membroId}}/emergency-contacts/{{contactId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "telefone": "(89) 99911-2233"
}
```

### Excluir contato

```
DELETE {{base}}/family-members/{{membroId}}/emergency-contacts/{{contactId}}
Authorization: Bearer {{token}}
```

### Erros esperados — Contatos de Emergência

| Cenário | Esperado |
|---|---|
| Sem token | `401` |
| Membro de outro usuário | `403` |
| Contato inexistente | `404` — `"Contato de emergência não encontrado."` |
| Body inválido (nome/parentesco curto, telefone < 8) | `400` — `"Dados inválidos."` |

---

## Cenários de Erro para Testar

### Email duplicado
```
POST {{base}}/auth/register
Content-Type: application/json

{
  "nome": "Maria Duplicada",
  "email": "maria@email.com",
  "senha": "Teste@123"
}
```
Esperado: `409` — `"E-mail já cadastrado."`

### Credenciais inválidas
```
POST {{base}}/auth/login
Content-Type: application/json

{
  "email": "maria@email.com",
  "senha": "SenhaErrada@1"
}
```
Esperado: `401` — `"E-mail ou senha inválidos."`

### Validação de body
```
POST {{base}}/auth/register
Content-Type: application/json

{
  "nome": "A",
  "email": "invalido",
  "senha": "123"
}
```
Esperado: `400` — `"Dados inválidos."` com `details` listando cada violação.

### Rota protegida sem token
```
GET {{base}}/auth/me
```
Esperado: `401` — `"Token não fornecido."`

### Refresh token já usado / pós-logout
```
POST {{base}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<token já invalidado>"
}
```
Esperado: `401` — `"Refresh token inválido."`

---

## Usuários do Seed

| Email | Senha | Perfil | Status |
|---|---|---|---|
| `admin@sasf.com` | `Senha@123` | ADMIN | ATIVO |
| `maria@email.com` | `Senha@123` | PACIENTE | ATIVO |
| `joao.santos@email.com` | `Senha@123` | PROFISSIONAL | PENDENTE |

---

## Compartilhamento LGPD

Requer `Authorization: Bearer {{token}}` (paciente).

### Criar compartilhamento

```
POST {{base}}/sharing
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "membroId": "{{membroId}}",
  "profissionalEmail": "joao.santos@email.com",
  "dataExpiracao": "2026-07-24T23:59:59.000Z",
  "observacoes": "Consulta de rotina",
  "escopos": ["VITAIS", "CONDICOES", "ALERGIAS"]
}
```

Resposta: `201` com token de compartilhamento.

Escopos válidos: `PERFIL`, `MEMBROS`, `CONDICOES`, `ALERGIAS`, `MEDICAMENTOS`, `CONTATOS`, `VITAIS`, `SINTOMAS`.

### Listar compartilhamentos

```
GET {{base}}/sharing
Authorization: Bearer {{token}}
```

### Detalhe do compartilhamento (com logs de acesso)

```
GET {{base}}/sharing/{{shareId}}
Authorization: Bearer {{token}}
```

### Revogar compartilhamento

```
PATCH {{base}}/sharing/{{shareId}}/revoke
Authorization: Bearer {{token}}
```

### Logs de acesso do compartilhamento

```
GET {{base}}/sharing/{{shareId}}/logs
Authorization: Bearer {{token}}
```

### Profissional: listar tokens recebidos

```
GET {{base}}/professional/shared-access
Authorization: Bearer {{profToken}}
```

### Profissional: acessar dados por token

```
GET {{base}}/professional/access/{{codigoToken}}
Authorization: Bearer {{profToken}}
```

### Erros esperados — Compartilhamento

| Cenário | Esperado |
|---|---|
| Profissional não encontrado | `404` — `"Profissional não encontrado com este e-mail."` |
| Profissional pendente | `400` — `"Profissional ainda não foi aprovado."` |
| Data expiração passada | `400` — `"Data de expiração deve ser futura."` |
| Revogar já revogado | `400` — `"Este compartilhamento já foi revogado ou expirou."` |
| Acesso após revogação | `403` — `"Este compartilhamento foi revogado."` |
| Token inexistente | `404` — `"Token de acesso não encontrado."` |
| Outro profissional acessando | `403` — `"Este token não pertence a você."` |
| Escopos vazios | `400` — `"Selecione ao menos um escopo."` |

---

## Painel Administrativo

Requer login como ADMIN (`admin@sasf.com` / `Senha@123`).

### Listar profissionais

```
GET {{base}}/admin/professionals
Authorization: Bearer {{adminToken}}
```

Com filtro: `GET {{base}}/admin/professionals?status=PENDING`

Valores de `status`: `PENDING`, `APPROVED`, `REJECTED`.

### Detalhe do profissional

```
GET {{base}}/admin/professionals/{{profDetalheId}}
Authorization: Bearer {{adminToken}}
```

### Aprovar profissional

```
PATCH {{base}}/admin/professionals/{{profDetalheId}}/approve
Authorization: Bearer {{adminToken}}
```

### Rejeitar profissional

```
PATCH {{base}}/admin/professionals/{{profDetalheId}}/reject
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "motivo": "Registro profissional não verificado no conselho."
}
```

### Erros esperados — Admin

| Cenário | Esperado |
|---|---|
| Sem token | `401` |
| Não é ADMIN | `403` — `"Acesso negado. Permissão insuficiente."` |
| Profissional não encontrado | `404` |
| Já aprovado | `400` — `"Profissional já foi aprovado."` |
| Motivo curto (< 5 chars) | `400` — `"Motivo deve ter no mínimo 5 caracteres."` |

---

## Configuração no Yaak

1. Crie um **Environment** chamado `Local`
2. Adicione a variável `base` = `http://localhost:3333/api`
3. Use `{{base}}` em todas as URLs
4. No login, copie o `accessToken` para uma variável `token`
5. Nas rotas protegidas, use Header: `Authorization: Bearer {{token}}`
