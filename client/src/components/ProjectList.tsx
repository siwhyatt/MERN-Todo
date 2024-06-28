import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import ProjectItem from "./ProjectItem";
import { useProjectsQuery } from "../hooks/useProjects";

export type Project = {
  _id: string;
  userId: string;
  name: string;
  description?: string | null;
};

interface ProjectListProps {
  token: string;
}

const ProjectList = ({ token }: ProjectListProps) => {
  const { data: projects, isLoading, error } = useProjectsQuery(token);

  if (error) {
    return <div>Error fetching projects: {error.message}</div>;
  }

  return (
    <>
      {isLoading && (
        <Flex justifyContent={"center"} my={4}>
          <Spinner size={"xl"} />
        </Flex>
      )}
      {!isLoading && projects?.length === 0 && (
        <Stack alignItems={"center"} gap='3'>
          <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
            You have no projects at the moment
          </Text>
        </Stack>
      )}
      <Stack gap={3}>
        {projects?.map((project) => (
          <ProjectItem key={project._id} project={project} token={token} />
        ))}
      </Stack>
    </>
  );
};
export default ProjectList;

