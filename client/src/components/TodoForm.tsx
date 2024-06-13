import { Button, Flex, Input, Spinner, RadioGroup, Radio, Stack, useToast, TabList, Tab, TabPanels, TabPanel, Tabs } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";

interface TodoFormProps {
  token: string;
}

const TodoForm = ({ token }: TodoFormProps) => {
  const [newTodo, setNewTodo] = useState("");
  const [newTime, setNewTime] = useState("15");
  const [newPriority, setNewPriority] = useState("medium");
  const queryClient = useQueryClient();
  const toast = useToast();

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationKey: ['createTodo'],
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const res = await fetch(BASE_URL + `/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTodo,
            time: parseInt(newTime),
            priority: newPriority,
          }),
        })
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setNewTodo("");
        return data;

      } catch (error: any) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({
        title: "Todo added successfuly.",
        description: "You have one more thing to do!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    },
    onError: (error: any) => {
      alert(error.message);
    }
  })
  return (
    <form onSubmit={createTodo}>
      <Flex my="1rem" gap={2}>
        <Input
          type='text'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          ref={(input) => input && input.focus()}
        />
        <Button
          mx={2}
          type='submit'
          _active={{
            transform: "scale(.97)",
          }}
        >
          {isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
        </Button>
      </Flex>
      <Tabs variant='soft-rounded' colorScheme='blue'>
        <TabList>
          <Tab>Time</Tab>
          <Tab>Priority</Tab>
          <Tab>Project</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <RadioGroup
              value={newTime}
              onChange={setNewTime}
            >
              <Stack spacing={5} direction={'row'}>
                <Radio value="15">15m</Radio>
                <Radio value="30">30m</Radio>
                <Radio value="60">1h</Radio>
                <Radio value="120">2h</Radio>
              </Stack>
            </RadioGroup>
          </TabPanel>
          <TabPanel>
            <RadioGroup
              value={newPriority}
              onChange={setNewPriority}
            >
              <Stack spacing={5} direction="row">
                <Radio size='lg' value="low" colorScheme='blue'>Low</Radio>
                <Radio size='lg' value="medium" colorScheme='green'>Med</Radio>
                <Radio size='lg' value="high" colorScheme='red'>High</Radio>
              </Stack>
            </RadioGroup>
          </TabPanel>
          <TabPanel>
            <p>To do</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </form>
  );
};
export default TodoForm;
