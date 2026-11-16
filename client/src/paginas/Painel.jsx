import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ModalProcesso from '../componentes/ModalProcesso.jsx';
import { requisitar } from '../api.js';
import { useAutenticacao } from '../contexto/AuthContext.jsx';
import { lerModoDidatico, salvarModoDidatico } from '../modoDidatico.js';
import { formatarData, formatarDataHora } from '../utils.js';

const ROTULOS_PAPEL = {
  palestrante: 'Palestrante',
  monitor: 'Monitor(a)',
  participante: 'Participante',
};

/**
 * Passos do logout.
 *
 * O logout é uma operação 100% do navegador: não existe endpoint para isso e
 * o servidor não fica sabendo. O JWT só deixa de ser enviado porque o token
 * é removido do localStorage.
 */
const PASSOS_LOGOUT = [
  {
    titulo: 'Clique em "Sair" recebido',
    detalhe: 'tratado no frontend · nenhuma requisição HTTP',
    estado: 'ok',
  },
  {
    titulo: 'Token localizado',
    detalhe: "localStorage['semac.token'] contém o JWT da sessão",
    estado: 'ok',
  },
  {
    titulo: 'Logout é local',
    detalhe: 'não existe rota de logout · o servidor não é avisado',
    estado: 'info',
  },
  {
    titulo: 'Sessão a limpar',
    detalhe: 'token do localStorage + usuário guardado no contexto React',
    estado: 'info',
  },
  {
    titulo: 'O JWT continua válido',
    detalhe: 'quem copiou o token pode usá-lo até expirar (1 hora)',
    estado: 'info',
  },
  {
    titulo: 'Ao confirmar',
    detalhe: 'remover o token · limpar o estado · voltar para /login',
    estado: 'info',
  },
];

/** Lê o payload do JWT só para fins didáticos (o frontend não valida o token). */
function decodificarPayload(token) {
  const partePayload = token.split('.')[1];

  const base64 = partePayload.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (caractere) => caractere.charCodeAt(0));

  return JSON.parse(new TextDecoder().decode(bytes));
}

