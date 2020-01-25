import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './components'

import './index.scss'

window.addEventListener('resize', () => {
  // css variable used in stylesheet
  const vh = window.innerHeight;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
})

ReactDOM.render(
  <App/>,
  document.querySelector('#app'),
)