import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import './App.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './components/Home'

const App = () => {
  return (
    <Router>
      <div className='App'>
        <Header />
        <div className='container container-fluid'>
          <Route path='/' component={Home} exact />
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App
