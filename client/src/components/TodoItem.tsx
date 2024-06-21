import { Badge, Stack, Box, Flex, Spinner, Text, useToast, useColorMode } from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { Todo } from "./TodoList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import UpdateTodo from "./UpdateTodo.tsx"
import { useProjectsQuery } from "../hooks/useProjects";

const usePriorityStyles = () => {
  const { colorMode } = useColorMode();

  return {
    low: {
      color: colorMode === "light" ? "blue.700" : "blue.200",
      badgeColor: "blue",
      badgeText: "Low",
    },
    medium: {
      color: colorMode === "light" ? "yellow.700" : "yellow.200",
      badgeColor: "yellow",
      badgeText: "Todo",
    },
    high: {
      color: colorMode === "light" ? "red.700" : "red.200",
      badgeColor: "red",
      badgeText: "High",
    },
  };
};

const useTimeStyles = () => {
  const { colorMode } = useColorMode();

  return (time: number) => {
    if (time <= 15) {
      return {
        color: colorMode === "light" ? "green.700" : "green.200",
        badgeColor: "green",
        badgeText: "15m",
      };
    } else if (time <= 30) {
      return {
        color: colorMode === "light" ? "blue.700" : "blue.200",
        badgeColor: "blue",
        badgeText: "30m",
      };
    } else if (time <= 60) {
      return {
        color: colorMode === "light" ? "yellow.700" : "yellow.200",
        badgeColor: "yellow",
        badgeText: "1h",
      };
    } else {
      return {
        color: colorMode === "light" ? "red.700" : "red.200",
        badgeColor: "red",
        badgeText: "2h",
      };
    }
  };
};

interface TodoItemProps {
  todo: Todo;
  token: string;
}

const TodoItem = ({ todo, token }: TodoItemProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const priorityStyles = usePriorityStyles();
  const getTimeStyles = useTimeStyles();
  const { data: projects, isLoading, error } = useProjectsQuery(token);
  const project = projects?.find((project) => project._id === todo.projectId);

  const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteTodo"],
    mutationFn: async () => {
      try {
        const res = await fetch(BASE_URL + `/todos/${todo._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      toast({
        title: "Todo deleted.",
        description: "The todo item has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const styles = priorityStyles[todo.priority];
  const timeStyles = getTimeStyles(todo.time);

  return (
    <Flex gap={2} alignItems={"center"}>
      <Flex
        flex={1}
        alignItems={"start"}
        border={"1px"}
        borderColor={"gray.600"}
        p={2}
        borderRadius={"lg"}
        justifyContent={"space-between"}
        flexDirection={{ base: "column", md: "row" }}
      >
        <Stack>
          <Text fontSize="lg"
            color={styles.color}
          >
            {todo.title}
          </Text>
          {isLoading ? (
            <Spinner size="sm" />
          ) : error ? (
            <Text color="red.500">Error loading projects</Text>
          ) : (
            <Text fontSize="sm" color='grey'>{project ? project.name : "General"}</Text>
          )}
        </Stack>
        <div>
          <Badge ml="1" colorScheme={timeStyles.badgeColor}>
            {timeStyles.badgeText}
          </Badge>
          <Badge ml='1' colorScheme={styles.badgeColor}>
            {styles.badgeText}
          </Badge>
        </div>
      </Flex>
      <Flex gap={2} alignItems={"center"} flexDirection={{ base: "column", md: "row" }}>
        <UpdateTodo key={todo._id} todo={todo} token={token} />
        <Box color={"red.500"} cursor={"pointer"} onClick={() => deleteTodo()}>
          {!isDeleting && <MdDelete size={25} />}
          {isDeleting && <Spinner size={"sm"} />}
        </Box>
      </Flex>
    </Flex>
  );
};
export default TodoItem;
