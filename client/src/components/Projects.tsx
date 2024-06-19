import { Container, Heading, Text } from "@chakra-ui/react";

const Projects = ({ token }: { token: string }) => {
  return (
    <Container>
      <Heading as="h2" size="lg" mb={4}>
        Projects
      </Heading>
      <Text>
        Manage your projects here.
      </Text>
      {/* Add project management logic and UI components here */}
    </Container>
  );
};

export default Projects;

