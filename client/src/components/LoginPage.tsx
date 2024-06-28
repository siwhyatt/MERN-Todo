import SEO from "./SEO";
import { Tabs, TabList, Tab, TabPanel, TabPanels } from "@chakra-ui/react"
import RegistrationForm from "./RegistrationForm"
import LoginForm from "./LoginForm"

interface LoginPageProps {
  setToken: (token: string) => void;
}

const LoginPage = ({ setToken }: LoginPageProps) => (
  <>
    <SEO
      title="Login / Register | Full Stack Cat"
      description="Login / Register to manage your tasks with our todo list application"
    />
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
  </>
)

export default LoginPage;
