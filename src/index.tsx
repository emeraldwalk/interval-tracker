import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './components'
import { registerNotifications } from './util/notifications'

import './index.scss'

registerNotifications().then(() => {
  Notification.requestPermission()
})

window.addEventListener('resize', () => {
  // css variable used in stylesheet
  const vh = window.innerHeight;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
})

ReactDOM.render(
  <App/>,
  document.querySelector('#app'),
)