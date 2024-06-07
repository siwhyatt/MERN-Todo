import './App.css'
import { Stack, Container, Tabs, TabList, Tab, TabPanel, TabPanels } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import TodoForm from './components/TodoForm'
import RegistrationForm from './components/RegistrationForm'
import LoginForm from './components/LoginForm'
import { useState } from 'react'
import TodoList from './components/TodoList'

export const BASE_URL = "http://localhost:5000/api"

function App() {
  const [token, setToken] = useState<string | null>(null);
  return (
    <>
      <Stack h="100vh" >
        <Navbar />
        <Container>
          {!token ? (
            <Tabs>
              <TabList>
                <Tab>Register</Tab>
                <Tab>Login</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <RegistrationForm />
                </TabPanel>
                <TabPanel>
                  <LoginForm setToken={setToken} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <>
              <TodoForm token={token} />
              <TodoList token={token} />
            </>
          )}
        </Container>
      </Stack>
    </>
  )
}

export default App
