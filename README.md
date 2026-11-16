# SEMAC · Autenticação e Autorização

Projeto didático da **LAWD** (Liga Acadêmica de Desenvolvimento Web da UFS) para
ensinar **autenticação** e **autorização** em uma aplicação React + Node/Express.

O domínio é a **SEMAC** (Semana Acadêmica da UFS). O projeto contém:

- as entidades de usuário e de evento (em memória, carregadas de JSON);
- o login com **JWT**;
- proteção contra força bruta com **rate limit**;
- autorização com **RBAC + ABAC** nas rotas de eventos;
- telas de verificação de acesso e um **AuthGuard** no React;
- **modo didático**: um modal animado que mostra, passo a passo, o que o
  servidor fez para autenticar e autorizar cada requisição.

As regras atuais:

| Ação                                | Regra                                   |
| ----------------------------------- | --------------------------------------- |
| Ver todos os dados do evento 	      | `palestrante` ou `monitor`              |
| Ver informações parciais do evento  | usuário `participante`                  |
| Cadastrar/editar evento             | `palestrante` **com** `anosNaLawd >= 3` |

---

## Stack

| Camada   | Tecnologia              |
| -------- | ----------------------- |
| Frontend | React 19 + Vite 6       |
| Backend  | Node.js + Express 4     |
| Login    | JWT (`jsonwebtoken`)    |
| Senhas   | `bcryptjs`              |
| Proteção | `express-rate-limit`    |
| Dados    | Arquivo JSON em memória |

Durante o desenvolvimento, o **Vite** (porta `5173`) faz proxy de `/api` para o
**Express** (porta `3000`). Em produção, o próprio Express serve o build do
React — ou seja, a aplicação roda como **um único servidor**.

---

## Como rodar

Requisitos: Node.js 20 ou superior.

```bash
# 1. Instalar as dependências
npm install

# 2. Gerar o arquivo de usuários com as senhas criptografadas
npm run seed

# 3. Iniciar servidor + cliente em modo desenvolvimento
npm run dev
```

Acesse **http://localhost:5173**.

Para simular produção (um único servidor):

```bash
npm run build
npm start
# acesse http://localhost:3000
```

---

## Usuários de teste

| Perfil          | E-mail                   | Senha             | Papel          | Afiliação | Anos na LAWD |
| --------------- | ------------------------ | ----------------- | -------------- | --------- | ------------ |
| Palestrante     | `felipe@lawd.ufs.br`     | `felipe123`       | `palestrante`  | LAWD      | 4            |
| Palestrante Jr. | `gyannine@lawd.ufs.br`   | `gyannine123`     | `palestrante`  | LAWD      | 2            |
| Palestrante Jr. | `enzo@lawd.ufs.br`       | `enzo123`         | `palestrante`  | LAWD      | 2            |
| Monitora        | `lauane@lawd.ufs.br`     | `lauane123`       | `monitor`      | LAWD      | 2            |
| Monitor         | `pedro@lawd.ufs.br`      | `pedro123`        | `monitor`      | LAWD      | 2            |
| Monitor         | `bruno@lawd.ufs.br`      | `bruno123`        | `monitor`      | LAWD      | 2            |
| Participante    | `participante@gmail.com` | `participante123` | `participante` | externo   | 0            |

A usuária **Gyannine** e **Enzo** existem para demonstrar a negação por ABAC:
são palestrantes, mas ainda não têm os 3 anos exigidos para cadastrar/editar.
**Felipe** é o único palestrante com mais de 3 anos de LAWD, portanto o único
que pode criar/editar eventos.

Os botões da tela de login preenchem esses dados automaticamente.

> As senhas ficam apenas na forma de hash em `server/data/usuarios.json`.
> O arquivo é gerado por `npm run seed` (veja `server/scripts/gerar-senhas.js`).

---

## Estrutura

