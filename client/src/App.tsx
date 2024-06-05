import './App.css'
import { Stack, Container } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import TodoForm from './components/TodoForm'

function App() {

  return (
    <>
      <Stack h="100vh">
        <Navbar />
        <Container>
          <TodoForm />
        </Container>
      </Stack>
    </>
  )
}

export default App
