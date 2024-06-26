import { FaEdit } from "react-icons/fa";
import { Project } from "./ProjectList";
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

interface UpdateProjectProps {
  project: Project;
  token: string;
}

const UpdateProject = ({ project, token }: UpdateProjectProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newTitle, setNewTitle] = useState(project.name);
  const [newDescription, setNewDescription] = useState(project.description);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { mutate: updateProject, isPending: isUpdating } = useMutation({
    mutationKey: ["updateProject"],
    mutationFn: async () => {
      try {
        const res = await fetch(BASE_URL + `/projects/${project._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newTitle,
            description: newDescription,
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
        title: "Project updated.",
        description: "The project item has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject();
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
            <ModalHeader>Update Project</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={5}>
                <Input
                  type="text"
                  title="name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="New project name?"
                >
                </Input>
                <Input
                  autoFocus
                  type="text"
                  title="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add project description?"
                >
                </Input>
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

export default UpdateProject;


