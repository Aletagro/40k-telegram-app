import React from 'react';
import ReactDOM from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge'
import App from './App';
import {isVk} from './utilities/platform'
import {HashRouter} from 'react-router-dom'

// Внутри ВКонтакте приложение нужно инициализировать через VK Bridge
if (isVk) {
  bridge.send('VKWebAppInit').catch((error) => console.error('Ошибка инициализации VK:', error))
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
