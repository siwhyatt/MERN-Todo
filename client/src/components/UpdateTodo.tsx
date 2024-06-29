import { FaEdit } from "react-icons/fa";
import { Todo } from "../utils/sortFunctions";
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
  Stack,
} from '@chakra-ui/react'
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProjectSelector from "./ProjectSelector";
import TimeSelect from "./TimeSelect";
import PrioritySelect from "./PrioritySelect";

interface UpdateTodoProps {
  todo: Todo;
  token: string;
}

const UpdateTodo = ({ todo, token }: UpdateTodoProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newTitle, setNewTitle] = useState(todo.title);
  const [newTime, setNewTime] = useState(todo.time.toString());
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>(todo.priority as 'low' | 'medium' | 'high');
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
      <Box color={"teal"} cursor={"pointer"} onClick={onOpen}>
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
                <TimeSelect value={newTime} onChange={setNewTime} />
                <PrioritySelect value={newPriority} onChange={(value) => setNewPriority(value)} />
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

