import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ProvedorAutenticacao } from './contexto/AuthContext.jsx';
import './estilos.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProvedorAutenticacao>
      <App />
    </ProvedorAutenticacao>
  </React.StrictMode>,
);
