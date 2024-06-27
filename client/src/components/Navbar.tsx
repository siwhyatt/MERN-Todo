import { Button, Container, Flex, Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { IoMoon, IoLogIn } from "react-icons/io5";
import { RiHome2Fill } from "react-icons/ri";
import { LuSun } from "react-icons/lu";
import { FaFolder } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { Link as RouterLink } from "react-router-dom";
import ToggleHomeButton from "./ToggleHomeButton";

interface NavbarProps {
  logout: () => void;
  token: string | null;
}

const Navbar = ({ logout, token }: NavbarProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex="sticky"
      bg="gray.800"
      color="white"
    >
      <Container maxW={"900px"}>
        <Flex bg={useColorModeValue("gray.300", "gray.700")} p={4} my={4} gap={3} borderRadius={5} alignItems={"center"} justifyContent={"space-between"} >
          <Flex>
            <ToggleHomeButton />
            <Button display={{ base: "none", md: "flex" }} as={RouterLink} to="/" mr={4}>
              <RiHome2Fill />
            </Button>
            <Button display={{ base: "none", md: "flex" }} as={RouterLink} to="/projects" mr={4}>
              <FaFolder />
            </Button>
          </Flex>
          <Flex gap={3}>
            <Button onClick={toggleColorMode}>
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
                <ImCross />
              </Button>
            ) : (
              <Button as={RouterLink} to="/login">
                <IoLogIn />
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default Navbar;
