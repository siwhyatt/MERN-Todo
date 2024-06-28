import { Box, Flex, Input, InputGroup, InputRightElement, Spinner, Stack, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";

interface ProjectFormProps {
  token: string | null;
}

const ProjectForm = ({ token }: ProjectFormProps) => {
  const [newProject, setNewProject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isCreated, setIsCreated] = useState(false);

  const { mutate: createProject, isPending: isCreating } = useMutation({
    mutationKey: ['createProject'],
    mutationFn: async () => {
      try {
        const res = await fetch(BASE_URL + `/projects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newProject,
            description: newDescription,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setNewProject("");
        setNewDescription("");
        setIsCreated(true);
        return data;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error("An unknown error occurred");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Project added successfully.",
        description: "Lot's more things to do!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject();
  };

  useEffect(() => {
    if (isCreated && inputRef.current) {
      inputRef.current.focus();
      setIsCreated(false); // Reset the flag after focusing
    }
  }, [isCreated]);

  return (
    <form onSubmit={handleSubmit}>
      <Flex mb="2rem" gap={2}>
        <Stack w="100%" gap={2}>
          <InputGroup>
            <Input
              type='text'
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              ref={inputRef}
              placeholder="Project Name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <InputRightElement>
              <Box onClick={handleSubmit} cursor="pointer">
                {isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
              </Box>
            </InputRightElement>
          </InputGroup>
          <Input
            type='text'
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Project Description (optional)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </Stack>
      </Flex>
    </form>
  );
};

export default ProjectForm;


