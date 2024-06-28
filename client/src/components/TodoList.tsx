import { Flex, Spinner, Stack, Text, Link, Box, HStack, Image, useColorModeValue } from "@chakra-ui/react";
import TodoItem from "./TodoItem";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import reactLogo from '../assets/react.svg'
import nodeLogo from '../assets/node.png'
import expressLogo from '../assets/express-js.png'
import mongoDbLogo from '../assets/mongodb.png'
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

  const bg = useColorModeValue("gray.300", "gray.700");

  return (
    <>
      {isLoading && (
        <Flex justifyContent={"center"} my={4}>
          <Spinner size={"xl"} />
        </Flex>
      )}
      {!isLoading && todos?.length === 0 && (
        <Stack alignItems={"center"} gap='10' py='4'>
          <Box bg={bg} p={6} borderWidth='1px' borderRadius='lg'>
            <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
              All tasks completed! 🤞
            </Text>
            <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
              Go have a coffee ☕️
            </Text>
          </Box>
          <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
            Built by Simon Whyatt <br></br> Freelance Full Stack developer at {' '}
            <Link color='teal.500' href="https://fullstack.cat" isExternal>
              FullStack.Cat
            </Link>
          </Text>
          <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
            Written in TypeScript using MERN Stack: MongoDB, ExpressJS, REACT and NodeJS
          </Text>
          <HStack>
            <a href="https://www.mongodb.com/" target="_blank">
              <Image src={mongoDbLogo} alt="MongoDb logo" boxSize="75px" />
            </a>

            <a href="https://expressjs.com/" target="_blank">
              <Image src={expressLogo} alt="Express logo" boxSize="75px" />
            </a>
            <a href="https://react.dev" target="_blank">
              <Image src={reactLogo} className="logo react" alt="React logo" boxSize="75px" />
            </a>
            <a href="https://nodejs.org/en/about.com" target="_blank">
              <Image src={nodeLogo} alt="Node logo" boxSize="75px" />
            </a>

          </HStack>
        </Stack >
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
