import { useState } from 'react';
import ModalProcesso from '../componentes/ModalProcesso.jsx';
import { useAutenticacao } from '../contexto/AuthContext.jsx';
import { lerModoDidatico } from '../modoDidatico.js';

/**
 * Usuários de demonstração.
 * Os botões preenchem o formulário para agilizar a aula.
 */
const PERFIS_DEMO = [
  {
    rotulo: 'Palestrante',
    email: 'felipe@lawd.ufs.br',
    senha: 'felipe123',
    descricao: '4 anos de LAWD',
  },
  {
    rotulo: 'Palestrante Jr.',
    email: 'gyannine@lawd.ufs.br',
    senha: 'gyannine123',
    descricao: '2 anos de LAWD',
  },
  {
    rotulo: 'Monitora',
    email: 'lauane@lawd.ufs.br',
    senha: 'lauane123',
    descricao: 'Membro da LAWD',
  },
  {
    rotulo: 'Participante',
    email: 'participante@gmail.com',
    senha: 'participante123',
    descricao: 'Público externo',
  },
];

export default function PaginaLogin() {
  const { entrar, salvarSessao } = useAutenticacao();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  /**
   * Estado do modal didático. `dados` guarda a resposta de sucesso para só
   * efetivar a sessão depois que a animação terminar.
   */
  const [processo, setProcesso] = useState({
    aberto: false,
    passos: [],
    pendente: true,
    dados: null,
    erro: '',
  });

  async function autenticar(emailInformado, senhaInformada) {
    setErro('');
    setEnviando(true);

    const didatico = lerModoDidatico();

    if (didatico) {
      setProcesso({
        aberto: true,
        passos: [],
        pendente: true,
        dados: null,
        erro: '',
      });
    }

    try {
      const dados = await entrar(emailInformado, senhaInformada);

      if (didatico) {
        setProcesso({
          aberto: true,
          passos: dados.passos ?? [],
          pendente: false,
          dados,
          erro: '',
        });
      } else {
        salvarSessao(dados);
      }
    } catch (falha) {
      const passos = falha.dados?.passos ?? [
        {
          titulo: 'Falha na autenticação',
          detalhe: falha.message,
          estado: 'falha',
        },
      ];

      if (didatico) {
        setProcesso({
          aberto: true,
          passos,
          pendente: false,
          dados: null,
          erro: falha.message,
        });
      } else {
        setErro(falha.message);
        setEnviando(false);
      }
    }
  }

  function concluirProcesso() {
    setProcesso((atual) => ({ ...atual, aberto: false }));

    if (processo.dados) {
      salvarSessao(processo.dados);
      return;
    }

    setErro(processo.erro || 'Não foi possível entrar.');
    setEnviando(false);
  }

  function aoEnviar(evento) {
    evento.preventDefault();
    autenticar(email, senha);
  }

  function usarPerfilDemo(perfil) {
    setEmail(perfil.email);
    setSenha(perfil.senha);
    autenticar(perfil.email, perfil.senha);
  }

  return (
    <>
      <main className="tela-login">
        <section className="apresentacao">
          <span className="selo">UFS · LAWD</span>
          <h1>
            SEMAC
            <small>Semana Acadêmica da UFS</small>
          </h1>
          <p>
            Área restrita para membros da Liga Acadêmica de Desenvolvimento Web
            e para participantes do evento.
          </p>

          <ul className="lista-recursos">
            <li>
              <strong>Autenticação</strong>
              <span>Quem é você? Login com e-mail, senha e JWT.</span>
            </li>
            <li>
              <strong>Autorização</strong>
              <span>O que você pode fazer? RBAC e ABAC nas rotas de eventos.</span>
            </li>
            <li>
              <strong>Perfis</strong>
              <span>Palestrante, monitor e participante.</span>
            </li>
          </ul>
        </section>

        <section className="cartao-login">
          <header>
            <h2>Entrar na plataforma</h2>
            <p>Use uma conta de demonstração para explorar o projeto.</p>
          </header>

          <form onSubmit={aoEnviar}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />

            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />

            {erro && (
              <p className="mensagem-erro" role="alert">
                {erro}
              </p>
            )}

            <button type="submit" className="botao-principal" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="separador">
            <span>ou entre com um perfil de teste</span>
          </div>

          <div className="perfis-demo">
            {PERFIS_DEMO.map((perfil) => (
              <button
                key={perfil.email}
                type="button"
                className="botao-perfil"
                onClick={() => usarPerfilDemo(perfil)}
                disabled={enviando}
              >
                <strong>{perfil.rotulo}</strong>
                <span>{perfil.descricao}</span>
              </button>
            ))}
          </div>

          <footer>
            <span className="aviso">
              Projeto didático · sem banco de dados real · senhas protegidas com bcrypt
            </span>
          </footer>
        </section>
      </main>

      <ModalProcesso
        aberto={processo.aberto}
        titulo="Autenticando"
        subtitulo="Acompanhe o caminho das credenciais até a geração do token JWT."
        passos={processo.passos}
        pendente={processo.pendente}
        rotuloContinuar={processo.dados ? 'Entrar no painel' : 'Voltar ao login'}
        aoConcluir={concluirProcesso}
      />
    </>
  );
}
