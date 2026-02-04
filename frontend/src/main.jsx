import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

// import index.css here and can use globally
import '/index.css'
import App from './App.jsx'
import { store } from './redux/store'
import { ErrorProvider } from './contexts/ErrorContext'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </Provider>
  </StrictMode>,
)
