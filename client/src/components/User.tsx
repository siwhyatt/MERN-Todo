import { Heading } from "@chakra-ui/react";
import UserSettings from "./UserSettings";
import SEO from "./SEO";

const User = ({ token }: { token: string }) => {
  return (
    <>
      <SEO
        title="Settings | Full Stack Cat"
        description="Configure your default settings for the Todo List App"
      />
      <Heading as="h2" size="lg" mb={4}>
        Todo Defaults
      </Heading>
      <UserSettings token={token} />
    </>
  );
};

export default User;

