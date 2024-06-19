import { Flex, Input, Button, Spinner, useToast } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BASE_URL } from "../App";
import { IoMdAdd } from "react-icons/io";

interface ProjectSelectorProps {
  token: string;
  onProjectSelect: (projectId: string | null) => void;
  initialProjectId?: string | null;
  initialProjectName?: string | null;
}

interface Project {
  _id: string;
  name: string;
}

const ProjectSelector = ({ token, onProjectSelect, initialProjectId = null }: ProjectSelectorProps) => {
  const [newProject, setNewProject] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch the list of projects
  const { data: projects } = useQuery<Project[]>({
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

  const { mutate: createProject, isPending: isCreating } = useMutation({
    mutationKey: ['createProject'],
    mutationFn: async () => {
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
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProjectId(data._id);
      setNewProject("");
      toast({
        title: "Project created successfully.",
        description: "Your new project is ready to use!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      alert(error.message);
    }
  });

  const handleProjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject(event.target.value);
    const selectedProject = projects?.find(project =>
      project.name.toLowerCase() === event.target.value.toLowerCase()
    );
    setSelectedProjectId(selectedProject ? selectedProject._id : null);
    onProjectSelect(selectedProject ? selectedProject._id : null);
  };

  const handleAddProject = () => {
    if (newProject) {
      const existingProject = projects?.find(project =>
        project.name.toLowerCase() === newProject.toLowerCase()
      );
      if (!existingProject) {
        createProject();
      } else {
        setSelectedProjectId(existingProject._id);
        onProjectSelect(existingProject._id);
      }
    }
  };

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(newProject.toLowerCase())
  );

  useEffect(() => {
    onProjectSelect(selectedProjectId);
  }, [selectedProjectId, onProjectSelect]);

  return (
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
        isDisabled={isCreating} // Disable the button when creating a project
      >
        {isCreating ? <Spinner size="sm" /> : <IoMdAdd size={30} />}
      </Button>
      <datalist id="project-options">
        {filteredProjects?.map(project => (
          <option key={project._id} value={project.name} />
        ))}
      </datalist>
    </Flex>
  );
};

export default ProjectSelector;

