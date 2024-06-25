import './App.css'
import { Stack, Container } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { useState } from 'react'
import Footer from './components/Footer'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TodoPage from './components/TodoPage'
import ProjectsPage from './components/ProjectsPage'
import User from './components/User'
import LoginPage from './components/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import RequestToken from './components/RequestToken'
import EmailSent from './components/EmailSent'
import ResetPassword from './components/ResetPassword'

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
        <Container >
          <Routes>
            <Route path="/login" element={<LoginPage setToken={setToken} />} />
            <Route path="/reset-password/request" element={<RequestToken />} />
            <Route path="/reset-password/email-sent" element={<EmailSent />} />
            <Route path="/reset-password/" element={<ResetPassword />} />
            <Route element={<PrivateRoute token={token} />}>
              <Route path="/" element={<TodoPage token={token} />} />
              <Route path="/projects" element={<ProjectsPage token={token} />} />
              <Route path="/user" element={<User token={token} />} />
            </Route>
          </Routes>
        </Container>
      </Stack>
    </Router>
  )
}

export default App
