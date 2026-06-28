import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { SocketProvider } from '../../context/SocketContext'

const CitizenLayout = () => {
  return (
    <SocketProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16">
          <Outlet />
        </main>
      </div>
    </SocketProvider>
  )
}

export default CitizenLayout