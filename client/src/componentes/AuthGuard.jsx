import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import ModalProcesso from "./ModalProcesso.jsx";
import { lerModoDidatico } from "../modoDidatico.js";

/**
 * Guarda de acesso do frontend.
 *
 * Recebe o usuário autenticado e uma função `permitido`. Se o usuário não
 * estiver logado, vai para `/login`. Se estiver logado mas não tiver a
 * permissão, é redirecionado com uma mensagem de aviso.
 *
 * No modo didático, a negação é explicada antes do redirecionamento: o modal
 * mostra que a decisão aconteceu **só no frontend**, sem nenhuma requisição
 * ao servidor. Quando o modo está desligado, o redirecionamento é imediato.
 *
 * Exemplo:
 *   <AuthGuard usuario={usuario} permitido={podeGerenciarEventos}>
 *     <AreaDeGestao />
 *   </AuthGuard>
 */
export default function AuthGuard({
  usuario,
  permitido,
  redirecionarPara = "/",
  mensagem = "Usuário não possui acesso ao recurso.",
  tituloNegado = "Acesso negado no frontend",
  regraNegado = "permitido(usuario) → false",
  children,
}) {
  const local = useLocation();
  const navegar = useNavigate();
  const [didatico] = useState(() => lerModoDidatico());

  // Se não estiver logado, o frontend não pode permitir o acesso ao sistema. O redirecionamento para a tela de login é imediato.
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (permitido && !permitido(usuario)) {
    const destino = { replace: true, state: { aviso: mensagem } };

    if (!didatico) {
      return <Navigate to={redirecionarPara} {...destino} />;
    }

    // Passos montados só com dados que já estão no navegador — nenhuma
    // chamada à API é feita para descobrir o resultado.
    const passos = [
      {
        titulo: "Navegação interceptada",
        detalhe: `AuthGuard · rota ${local.pathname}`,
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
        detalhe: regraNegado,
        estado: "falha",
      },
      {
        titulo: "Nenhuma requisição enviada",
        detalhe:
          "nenhuma consulta de autorização à API · bloqueio imediato na interface",
        estado: "info",
      },
      {
        titulo: "Próximo passo",
        detalhe: `redirecionar para ${redirecionarPara} com aviso`,
        estado: "falha",
      },
    ];

    return (
      <ModalProcesso
        aberto
        titulo={tituloNegado}
        subtitulo="O AuthGuard já sabe a resposta: esta verificação acontece só no navegador."
        passos={passos}
        rotuloContinuar="Voltar ao painel"
        aoConcluir={() => navegar(redirecionarPara, destino)}
      />
    );
  }

  return children;
}
