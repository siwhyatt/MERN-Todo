import { Container, Heading, Text } from "@chakra-ui/react";
import UserSettings from "./UserSettings";

const User = ({ token }: { token: string }) => {
  return (
    <Container>
      <Heading as="h2" size="lg" mb={4}>
        User Settings
      </Heading>
      <Text>
        Manage your user settings here.
      </Text>
      <UserSettings token={token} />
    </Container>
  );
};

export default User;

