import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ModalProcesso from '../componentes/ModalProcesso.jsx';
import { requisitar } from '../api.js';
import { useAutenticacao } from '../contexto/AuthContext.jsx';
import { lerModoDidatico } from '../modoDidatico.js';
import { formatarDataHora } from '../utils.js';

export default function PaginaEvento() {
  const { id } = useParams();
  const { token } = useAutenticacao();

  const [didatico] = useState(() => lerModoDidatico());
  const [pronto, setPronto] = useState(!didatico);
  const [processoAberto, setProcessoAberto] = useState(didatico);
  const [passos, setPassos] = useState([]);
  const [pendente, setPendente] = useState(true);

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');

    requisitar(`/eventos/${id}`, { token })
      .then((resposta) => {
        if (!ativo) return;
        setDados(resposta);
        setPassos(resposta.passos ?? []);
        setPendente(false);
      })
      .catch((falha) => {
        if (!ativo) return;
        setErro(falha.message);
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
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id, token]);

  function concluirProcesso() {
    setProcessoAberto(false);
    setPronto(true);
  }

  return (
    <>
      <main className="tela-painel">
        <header className="barra-topo">
          <div className="marca">
            <span className="selo">SEMAC · UFS</span>
            <strong>Detalhes do evento</strong>
          </div>

          <Link className="botao-secundario" to="/">
            Voltar ao painel
          </Link>
        </header>

        <div className="conteudo-painel">
          {!pronto || carregando ? (
            <div className="tela-carregando">
              <span className="girador" aria-hidden="true" />
              Carregando evento...
            </div>
          ) : erro ? (
            <section className="cartao">
              <p className="mensagem-erro">{erro}</p>
              <p className="texto-suave" style={{ marginTop: '12px' }}>
                Volte ao painel e escolha outro evento.
              </p>
            </section>
          ) : (
            dados && (
              <section className="cartao detalhe-evento">
                <span className="rotulo">
                  {dados.acessoCompleto ? 'Acesso completo' : 'Acesso limitado'}
                </span>

                <h1>{dados.evento.titulo}</h1>
                <p className="texto-suave">{dados.mensagem}</p>

                <dl className="lista-dados">
                  <div>
                    <dt>Horário</dt>
                    <dd>{formatarDataHora(dados.evento.horario)}</dd>
                  </div>

                  {dados.acessoCompleto && (
                    <div>
                      <dt>Local</dt>
                      <dd>{dados.evento.local}</dd>
                    </div>
                  )}

                  {dados.acessoCompleto && (
                    <div>
                      <dt>Descrição</dt>
                      <dd>{dados.evento.descricao}</dd>
                    </div>
                  )}
                </dl>

                <div className="acoes-evento">
                  <Link
                    className="link-botao"
                    to={`/eventos/${dados.evento.id}/editar`}
                  >
                    Testar acesso de edição
                  </Link>
                </div>
              </section>
            )
          )}
        </div>
      </main>

      <ModalProcesso
        aberto={processoAberto}
        titulo="Validando acesso"
        subtitulo="Veja como o servidor valida o token e monta a resposta do evento."
        passos={passos}
        pendente={pendente}
        rotuloContinuar="Ver evento"
        aoConcluir={concluirProcesso}
      />
    </>
  );
}
