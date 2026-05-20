import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Pre-init AI engine on load (non-blocking)
import { engine } from './ai/SearchEngine.js'
setTimeout(() => engine.init(), 0)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
