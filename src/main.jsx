import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';
import './index.css';

const basename = process.env.NODE_ENV === 'production' ? '/elhaqPro' : '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        basename={basename}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true
        }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);



