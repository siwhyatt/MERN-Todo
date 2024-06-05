import { Box, Container, Flex, useColorMode, useColorModeValue } from "@chakra-ui/react";
import reactLogo from '../assets/react.svg'


export default function Navbar() {
  // const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxW={"900px"}>
      <Box bg={useColorModeValue("gray.400", "gray.700")} px={4} my={4} borderRadius={"5"}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Flex>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </Flex>
        </Flex>
      </Box>
    </Container>
  )
}
