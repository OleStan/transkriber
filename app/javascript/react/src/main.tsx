import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import Home from './components/home/Home.tsx'
import Transcription from './components/transcription/Transcription.tsx'
import Root from "./routes/Root";
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { store } from './app/store'
import { Provider } from 'react-redux'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Root />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/transcription",
        element: <Transcription />,
      }
    ],
  },
]);

// @ts-ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);