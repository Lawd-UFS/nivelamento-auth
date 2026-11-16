import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthGuard from "./componentes/AuthGuard.jsx";
import { useAutenticacao } from "./contexto/AuthContext.jsx";
import { podeGerenciarEventos } from "./permissoes.js";
import PaginaLogin from "./paginas/Login.jsx";
import Painel from "./paginas/Painel.jsx";
import PaginaEvento from "./paginas/Evento.jsx";
import VerificacaoAcesso from "./paginas/VerificacaoAcesso.jsx";
import Gestao from "./paginas/Gestao.jsx";

function TelaCarregando() {
  return (
    <div className="tela-carregando">
      <span className="girador" aria-hidden="true" />
      Verificando sessão...
    </div>
  );
}

/**
 * Combina o estado de carregamento da sessão com o AuthGuard.
 * O guard recebe o usuário e decide se libera ou redireciona.
 */
function RotaProtegida({ children, permitido, redirecionarPara, regraNegado }) {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) return <TelaCarregando />;

  return (
    <AuthGuard
      usuario={usuario}
      permitido={permitido}
      redirecionarPara={redirecionarPara}
      regraNegado={regraNegado}
    >
      {children}
    </AuthGuard>
  );
}

/** Quem já está logado não precisa ver a tela de login. */
function RotaPublica({ children }) {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) return <TelaCarregando />;
  if (usuario) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RotaPublica>
              <PaginaLogin />
            </RotaPublica>
          }
        />

        <Route
          path="/"
          element={
            <RotaProtegida>
              <Painel />
            </RotaProtegida>
          }
        />

        <Route
          path="/gestao"
          element={
            <RotaProtegida
              permitido={podeGerenciarEventos}
              regraNegado="palestrante && anosNaLawd >= 3 → false"
            >
              <Gestao />
            </RotaProtegida>
          }
        />

        <Route
          path="/eventos/novo"
          element={
            <RotaProtegida>
              <VerificacaoAcesso tipo="cadastrar" />
            </RotaProtegida>
          }
        />

        <Route
          path="/eventos/:id/editar"
          element={
            <RotaProtegida>
              <VerificacaoAcesso tipo="editar" />
            </RotaProtegida>
          }
        />

        <Route
          path="/eventos/:id"
          element={
            <RotaProtegida>
              <PaginaEvento />
            </RotaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
