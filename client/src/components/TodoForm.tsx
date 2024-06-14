import { Button, Flex, Input, Spinner, RadioGroup, Radio, Stack, useToast, TabList, Tab, TabPanels, TabPanel, Tabs } from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";

interface TodoFormProps {
  token: string;
}

interface Project {
  _id: string;
  name: string;
}

const TodoForm = ({ token }: TodoFormProps) => {
  const [newTodo, setNewTodo] = useState("");
  const [newTime, setNewTime] = useState("15");
  const [newPriority, setNewPriority] = useState("medium");
  const [newProject, setNewProject] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isCreated, setIsCreated] = useState(false);

  // Fetch the list of projects
  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch(BASE_URL + "/projects", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      return res.json();
    },
  });

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationKey: ['createTodo'],
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const res = await fetch(BASE_URL + `/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTodo,
            time: parseInt(newTime),
            priority: newPriority,
            projectId: selectedProjectId,
          }),
        })
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setNewTodo("");
        setNewProject("");
        setSelectedProjectId(null);
        setIsCreated(true);
        return data;

      } catch (error: any) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({
        title: "Todo added successfuly.",
        description: "You have one more thing to do!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    },
    onError: (error: any) => {
      alert(error.message);
    }
  });

  useEffect(() => {
    if (isCreated && inputRef.current) {
      inputRef.current.focus();
      setIsCreated(false); // Reset the flag after focusing
    }
  }, [isCreated]);

  // Handle project selection and creation
  const handleProjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject(event.target.value);
    const selectedProject = projects?.find(project =>
      project.name.toLowerCase() === event.target.value.toLowerCase()
    );
    setSelectedProjectId(selectedProject ? selectedProject._id : null);
  };

  const handleAddProject = async () => {
    if (newProject) {
      const existingProject = projects?.find(project =>
        project.name.toLowerCase() === newProject.toLowerCase()
      );
      if (!existingProject) {
        const res = await fetch(BASE_URL + `/projects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newProject }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        setSelectedProjectId(data._id);
      } else {
        setSelectedProjectId(existingProject._id);
      }
    }
  };

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(newProject.toLowerCase())
  );

  return (
    <form onSubmit={createTodo}>
      <Flex my="1rem" gap={2}>
        <Input
          type='text'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          ref={inputRef}
        />
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
      <Tabs variant='soft-rounded' colorScheme='blue'>
        <TabList>
          <Tab>Time</Tab>
          <Tab>Priority</Tab>
          <Tab>Project</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <RadioGroup
              value={newTime}
              onChange={setNewTime}
            >
              <Stack spacing={5} direction={'row'}>
                <Radio value="15">15m</Radio>
                <Radio value="30">30m</Radio>
                <Radio value="60">1h</Radio>
                <Radio value="120">2h</Radio>
              </Stack>
            </RadioGroup>
          </TabPanel>
          <TabPanel>
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
          </TabPanel>
          <TabPanel>
            <Flex>
              <Input
                placeholder="Project name"
                value={newProject}
                onChange={handleProjectChange}
                list="project-options"
              />
              <Button
                ml={2}
                onClick={handleAddProject}
              >
                Add Project
              </Button>
            </Flex>
            <datalist id="project-options">
              {filteredProjects?.map(project => (
                <option key={project._id} value={project.name} />
              ))}
            </datalist>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </form>
  );
};
export default TodoForm;
