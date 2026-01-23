import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { router } from './router'
import './index.css'
import { ToastProvider } from '@/components/ui/toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <>
        <ToastProvider />
        <RouterProvider router={router} />
      </>
    </Provider>
  </React.StrictMode>,
)
