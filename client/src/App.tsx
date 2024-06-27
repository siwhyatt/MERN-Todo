import './App.css'
import { Container, Spinner, Center, useColorModeValue, Flex, Box } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TodoPage from './components/TodoPage'
import ProjectsPage from './components/ProjectsPage'
import User from './components/User'
import LoginPage from './components/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import RequestToken from './components/RequestToken'
import EmailSent from './components/EmailSent'
import ResetPassword from './components/ResetPassword'
import { Helmet } from 'react-helmet';
import Footer from './components/Footer';
import { useSorting } from './utils/useSorting';

export const BASE_URL = "/api"

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const {
    sortFunction,
    sortType,
    sortAscending,
    setSortByCreatedAt,
    setSortByTime,
    setSortByPriority
  } = useSorting();

  const [focusAddInput, setFocusAddInput] = useState(false);

  const handleAddClick = useCallback(() => {
    setFocusAddInput(true);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    setLoading(false);
  }, []);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Router>
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      <Flex direction={'column'} bg={bgColor} minHeight="100dvh" height="100dvh">
        <Navbar logout={logout} token={token} />
        <Box flex="1" overflowY="auto" bg={bgColor}>
          <Flex direction="column" minHeight="100%">
            <Box flex="1">
              <Container maxW="600" py={4}>
                <Routes>
                  <Route path="/login" element={<LoginPage setToken={setToken} />} />
                  <Route path="/reset-password/request" element={<RequestToken />} />
                  <Route path="/reset-password/email-sent" element={<EmailSent />} />
                  <Route path="/reset-password/" element={<ResetPassword />} />
                  <Route element={<PrivateRoute token={token} />}>
                    <Route path="/" element={<TodoPage
                      token={token}
                      sortFunction={sortFunction}
                      focusAddInput={focusAddInput}
                      setFocusAddInput={setFocusAddInput}
                    />} />
                    <Route path="/projects" element={<ProjectsPage token={token} />} />
                    <Route path="/user" element={<User token={token} />} />
                  </Route>
                </Routes>
              </Container>
            </Box>
            <Footer
              setSortByCreatedAt={setSortByCreatedAt}
              setSortByTime={setSortByTime}
              setSortByPriority={setSortByPriority}
              sortType={sortType}
              sortAscending={sortAscending}
              onAddClick={handleAddClick}
            />
          </Flex>
        </Box>
      </Flex>
    </Router>
  )
}

export default App
