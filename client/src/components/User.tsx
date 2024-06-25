import { Container, Heading, Text } from "@chakra-ui/react";
import UserSettings from "./UserSettings";

const User = ({ token }: { token: string }) => {
  return (
    <Container>
      <Heading as="h2" size="lg" mb={4}>
        Todo Defaults
      </Heading>
      <UserSettings token={token} />
    </Container>
  );
};

export default User;

