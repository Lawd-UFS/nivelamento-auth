import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ModalProcesso from '../componentes/ModalProcesso.jsx';
import { requisitar } from '../api.js';
import { useAutenticacao } from '../contexto/AuthContext.jsx';
import { lerModoDidatico } from '../modoDidatico.js';

/**
 * Tela de verificação de acesso.
 *
 * No modo didático, o modal mostra o caminho da requisição antes do
 * resultado. Quando o acesso é negado, a mensagem aparece por 2 segundos
 * e o usuário é redirecionado para o painel.
 */
export default function VerificacaoAcesso({ tipo }) {
  const { id } = useParams();
  const { token } = useAutenticacao();
  const navegar = useNavigate();

  const [didatico] = useState(() => lerModoDidatico());
  const [pronto, setPronto] = useState(!didatico);
  const [processoAberto, setProcessoAberto] = useState(didatico);
  const [passos, setPassos] = useState([]);
  const [pendente, setPendente] = useState(true);

  const [estado, setEstado] = useState({
    carregando: true,
    autorizado: false,
    mensagem: '',
  });

  useEffect(() => {
    let ativo = true;
    setEstado({ carregando: true, autorizado: false, mensagem: '' });

    const caminho =
      tipo === 'cadastrar' ? '/eventos/novo' : `/eventos/${id}/editar`;

    requisitar(caminho, { token })
      .then((resposta) => {
        if (!ativo) return;
        setEstado({
          carregando: false,
          autorizado: true,
          mensagem: resposta.mensagem,
        });
        setPassos(resposta.passos ?? []);
        setPendente(false);
      })
      .catch((falha) => {
        if (!ativo) return;
        setEstado({
          carregando: false,
          autorizado: false,
          mensagem: falha.message,
        });
        setPassos(
          falha.dados?.passos ?? [
            {
              titulo: 'Falha na requisição',
              detalhe: falha.message,
              estado: 'falha',
            },
          ],
        );
        setPendente(false);
      });

    return () => {
      ativo = false;
    };
  }, [tipo, id, token]);

  function voltarAoPainel() {
    navegar('/', {
      replace: true,
      state: { aviso: estado.mensagem },
    });
  }

  function concluirProcesso() {
    setProcessoAberto(false);
    setPronto(true);
  }

  const titulo =
    tipo === 'cadastrar' ? 'Cadastrar evento' : `Editar evento ${id}`;

  if (!pronto) {
    return (
      <>
        <main className="tela-verificacao">
          <div className="cartao-verificacao">
            <span className="girador" aria-hidden="true" />
            <p>Consultando o servidor...</p>
          </div>
        </main>

        <ModalProcesso
          aberto={processoAberto}
          titulo={
            tipo === 'cadastrar'
              ? 'Verificando cadastro'
              : 'Verificando permissão'
          }
          subtitulo="Acompanhe a validação do token e a aplicação da regra de acesso."
          passos={passos}
          pendente={pendente}
          rotuloContinuar="Ver resultado"
          aoConcluir={concluirProcesso}
        />
      </>
    );
  }

  if (estado.carregando) {
    return (
      <main className="tela-verificacao">
        <div className="cartao-verificacao">
          <span className="girador" aria-hidden="true" />
          <p>Verificando permissão...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="tela-verificacao">
      <div
        className={`cartao-verificacao ${
          estado.autorizado ? 'permitido' : 'negado'
        }`}
        role={estado.autorizado ? 'status' : 'alert'}
      >
        <span className="icone-verificacao" aria-hidden="true">
          {estado.autorizado ? '✓' : '✕'}
        </span>

        <h1>{titulo}</h1>
        <p>{estado.mensagem}</p>

        {estado.autorizado ? (
          <div className="acoes-verificacao">
            <Link className="link-botao" to="/">
              Voltar ao painel
            </Link>

            {tipo === 'editar' && (
              <Link
                className="link-botao link-botao-secundario"
                to={`/eventos/${id}`}
              >
                Ver evento
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="texto-redirecionamento">
              Volte ao painel quando terminar de ler.
            </p>
            <button
              type="button"
              className="link-botao link-botao-secundario"
              onClick={voltarAoPainel}
            >
              Voltar ao painel
            </button>
          </>
        )}
      </div>
    </main>
  );
}
