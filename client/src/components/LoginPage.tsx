import { Tabs, TabList, Tab, TabPanel, TabPanels } from "@chakra-ui/react"
import RegistrationForm from "./RegistrationForm"
import LoginForm from "./LoginForm"

interface LoginPageProps {
  setToken: (token: string) => void;
}

const LoginPage = ({ setToken }: LoginPageProps) => (
  <Tabs>
    <TabList>
      <Tab>Login</Tab>
      <Tab>Register</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <LoginForm setToken={setToken} />
      </TabPanel>
      <TabPanel>
        <RegistrationForm />
      </TabPanel>
    </TabPanels>
  </Tabs>
)

export default LoginPage;
