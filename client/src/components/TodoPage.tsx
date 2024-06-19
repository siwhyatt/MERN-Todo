import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

interface TodoPageProps {
  token: string;
}

const TodoPage = ({ token }: TodoPageProps) => (
  <>
    <TodoForm token={token} />
    <TodoList token={token} />
  </>
);

export default TodoPage;

