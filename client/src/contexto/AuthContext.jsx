/**
 * Contexto de autenticação.
 *
 * Guarda o token JWT no localStorage para que a sessão sobreviva a um
 * recarregamento da página. Ao iniciar, perguntamos ao backend quem é o
 * dono do token (rota /api/autenticacao/eu).
 *
 * `entrar` apenas faz a requisição. `salvarSessao` é chamada depois que o
 * modo didático termina de explicar o login, evitando que o redirecionamento
 * feche o modal antes do fim.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { requisitar } from '../api.js';

const CHAVE_TOKEN = 'semac.token';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CHAVE_TOKEN));
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUsuario(null);
      setCarregando(false);
      return undefined;
    }

    let ativo = true;
    setCarregando(true);

    requisitar('/autenticacao/eu', { token })
      .then((dados) => {
        if (ativo) setUsuario(dados.usuario);
      })
      .catch(() => {
        if (ativo) {
          localStorage.removeItem(CHAVE_TOKEN);
          setToken(null);
          setUsuario(null);
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  /** Faz o login e devolve { token, usuario, passos }. */
  async function entrar(email, senha) {
    return requisitar('/autenticacao/entrar', {
      metodo: 'POST',
      corpo: { email, senha },
    });
  }

  /** Efetiva a sessão no navegador (token + usuário). */
  function salvarSessao(dados) {
    localStorage.setItem(CHAVE_TOKEN, dados.token);
    setToken(dados.token);
    setUsuario(dados.usuario);
  }

  function sair() {
    localStorage.removeItem(CHAVE_TOKEN);
    setToken(null);
    setUsuario(null);
  }

  return (
    <ContextoAutenticacao.Provider
      value={{ token, usuario, carregando, entrar, salvarSessao, sair }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);

  if (!contexto) {
    throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao.');
  }

  return contexto;
}
