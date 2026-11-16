import { useEffect, useRef, useState } from 'react';

/**
 * Modal do modo didático.
 *
 * Recebe os `passos` devolvidos pelo servidor e os revela um a um, como uma
 * linha do tempo. Ao terminar (ou quando o usuário clica em "Pular"), o modal
 * NÃO fecha sozinho: mostra um botão de ação para o usuário ler com calma e
 * decidir quando continuar. Só então `aoConcluir` é chamado.
 */
export default function ModalProcesso({
  aberto,
  titulo,
  subtitulo,
  passos = [],
  pendente = false,
  duracaoPasso = 450,
  rotuloContinuar = 'Continuar',
  aoConcluir,
}) {
  const [visiveis, setVisiveis] = useState(0);
  const [pulado, setPulado] = useState(false);

  const dialogoRef = useRef(null);
  const botaoContinuarRef = useRef(null);
  const aoConcluirRef = useRef(aoConcluir);

  aoConcluirRef.current = aoConcluir;

  // Reinicia o estado a cada nova abertura e trava o scroll da página.
  useEffect(() => {
    if (!aberto) return undefined;

    setVisiveis(0);
    setPulado(false);

    document.body.classList.add('sem-rolagem');
    const foco = setTimeout(() => dialogoRef.current?.focus(), 50);

    return () => {
      clearTimeout(foco);
      document.body.classList.remove('sem-rolagem');
    };
  }, [aberto]);

  // Assim que a resposta chega, mostra o primeiro passo.
  useEffect(() => {
    if (!aberto || pendente || pulado) return;
    if (passos.length > 0 && visiveis === 0) setVisiveis(1);
  }, [aberto, pendente, pulado, passos.length, visiveis]);

  // Ao pular, revela imediatamente todos os passos (inclusive os que
  // chegarem depois, caso a resposta ainda esteja pendente).
  useEffect(() => {
    if (pulado) setVisiveis(passos.length);
  }, [pulado, passos.length]);

  // Revela os próximos passos, um por vez.
  useEffect(() => {
    if (!aberto || pendente || pulado) return undefined;
    if (passos.length === 0 || visiveis >= passos.length) return undefined;

    const temporizador = setTimeout(() => {
      setVisiveis((atual) => Math.min(atual + 1, passos.length));
    }, duracaoPasso);

    return () => clearTimeout(temporizador);
  }, [aberto, pendente, pulado, visiveis, passos.length, duracaoPasso]);

  // Quando todas as etapas aparecem, leva o foco ao botão de continuar.
  // Nada fecha sozinho: o usuário lê no tempo dele e decide quando avançar.
  useEffect(() => {
    if (!aberto || pendente) return;
    if (visiveis < passos.length) return;
    botaoContinuarRef.current?.focus();
  }, [aberto, pendente, visiveis, passos.length]);

  if (!aberto) return null;

  function pular() {
    setPulado(true);
    setVisiveis(passos.length);
  }

  const concluido = !pendente && visiveis >= passos.length;
  const progresso = pendente
    ? 8
    : passos.length === 0
      ? 8
      : Math.round((visiveis / passos.length) * 100);

  return (
    <div className="modal-fundo">
      <section
        ref={dialogoRef}
        className="modal-processo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-processo"
        tabIndex={-1}
        onKeyDown={(evento) => {
          if (evento.key === 'Escape' && !concluido) pular();
        }}
      >
        <header className="modal-cabecalho">
          <span className="selo">Modo didático</span>
          <h2 id="titulo-modal-processo">{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </header>

        <div
          className="barra-progresso"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progresso}
        >
          <span style={{ width: `${progresso}%` }} />
        </div>

        <ol className="linha-do-tempo" aria-live="polite">
          {pendente && (
            <li className="passo pendente">
              <span className="passo-icone">
                <span className="girador" aria-hidden="true" />
              </span>
              <div>
                <strong>Conversando com o servidor...</strong>
                <code>Aguardando a resposta da API</code>
              </div>
            </li>
          )}

          {passos.slice(0, visiveis).map((passo, indice) => {
            const estado = passo.estado ?? 'info';
            const icone =
              estado === 'ok' ? '✓' : estado === 'falha' ? '✕' : 'i';

            return (
              <li key={indice} className={`passo ${estado}`}>
                <span className="passo-icone" aria-hidden="true">
                  {icone}
                </span>
                <div>
                  <strong>{passo.titulo}</strong>
                  {passo.detalhe && <code>{passo.detalhe}</code>}
                </div>
              </li>
            );
          })}
        </ol>

        <footer className="modal-rodape">
          <span className="dica">
            {pendente
              ? 'Aguardando o servidor...'
              : `${visiveis} de ${passos.length} etapas`}
          </span>

          {!concluido && (
            <button type="button" className="botao-pular" onClick={pular}>
              Pular animação
            </button>
          )}

          {concluido && (
            <button
              ref={botaoContinuarRef}
              type="button"
              className="botao-continuar"
              onClick={() => aoConcluirRef.current?.()}
            >
              {rotuloContinuar}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
