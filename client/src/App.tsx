import './App.css'
import { Stack, Container } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { useState } from 'react'
import Footer from './components/Footer'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TodoPage from './components/TodoPage'
import Projects from './components/Projects'
import User from './components/User'
import LoginPage from './components/LoginPage'
import PrivateRoute from './components/PrivateRoute'

export const BASE_URL = "http://localhost:5000/api"

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Stack h="100vh" >
        <Navbar logout={logout} token={token} />
        <Container h="100vh" >
          <Routes>
            <Route path="/" element={token ? <Navigate to="/todos" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage setToken={setToken} />} />
            <Route element={<PrivateRoute token={token} />}>
              <Route path="/todos" element={<TodoPage token={token} />} />
              <Route path="/projects" element={<Projects token={token} />} />
              <Route path="/user" element={<User token={token} />} />
            </Route>
          </Routes>
        </Container>
        <Footer />
      </Stack>
    </Router>
  )
}

export default App
