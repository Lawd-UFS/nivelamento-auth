import { useState } from "react";
import { Link } from "react-router-dom";
import ModalProcesso from "../componentes/ModalProcesso.jsx";
import { useAutenticacao } from "../contexto/AuthContext.jsx";
import { lerModoDidatico } from "../modoDidatico.js";

/**
 * Área restrita a palestrantes com mais de 3 anos de LAWD.
 * A rota é protegida pelo AuthGuard; o backend continua validando também.
 */
export default function Gestao() {
  const { usuario } = useAutenticacao();

  const [didatico] = useState(() => lerModoDidatico());
  const [pronto, setPronto] = useState(!didatico);

  const passos = [
    {
      titulo: "Navegação interceptada",
      detalhe: "AuthGuard · rota /gestao",
      estado: "ok",
    },
    {
      titulo: "Usuário carregado do contexto",
      detalhe: `sub = ${usuario.id} → ${usuario.nome}`,
      estado: "ok",
    },
    {
      titulo: "Atributos disponíveis",
      detalhe: `papel = ${usuario.papel} · anosNaLawd = ${usuario.anosNaLawd}`,
      estado: "ok",
    },
    {
      titulo: "Regra aplicada no frontend",
      detalhe: "palestrante && anosNaLawd >= 3 → true",
      estado: "ok",
    },
    {
      titulo: "Lembrete importante",
      detalhe: "O backend revalida a permissão em cada requisição.",
      estado: "info",
    },
  ];

  if (!pronto) {
    return (
      <>
        <main className="tela-verificacao">
          <div className="cartao-verificacao">
            <span className="girador" aria-hidden="true" />
            <p>Verificando acesso...</p>
          </div>
        </main>

        <ModalProcesso
          aberto
          titulo="Verificando acesso"
          subtitulo="O AuthGuard decide se esta rota pode ser liberada no frontend."
          passos={passos}
          aoConcluir={() => setPronto(true)}
          rotuloContinuar="Acessar a gestão"
        />
      </>
    );
  }

  return (
    <main className="tela-verificacao">
      <div className="cartao-verificacao permitido">
        <span className="icone-verificacao" aria-hidden="true">
          ✓
        </span>

        <h1>Área de gestão</h1>
        <p>
          {usuario.nome}, você possui acesso à área de gestão de eventos da
          SEMAC.
        </p>
        <p className="texto-redirecionamento">
          O AuthGuard liberou esta rota no frontend; o backend também verifica a
          permissão em cada requisição.
        </p>

        <div className="acoes-verificacao">
          <Link className="link-botao" to="/eventos/novo">
            Testar cadastro de evento
          </Link>
          <Link className="link-botao link-botao-secundario" to="/">
            Voltar ao painel
          </Link>
        </div>
      </div>
    </main>
  );
}