```
.
├── package.json                 # scripts e dependências
├── server/
│   ├── index.js                 # Express: API + arquivos do build
│   ├── config.js                # porta, segredo e validade do JWT
│   ├── didatico.js              # passos devolvidos pela API (modo didático)
│   ├── store.js                 # "banco" em memória (JSON)
│   ├── data/
│   │   ├── usuarios.json        # gerado por npm run seed
│   │   └── eventos.json         # eventos da SEMAC
│   ├── middleware/
│   │   └── autenticar.js        # valida o JWT e popula req.usuario
│   ├── politicas/
│   │   └── eventos.js           # regras RBAC + ABAC
│   ├── routes/
│   │   ├── autenticacao.js      # POST /entrar e GET /eu
│   │   └── eventos.js           # checagens de acesso aos eventos
│   └── scripts/
│       └── gerar-senhas.js      # cria o seed com bcrypt
└── client/
    ├── index.html
    ├── vite.config.js           # proxy /api -> Express
    └── src/
        ├── main.jsx
        ├── App.jsx              # rotas + AuthGuard
        ├── api.js               # fetch com token (anexa erro.dados)
        ├── modoDidatico.js      # preferência ligada/desligada no localStorage
        ├── permissoes.js        # regra de gestão usada pelo AuthGuard
        ├── estilos.css
        ├── componentes/
        │   ├── AuthGuard.jsx    # redireciona quem não tem acesso
        │   └── ModalProcesso.jsx # linha do tempo animada do modo didático
        ├── contexto/
        │   └── AuthContext.jsx  # token + usuário + entrar/sair
        └── paginas/
            ├── Login.jsx
            ├── Painel.jsx
            ├── Evento.jsx
            ├── Gestao.jsx
            └── VerificacaoAcesso.jsx
```

---

## Endpoints desta etapa

### `POST /api/autenticacao/entrar`

Recebe e-mail e senha e devolve um token JWT.

```http
POST /api/autenticacao/entrar
Content-Type: application/json

{
  "email": "lauane@lawd.ufs.br",
  "senha": "lauane123"
}
```

Resposta `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "usr-004",
    "nome": "Lauane Morais",
    "email": "lauane@lawd.ufs.br",
    "papel": "monitor",
    "afiliacao": "LAWD",
    "anosNaLawd": 2,
    "criadoEm": "2026-11-01T12:12:00.000Z"
  },
  "passos": [
    {
      "titulo": "Requisição recebida",
      "detalhe": "POST /api/autenticacao/entrar",
      "estado": "ok"
    }
  ]
}
```

Erros possíveis:

| Status | Situação                                 |
| ------ | ---------------------------------------- |
| `400`  | E-mail ou senha ausentes                 |
| `401`  | Credenciais inválidas                    |
| `429`  | Mais de 5 tentativas por minuto (por IP) |

### `GET /api/autenticacao/eu`

Devolve o usuário dono do token. Exige o cabeçalho:

```http
Authorization: Bearer <token>
```

---

## Endpoints de eventos

Todas as rotas abaixo exigem `Authorization: Bearer <token>`.

### `GET /api/eventos`

Lista os eventos. A resposta já vem filtrada pelo perfil:

- palestrante e monitor recebem todos os campos;
- participante recebe apenas `id`, `titulo` e `horario`.

```json
{
  "acessoCompleto": false,
  "mensagem": "Acesso limitado: você só pode ver o título e o horário dos eventos.",
  "eventos": [
    {
      "id": "1",
      "titulo": "Minicurso: Introdução ao Desenvolvimento Web",
      "horario": "2026-11-24T19:00:00-03:00"
    }
  ]
}
```

### `GET /api/eventos/:id`

Detalhe do evento, com a mesma filtragem de campos.

### `GET /api/eventos/novo`

Verifica se o usuário pode cadastrar um evento.

```json
// 200 — palestrante com mais de 3 anos
{ "autorizado": true, "mensagem": "Usuário pode cadastrar eventos." }

// 403 — demais perfis
{
  "autorizado": false,
  "erro": "Usuário não possui acesso ao recurso.",
  "mensagem": "Usuário não possui acesso ao recurso."
}
```

### `GET /api/eventos/:id/editar`

Verifica se o usuário pode editar o evento informado.

