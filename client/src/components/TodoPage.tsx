import { Container } from "@chakra-ui/react";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

interface TodoPageProps {
  token: string;
}

const TodoPage = ({ token }: TodoPageProps) => (
  <Container>
    <TodoForm token={token} />
    <TodoList token={token} />
  </Container>
);

export default TodoPage;

