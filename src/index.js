import React from 'react';
import ReactDOM from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge'
import {isVk} from './utilities/platform'
import {HashRouter} from 'react-router-dom'
import Splash from './screens/Splash'

const {loadDatabase} = require('./utilities/db')

// Внутри ВКонтакте приложение нужно инициализировать через VK Bridge
if (isVk) {
  bridge.send('VKWebAppInit').catch((error) => console.error('Ошибка инициализации VK:', error))
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// Приложение подгружается после базы данных: его модули работают с данными сразу при запуске
const start = () => {
  root.render(<Splash progress={0} />)
  loadDatabase((progress) => root.render(<Splash progress={progress} />))
    .then(() => import('./App'))
    .then(({default: App}) => root.render(
      <React.StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </React.StrictMode>
    ))
    .catch((error) => {
      console.error(error)
      root.render(<Splash progress={0} hasError onRetry={start} />)
    })
}

start()
