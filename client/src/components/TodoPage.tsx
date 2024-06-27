import SEO from "./SEO";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import { SortFunction } from '../utils/sortFunctions';
import { Dispatch, SetStateAction } from "react";

interface TodoPageProps {
  token: string;
  sortFunction: SortFunction;
  focusAddInput: boolean;
  setFocusAddInput: Dispatch<SetStateAction<boolean>>;
}

const TodoPage = ({ token, sortFunction, focusAddInput, setFocusAddInput }: TodoPageProps) => (
  <>
    <SEO
      title="Todo List App | Full Stack Cat"
      description="Manage your tasks with our todo list application"
    />
    <TodoForm token={token} focusAddInput={focusAddInput} setFocusAddInput={setFocusAddInput} />
    <TodoList token={token} sortFunction={sortFunction} />
  </>
);

export default TodoPage;

