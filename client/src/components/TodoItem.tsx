import { Badge, Stack, Box, Flex, Spinner, Text, useToast, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { Todo } from "../utils/sortFunctions.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import UpdateTodo from "./UpdateTodo.tsx"
import { useProjectsQuery } from "../hooks/useProjects";
import { useSwipeable } from 'react-swipeable';
import { useMediaQuery } from '@chakra-ui/react';
import { useState, useRef } from 'react';

const usePriorityStyles = () => {
  const { colorMode } = useColorMode();

  return {
    low: {
      color: colorMode === "light" ? "blue.700" : "blue.200",
      badgeColor: "blue",
      badgeText: "Low",
    },
    medium: {
      color: colorMode === "light" ? "green.700" : "yellow.200",
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
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [swipeOffset, setSwipeOffset] = useState(0);
  const DELETION_THRESHOLD = window.innerWidth / 2;
  const bgColor = useColorModeValue("white", "gray.800");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAnimation, setDeleteAnimation] = useState(false);
  const todoRef = useRef<HTMLDivElement>(null);

  const { mutate: deleteTodo, isPending: isDeletePending } = useMutation({
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
    onMutate: () => {
      setIsDeleting(true);
      setDeleteAnimation(true);
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
    onSettled: () => {
      // Start collapsing the todo item
      if (todoRef.current) {
        todoRef.current.style.height = '0px';
        todoRef.current.style.opacity = '0';
      }
      // Wait for the collapse animation to finish before updating the cache
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        setIsDeleting(false);
        setDeleteAnimation(false);
      }, 300);
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    setDeleteAnimation(true);
    setTimeout(() => {
      deleteTodo();
    }, 300); // Adjust this timing to match your animation duration
  };

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isMobile && !isDeleting) {
        setSwipeOffset(eventData.deltaX);
      }
    },
    onSwipedLeft: (eventData) => {
      if (isMobile && !isDeleting) {
        if (Math.abs(eventData.deltaX) >= DELETION_THRESHOLD) {
          handleDelete();
        } else {
          setSwipeOffset(0);
        }
      }
    },
    onSwipedRight: (eventData) => {
      if (isMobile && !isDeleting) {
        if (Math.abs(eventData.deltaX) >= DELETION_THRESHOLD) {
          handleDelete();
        } else {
          setSwipeOffset(0);
        }
      }
    },
    onTouchEndOrOnMouseUp: () => {
      if (!isDeleting) {
        setSwipeOffset(0);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  const styles = priorityStyles[todo.priority];
  const timeStyles = getTimeStyles(todo.time);
  const borderColor = useColorModeValue("gray.100", "gray.600")

  return (
    <Box
      ref={todoRef}
      position="relative"
      height="auto"
      overflow="hidden"
      transition="height 0.3s ease-out, opacity 0.3s ease-out"
    >
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
        bg="red.500"
        style={{
          opacity: Math.min(Math.abs(swipeOffset) / DELETION_THRESHOLD, 1),
          transition: 'opacity 0.2s ease-out',
        }}
        zIndex={0}
      />
      {isMobile && (
        <Text
          position="absolute"
          right={swipeOffset < 0 ? 4 : 'auto'}
          left={swipeOffset > 0 ? 4 : 'auto'}
          top="50%"
          transform="translateY(-50%)"
          color="white"
          fontWeight="bold"
          opacity={Math.abs(swipeOffset) >= DELETION_THRESHOLD ? 1 : 0}
          transition="opacity 0.2s ease-out"
        >
          Release to Delete
        </Text>
      )}
      <Flex
        gap={2}
        alignItems={"center"}
        {...handlers}
        bg={bgColor}
        borderRadius={"lg"}
        style={{
          transform: deleteAnimation
            ? `translateX(${swipeOffset < 0 ? '-' : ''}100%)`
            : `translateX(${Math.max(Math.min(swipeOffset, DELETION_THRESHOLD), -DELETION_THRESHOLD)}px)`,
          transition: 'transform 0.3s ease-out',
          opacity: isDeleting ? 0 : 1,
        }}
      >
        <Flex
          flex={1}
          alignItems={"start"}
          alignContent={"stretch"}
          border={"1px"}
          borderColor={borderColor}
          p={2}
          borderRadius={"lg"}
          justifyContent={"space-between"}
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
          <Stack alignItems={"end"}>
            <div>
              <Badge ml="1" colorScheme={timeStyles.badgeColor}>
                {timeStyles.badgeText}
              </Badge>
              <Badge ml='1' colorScheme={styles.badgeColor}>
                {styles.badgeText}
              </Badge>
            </div>
            <Flex align={'center'}>
              <UpdateTodo key={todo._id} todo={todo} token={token} />
              {!isMobile &&
                <Box color={"red.500"} cursor={"pointer"} onClick={() => deleteTodo()}>
                  {!isDeletePending && <MdDelete size={25} />}
                  {isDeletePending && <Spinner size={"sm"} />}
                </Box>
              }
            </Flex>
          </Stack>
        </Flex>
      </Flex>
      {isDeleting && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={2}
        >
          <Spinner size="xl" />
        </Box>
      )}
    </Box >
  );
};
export default TodoItem;
