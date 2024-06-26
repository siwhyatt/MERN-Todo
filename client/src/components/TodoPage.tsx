import SEO from "./SEO";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

interface TodoPageProps {
  token: string;
}

const TodoPage = ({ token }: TodoPageProps) => (
  <>
    <SEO
      title="Todo List App | Full Stack Cat"
      description="Manage your tasks with our todo list application"
    />
    <TodoForm token={token} />
    <TodoList token={token} />
  </>
);

export default TodoPage;

