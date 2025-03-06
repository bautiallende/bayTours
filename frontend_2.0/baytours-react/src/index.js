import React from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App';

// Importar Bootstrap (asegúrate de que la ruta sea correcta)
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar el archivo SCSS principal
import './styles/main.scss';

const container = document.getElementById('root'); // Selecciona el contenedor
const root = ReactDOM.createRoot(container);        // Crea una raíz de React 18

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);