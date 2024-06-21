import { Container, Heading, Text } from "@chakra-ui/react";
import ProjectList from "./ProjectList";
import ProjectForm from "./ProjectForm";

interface ProjectPageProps {
  token: string;
}

const Projects = ({ token }: ProjectPageProps) => {
  return (
    <Container>
      <Heading as="h2" size="lg" mb={4}>
        Add New Project:
      </Heading>
      <ProjectForm token={token} />
      <Heading as="h2" size="lg" mb={4}>
        Edit Projects:
      </Heading>
      <ProjectList token={token} />
    </Container>
  );
};

export default Projects;

