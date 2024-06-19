import { Container, Tabs, TabList, Tab, TabPanel, TabPanels } from "@chakra-ui/react"
import RegistrationForm from "./RegistrationForm"
import LoginForm from "./LoginForm"

interface LoginPageProps {
  setToken: (token: string) => void;
}
const LoginPage = ({ setToken }: LoginPageProps) => (
  <Container>
    <Tabs>
      <TabList>
        <Tab>Register</Tab>
        <Tab>Login</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <RegistrationForm />
        </TabPanel>
        <TabPanel>
          <LoginForm setToken={setToken} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Container>
)

export default LoginPage;
