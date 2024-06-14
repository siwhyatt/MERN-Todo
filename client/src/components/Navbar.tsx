import { Box, Button, Container, Flex, Text, FormControl, FormLabel, Switch, useColorMode, useColorModeValue } from "@chakra-ui/react";
import reactLogo from '../assets/react.svg'
import wooLogo from '../assets/WooSimon Logo DSG.png'
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";


export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxW={"900px"}>
      <Box bg={useColorModeValue("blue.100", "gray.700")} px={4} my={4} borderRadius={"5"}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Flex>
            <a href="https://woosimon.com" target="_blank">
              <img src={wooLogo} className="logo woo" alt="Woo logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </Flex>
          <Flex>
            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='sort-todos' mb='0'>
                Filter by time?
              </FormLabel>
              <Switch id='sort-todos' />
            </FormControl>
          </Flex>
          <Flex alignItems={"center"} gap={3}>
            <Text fontSize={"lg"} fontWeight={500}>
              Daily Tasks
            </Text>
            {/* Toggle Color Mode */}
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <IoMoon /> : <LuSun size={20} />}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Container>
  )
}
