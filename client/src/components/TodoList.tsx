import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import TodoItem from "./TodoItem";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import reactLogo from '../assets/react.svg'
import wooLogo from '../assets/WooSimon Logo DSG.png'
import { useMemo } from "react";
import { SortFunction, Todo } from '../utils/sortFunctions';


interface TodoListProps {
  token: string;
  sortFunction: SortFunction;
}

const TodoList = ({ token, sortFunction }: TodoListProps) => {
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      try {
        const res = await fetch(BASE_URL + "/todos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data || [];
      } catch (error) {
        console.log(error);
      }
    },
  });

  const sortedTodos = useMemo(() => {
    return todos ? [...todos].sort(sortFunction) : [];
  }, [todos, sortFunction]);

  return (
    <>
      {isLoading && (
        <Flex justifyContent={"center"} my={4}>
          <Spinner size={"xl"} />
        </Flex>
      )}
      {!isLoading && todos?.length === 0 && (
        <Stack alignItems={"center"} gap='3'>
          <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
            All tasks completed! 🤞
          </Text>
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            <Flex>
              <a href="https://woosimon.com" target="_blank">
                <img src={wooLogo} className="logo woo" alt="Woo logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </Flex>
          </Flex>
        </Stack>
      )}
      <Stack gap={3}>
        {sortedTodos?.map((todo) => (
          <TodoItem key={todo._id} todo={todo} token={token} />
        ))}
      </Stack>
    </>
  );
};
export default TodoList;
