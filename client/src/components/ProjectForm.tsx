import { Button, Flex, Input, Spinner, Stack, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";

interface ProjectFormProps {
  token: string;
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
      } catch (error: any) {
        throw new Error(error);
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
    onError: (error: any) => {
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
          <Input
            type='text'
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            ref={inputRef}
            placeholder="Project Name"
            autoFocus={true}
          />
          <Input
            type='text'
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Project Description (optional)"
          />
        </Stack>
        <Button
          mx={2}
          type='submit'
          _active={{
            transform: "scale(.97)",
          }}
        >
          {isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
        </Button>
      </Flex>
    </form>
  );
};

export default ProjectForm;