```json
// 200 — Felipe (palestrante, 4 anos)
{ "autorizado": true, "mensagem": "Usuário pode editar o evento 1." }

// 403 — Gyannine (palestrante, 2 anos), monitor ou participante
{
  "autorizado": false,
  "erro": "Usuário não possui acesso ao recurso.",
  "mensagem": "Usuário não possui acesso ao recurso."
}
```

Se o id não existir, as rotas retornam `404` com
`{ "erro": "Evento não encontrado." }`.

---

## Telas e AuthGuard

| URL                   | Tela                                                        |
| --------------------- | ----------------------------------------------------------- |
| `/login`              | Login                                                       |
| `/`                   | Painel com dados do usuário e lista de eventos              |
| `/eventos/:id`        | Detalhe (completo ou limitado)                              |
| `/eventos/:id/editar` | Verifica no servidor e mostra "pode editar" ou "sem acesso" |
| `/eventos/novo`       | Verifica no servidor se pode cadastrar                      |
| `/gestao`             | Rota protegida pelo `AuthGuard`                             |

O `AuthGuard` recebe o usuário e uma função `permitido`:

```jsx
<AuthGuard usuario={usuario} permitido={podeGerenciarEventos}>
  <Gestao />
</AuthGuard>
```

- sem usuário → redireciona para `/login`;
- usuário sem permissão → redireciona para `/` com um aviso na tela.

> O guard melhora a experiência, mas **não é segurança**: o backend sempre
> revalida a permissão em cada requisição.

---

## Modo didático

O modo didático transforma a explicação em algo visível: em vez de apenas
dizer "acesso negado", a interface mostra **cada etapa real** executada pelo
servidor — ou pelo próprio navegador, quando a decisão nem chega à API.

Ele aparece em seis momentos:

| Momento                   | O que é explicado                                     |
| ------------------------- | ----------------------------------------------------- |
| Login                     | busca do usuário, `bcrypt.compare`, assinatura do JWT |
| Detalhe do evento         | validação do token e regra de visualização (RBAC)     |
| Cadastro/edição de evento | validação do token e regra de gestão (RBAC + ABAC)    |
| Área de gestão liberada   | decisão do `AuthGuard` e lembrete de revalidação      |
| Área de gestão negada     | bloqueio **só no frontend**, sem nenhuma requisição   |
| Logout                    | remoção local do token, sem avisar o servidor         |

### Como funciona

1. As rotas relevantes devolvem um array `passos` junto da resposta normal
   (inclusive nas respostas de erro, como `401` e `403`). Exemplo de resposta
   `403` em `/api/eventos/novo`:

   ```json
   {
     "autorizado": false,
     "erro": "Usuário não possui acesso ao recurso.",
     "passos": [
       {
         "titulo": "Requisição recebida",
         "detalhe": "GET /api/eventos/novo",
         "estado": "ok"
       },
       {
         "titulo": "Token validado",
         "detalhe": "jwt.verify(token, SEGREDO) → assinatura e validade ok",
         "estado": "ok"
       },
       {
         "titulo": "Regra de gestão aplicada",
         "detalhe": "palestrante && anosNaLawd >= 3 → false",
         "estado": "falha"
       }
     ]
   }
   ```

2. O componente `ModalProcesso.jsx` revela os passos em uma linha do tempo,
   um a cada ~450 ms, com barra de progresso e botão **Pular animação**.
   Ao final, o modal **não fecha sozinho**: ele mantém as etapas na tela e
   espera o clique em um botão de ação (como **Entrar no painel** ou
   **Ver evento**), para que o usuário leia com calma e decida quando
   avançar. O botão **Pular animação** apenas revela todas as etapas de uma
   vez — ele também não redireciona.
3. O cliente passa a ler `erro.dados.passos` mesmo quando a resposta é um erro
   — por isso `api.js` anexa o corpo da resposta ao objeto `Error`.

Quando a decisão acontece **antes** de qualquer requisição, os passos são
montados no próprio frontend:

