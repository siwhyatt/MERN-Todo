import { FaEdit } from "react-icons/fa";
import { Todo } from "./TodoList";
import { BASE_URL } from "../App";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  useDisclosure,
  Button,
  Input,
  useToast,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react'
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProjectSelector from "./ProjectSelector";

interface UpdateTodoProps {
  todo: Todo;
  token: string;
}

const UpdateTodo = ({ todo, token }: UpdateTodoProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newTitle, setNewTitle] = useState(todo.title);
  const [newTime, setNewTime] = useState(todo.time.toString());
  const [newPriority, setNewPriority] = useState(todo.priority);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(todo.projectId || null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { mutate: updateTodo, isPending: isUpdating } = useMutation({
    mutationKey: ["updateTodo"],
    mutationFn: async () => {
      try {
        const res = await fetch(BASE_URL + `/todos/${todo._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTitle,
            time: parseInt(newTime),
            priority: newPriority,
            projectId: selectedProjectId,
          }),

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
        title: "Todo updated.",
        description: "The todo item has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTodo();
  };

  return (
    <>
      <Box color={"green.500"} cursor={"pointer"} onClick={onOpen}>
        <FaEdit size={20} />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Update Todo</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={5}>
                <Input
                  type="text"
                  title="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  ref={(input) => input && input.focus()}
                  placeholder="New title?"
                >
                </Input>
                <RadioGroup
                  value={newTime}
                  onChange={setNewTime}
                >
                  <Stack spacing={5} direction="row">
                    <Radio value="15">15m</Radio>
                    <Radio value="30">30m</Radio>
                    <Radio value="60">1h</Radio>
                    <Radio value="120">2h</Radio>
                  </Stack>
                </RadioGroup>
                <RadioGroup
                  value={newPriority}
                  onChange={setNewPriority}
                >
                  <Stack spacing={5} direction="row">
                    <Radio size='lg' value="low" colorScheme='blue'>Low</Radio>
                    <Radio size='lg' value="medium" colorScheme='green'>Med</Radio>
                    <Radio size='lg' value="high" colorScheme='red'>High</Radio>
                  </Stack>
                </RadioGroup>
                <ProjectSelector
                  token={token}
                  onProjectSelect={setSelectedProjectId}
                  initialProjectId={selectedProjectId}
                />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='teal' variant='outline' onClick={onClose} mx='1'>
                Cancel
              </Button>
              <Button type="submit" colorScheme='teal' isLoading={isUpdating}>
                Update
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateTodo;

