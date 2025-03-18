import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ToDoList  from './pages/ToDoList'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<ToDoList/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
    </>
  </Router>
  )
}

export default App
