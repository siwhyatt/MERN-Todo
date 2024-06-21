import { Badge, Box, Flex, Spinner, Text, useToast, useColorMode } from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { Project } from "./ProjectList.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import UpdateProject from "./UpdateProject.tsx";

interface ProjectItemProps {
  project: Project;
  token: string;
}

const ProjectItem = ({ project, token }: ProjectItemProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { mutate: deleteProject, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteProject"],
    mutationFn: async () => {
      try {
        const res = await fetch(BASE_URL + `/projects/${project._id}`, {
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
        title: "Project deleted.",
        description: "The project item has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

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
        <Text>
          {project.name}
        </Text>
        <Text color='grey'>
          {project.description}
        </Text>
      </Flex>
      <Flex gap={2} alignItems={"center"} flexDirection={{ base: "column", md: "row" }}>
        <UpdateProject key={project._id} project={project} token={token} />
        <Box color={"red.500"} cursor={"pointer"} onClick={() => deleteProject()}>
          {!isDeleting && <MdDelete size={25} />}
          {isDeleting && <Spinner size={"sm"} />}
        </Box>
      </Flex>
    </Flex>
  );
};
export default ProjectItem;