- **AuthGuard**: se o usuário logado não satisfaz a regra (por exemplo, Bruno
  tentando abrir `/gestao`), o modal mostra a checagem feita apenas com os
  dados do contexto e destaca que **o servidor não foi consultado**.
- **Logout**: o modal mostra que sair é remover o token do `localStorage` e
  limpar o estado do React. Não existe rota de logout; o JWT só deixa de ser
  enviado, mas continua válido até expirar se tiver sido copiado.

Nenhum dado sensível vai nos passos: não há `senhaHash`, segredo do JWT nem
informação que revele se um e-mail existe.

### Ligar e desligar

O botão **Modo didático: ON/OFF** fica no topo do painel. A preferência é
guardada em `localStorage['semac.modoDidatico']` e vem **ligada por padrão**.
Com o modo desligado, a navegação é direta — mas as mesmas validações
continuam acontecendo no servidor:

> O modo didático é uma **explicação**, não um mecanismo de segurança.
> Desligá-lo não concede nenhuma permissão.

A animação respeita `prefers-reduced-motion`: quem prefere menos movimento vê
os passos sem transições.

---

## Como o login funciona

1. O usuário envia e-mail e senha para `POST /api/autenticacao/entrar`.
2. O servidor busca o usuário pelo e-mail (comparação sem diferenciar
   maiúsculas).
3. `bcrypt.compare` verifica se a senha corresponde ao hash salvo.
4. O servidor assina um JWT com `id`, `papel` e `afiliacao`, com validade de
   1 hora.
5. O frontend guarda o token no `localStorage` e o envia em toda requisição
   protegida no cabeçalho `Authorization`. No modo didático, a gravação
   acontece só depois que o modal termina de explicar o login.
6. O middleware `autenticar` valida a assinatura e disponibiliza `req.usuario`
   para as próximas rotas.

> **Autenticação** responde _quem é você_. **Autorização** responde _o que você
> pode fazer_. O login cuida da primeira; as rotas de eventos cuidam da segunda.

---

## Decisões de segurança (e suas limitações didáticas)

- **Senhas com bcrypt**: o servidor nunca guarda nem devolve a senha em texto.
- **Mensagem de erro genérica**: não revelamos se o e-mail existe.
- **Rate limit**: 5 tentativas de login por minuto por IP.
- **Token em `localStorage`**: simples para a aula, mas vulnerável a XSS.
  Em produção, prefira cookies `HttpOnly` + `Secure` ou avalie os riscos.
- **Segredo do JWT fixo**: use a variável de ambiente `CHAVE_SECRETA_JWT` fora
  da sala de aula.
- **Sem refresh token e sem revogação**: o token vale até expirar (1 hora).

---

## Exercitando...

- Você consegue implementar uma medida de segurança para invalidar um token no logout? Acesse [/server/routes/autenticacao.js](./server/routes/autenticacao.js) e tente resolver isso.
- Como você implementaria a abordagem de `refresh_token` no projeto para gerenciamento de sessões à longo prazo?

---

## Variáveis de ambiente (opcionais)

| Variável            | Padrão                   | Descrição                  |
| ------------------- | ------------------------ | -------------------------- |
| `PORTA`             | `3000`                   | Porta do Express           |
| `CHAVE_SECRETA_JWT` | valor de desenvolvimento | Chave de assinatura do JWT |
| `VALIDADE_TOKEN`    | `1h`                     | Validade do token          |
| `NODE_ENV`          | `development`            | Ambiente                   |

---

## Links úteis para estudos

- [Building Scalable and Maintainable Permission Systems: Beyond Role-Based Access Control](https://medium.com/@yashamansrivastava1710/building-scalable-and-maintainable-permission-systems-beyond-role-based-access-control-4f6560a3e696)
- [RBAC vs ABAC: principais diferenças e qual você deve usar.](https://www.osohq.com/learn/rbac-vs-abac)
- [NodeJS: Autenticação com JWT](https://medium.com/@filipefilpe/nodejs-autentica%C3%A7%C3%A3o-com-jwt-6e274fb205dc)


