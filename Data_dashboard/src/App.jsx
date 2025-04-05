import React from 'react'
import './App.css'
import Header from './components/Header'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  )
}

export default App
