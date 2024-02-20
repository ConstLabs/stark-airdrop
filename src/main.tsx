import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {StarknetProvider} from "@/components/StarkProvider.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StarknetProvider>
        <App />
    </StarknetProvider>
  </React.StrictMode>,
)
