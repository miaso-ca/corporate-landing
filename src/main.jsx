import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { captureUtm } from './lib/utm.js'
import './styles/tokens.css'

captureUtm()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
