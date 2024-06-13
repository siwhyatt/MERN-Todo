import { Badge, Box, Flex, Spinner, Text, useToast } from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { Todo } from "./TodoList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import UpdateTodo from "./UpdateTodo.tsx"

const priorityStyles: { [key: string]: { color: string, badgeColor: string, badgeText: string } } = {
  low: { color: "blue.200", badgeColor: "blue", badgeText: "Low Priority" },
  medium: { color: "yellow.200", badgeColor: "yellow", badgeText: "Todo" },
  high: { color: "red.200", badgeColor: "red", badgeText: "Urgent" },
};

interface TodoItemProps {
  todo: Todo;
  token: string;
}

const TodoItem = ({ todo, token }: TodoItemProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();

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

  return (
    <Flex gap={2} alignItems={"center"}>
      <Flex
        flex={1}
        alignItems={"center"}
        border={"1px"}
        borderColor={"gray.600"}
        p={2}
        borderRadius={"lg"}
        justifyContent={"space-between"}
      >
        <Text
          color={styles.color}
        >
          {todo.title}
        </Text>
        <Badge ml='1' colorScheme={styles.badgeColor}>
          {styles.badgeText}
        </Badge>
      </Flex>
      <Flex gap={2} alignItems={"center"}>
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
