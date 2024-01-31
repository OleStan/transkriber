import { useState } from 'react'

import SideBar from "./components/layout/SideBar";
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
        <SideBar />
        <Outlet />

    </CssVarsProvider>
  )
}

export default App
