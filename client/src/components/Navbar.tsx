import { Button, Container, Flex, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { IoMoon, IoLogIn } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { FaPowerOff, FaHome, FaFolder } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { Link as RouterLink } from "react-router-dom";

interface NavbarProps {
  logout: () => void;
  token: string | null;
}

const Navbar = ({ logout, token }: NavbarProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxW={"900px"}>
      <Flex bg={useColorModeValue("blue.100", "gray.700")} p={4} my={4} gap={3} borderRadius={5} alignItems={"center"} justifyContent={"space-between"} >
        <Flex>
          <Button as={RouterLink} to="/" color="white" mr={4}>
            <FaHome />
          </Button>
          <Button as={RouterLink} to="/projects" color="white" mr={4}>
            <FaFolder />
          </Button>
        </Flex>
        <Flex gap={3}>
          {/* Toggle Color Mode */}
          <Button display={{ base: "none", md: "block" }} onClick={toggleColorMode}>
            {colorMode === "light" ? <IoMoon /> : <LuSun size={20} />}
          </Button>
          {token ? (
            <Button as={RouterLink} to="/user" >
              <FaGear />
            </Button>
          ) : (
            <Button as={RouterLink} to="/login">
              <IoLogIn />
            </Button>
          )}
          {token ? (
            <Button onClick={logout}>
              <FaPowerOff />
            </Button>
          ) : (
            <Button as={RouterLink} to="/login">
              <IoLogIn />
            </Button>
          )}
        </Flex>
      </Flex>
    </Container>
  )
}

export default Navbar;