export default function Painel() {
  const { usuario, token, sair } = useAutenticacao();
  const local = useLocation();
  const navegar = useNavigate();

  // Guarda a mensagem recebida no redirecionamento e limpa o state da URL,
  // para o aviso não reaparecer ao recarregar a página.
  const [aviso, setAviso] = useState(() => local.state?.aviso ?? '');

  useEffect(() => {
    if (local.state?.aviso) {
      navegar(local.pathname, { replace: true, state: null });
    }
  }, [local.state, local.pathname, navegar]);

  const [eventos, setEventos] = useState([]);
  const [acessoCompleto, setAcessoCompleto] = useState(false);
  const [mensagemAcesso, setMensagemAcesso] = useState('');
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [erroEventos, setErroEventos] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [modoDidatico, setModoDidatico] = useState(() => lerModoDidatico());
  const [modalSaidaAberto, setModalSaidaAberto] = useState(false);

  const payload = decodificarPayload(token);

  useEffect(() => {
    let ativo = true;
    setCarregandoEventos(true);

    requisitar('/eventos', { token })
      .then((dados) => {
        if (!ativo) return;
        setEventos(dados.eventos);
        setAcessoCompleto(dados.acessoCompleto);
        setMensagemAcesso(dados.mensagem);
      })
      .catch((falha) => {
        if (ativo) setErroEventos(falha.message);
      })
      .finally(() => {
        if (ativo) setCarregandoEventos(false);
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  async function copiarToken() {
    try {
      await navigator.clipboard.writeText(token);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  function alternarModoDidatico() {
    const novoValor = !modoDidatico;
    setModoDidatico(novoValor);
    salvarModoDidatico(novoValor);
  }

  function aoClicarSair() {
    if (modoDidatico) {
      setModalSaidaAberto(true);
      return;
    }

    sair();
  }

  function concluirSaida() {
    setModalSaidaAberto(false);
    sair();
  }

  return (
    <main className="tela-painel">
      <header className="barra-topo">
        <div className="marca">
          <span className="selo">SEMAC · UFS</span>
          <strong>Área do usuário</strong>
        </div>

        <div className="acoes-topo">
          <button
            type="button"
            className="botao-secundario botao-modo"
            onClick={alternarModoDidatico}
            aria-pressed={modoDidatico}
            title="Mostra o passo a passo de login e verificação de acesso"
          >
            Modo didático: {modoDidatico ? 'ON' : 'OFF'}
          </button>

          <button type="button" className="botao-secundario" onClick={aoClicarSair}>
            Sair
          </button>
        </div>
      </header>

      <div className="conteudo-painel">
        {aviso && (
          <div className="aviso-topo" role="alert">
            <span>{aviso}</span>
            <button
              type="button"
              className="fechar-aviso"
              onClick={() => setAviso('')}
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        )}

        <section className="cartao-boas-vindas">
          <div>
            <p className="rotulo">Sessão iniciada</p>
            <h1>Olá, {usuario.nome.split(' ')[0]}!</h1>
            <p className="texto-suave">
              Você entrou com sucesso. O backend identificou seu perfil a partir
              do token JWT enviado em cada requisição.
            </p>
          </div>

          <span className={`distintivo distintivo-${usuario.papel}`}>
            {ROTULOS_PAPEL[usuario.papel] ?? usuario.papel}
          </span>
        </section>

        <div className="grade-painel">
          <section className="cartao">
            <h2>Seus dados</h2>
            <dl className="lista-dados">
              <div>
                <dt>Nome</dt>
                <dd>{usuario.nome}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{usuario.email}</dd>
              </div>
              <div>
                <dt>Identificador</dt>
                <dd>
                  <code>{usuario.id}</code>
                </dd>
              </div>
              <div>
                <dt>Papel (RBAC)</dt>
                <dd>
                  <code>{usuario.papel}</code>
                </dd>
              </div>
              <div>
                <dt>Afiliação</dt>
                <dd>
                  <code>{usuario.afiliacao}</code>
                </dd>
              </div>
              <div>
                <dt>Anos na LAWD (ABAC)</dt>
                <dd>
                  {usuario.afiliacao === 'LAWD'
                    ? `${usuario.anosNaLawd} anos`
                    : 'Não se aplica'}
                </dd>
              </div>
              <div>
                <dt>Cadastro</dt>
                <dd>{formatarData(usuario.criadoEm)}</dd>
              </div>
            </dl>
          </section>

          <section className="cartao">
            <div className="cabecalho-cartao">
              <h2>Conteúdo do JWT</h2>
              <button
                type="button"
                className="botao-texto"
                onClick={copiarToken}
              >
                {copiado ? 'Copiado!' : 'Copiar token'}
              </button>
            </div>

            <p className="texto-suave">
              O token é assinado pelo servidor. O cliente consegue ler o
              conteúdo, mas não consegue alterá-lo sem invalidar a assinatura.
            </p>

            <h3>Cabeçalho</h3>
            <pre className="bloco-codigo">
              {JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)}
            </pre>

            <h3>Payload</h3>
            <pre className="bloco-codigo">{JSON.stringify(payload, null, 2)}</pre>
          </section>
        </div>

        <section className="cartao secao-eventos">
          <div className="cabecalho-cartao">
            <div>
              <h2>Eventos da SEMAC</h2>
              <p className="texto-suave">{mensagemAcesso}</p>
            </div>

            <div className="acoes-cabecalho">
              <Link
                className="link-botao link-botao-secundario"
                to="/gestao"
              >
                Área de gestão
              </Link>
              <Link className="link-botao" to="/eventos/novo">
                Cadastrar evento
              </Link>
            </div>
          </div>

          <p className="nota-didatica">
            Os botões aparecem para todos os perfis de propósito: a permissão é
            decidida no servidor, e não escondendo botões na tela.
          </p>

          {carregandoEventos && (
            <p className="texto-suave">Carregando eventos...</p>
          )}

          {erroEventos && <p className="mensagem-erro">{erroEventos}</p>}

          <div className="lista-eventos">
            {eventos.map((evento) => (
              <article key={evento.id} className="cartao-evento">
                <div>
                  <h3 className="titulo-evento">{evento.titulo}</h3>
                  <p className="meta-evento">
                    Horário: {formatarDataHora(evento.horario)}
                  </p>

                  {acessoCompleto && evento.local && (
                    <p className="meta-evento">Local: {evento.local}</p>
                  )}

                  {acessoCompleto && evento.descricao && (
                    <p className="descricao-evento">{evento.descricao}</p>
                  )}
                </div>

                <div className="acoes-evento">
                  <Link className="link-botao" to={`/eventos/${evento.id}`}>
                    Ver
                  </Link>
                  <Link
                    className="link-botao link-botao-secundario"
                    to={`/eventos/${evento.id}/editar`}
                  >
                    Editar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ModalProcesso
        aberto={modalSaidaAberto}
        titulo="Encerrando sessão"
        subtitulo="O logout acontece só no navegador: o servidor não recebe nenhuma requisição."
        passos={PASSOS_LOGOUT}
        rotuloContinuar="Sair da conta"
        aoConcluir={concluirSaida}
      />
    </main>
  );
}
