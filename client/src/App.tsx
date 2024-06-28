import './App.css'
import { Container, Spinner, Center, useColorModeValue, Flex, Box } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TodoPage from './components/TodoPage'
import ProjectsPage from './components/ProjectsPage'
import User from './components/User'
import LoginPage from './components/LoginPage'
import PrivateRoute from './components/PrivateRoute'
import RequestToken from './components/RequestToken'
import EmailSent from './components/EmailSent'
import ResetPassword from './components/ResetPassword'
import Footer from './components/Footer';
import { useSorting } from './utils/useSorting';

export const BASE_URL = import.meta.env.API_URL

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
                    <Route path="/" element={token ? (<TodoPage
                      token={token} // Error here
                      sortFunction={sortFunction}
                      focusAddInput={focusAddInput}
                      setFocusAddInput={setFocusAddInput}
                    />) : null} />
                    <Route path="/projects" element={token ? <ProjectsPage token={token} /> : null} /> // Error here
                    <Route path="/user" element={token ? <User token={token} /> : null} /> // Error here
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
