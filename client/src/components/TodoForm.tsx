import { Flex, Input, Spinner, useToast, TabList, Tab, TabPanels, TabPanel, Tabs, Text, Box, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect, RefObject, Dispatch, SetStateAction } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";
import ProjectSelector from "./ProjectSelector";
import TimeSelect from "./TimeSelect";
import PrioritySelect from "./PrioritySelect";
import { useSettingsQuery } from "../hooks/useSettings";

interface TodoFormProps {
  token: string;
  focusAddInput: boolean;
  setFocusAddInput: Dispatch<SetStateAction<boolean>>;
}

const TodoForm = ({ token, focusAddInput, setFocusAddInput }: TodoFormProps) => {
  const { data: settings, isLoading, error } = useSettingsQuery(token);
  const [newTodo, setNewTodo] = useState("");
  const [newTime, setNewTime] = useState<string | undefined>(undefined);
  const [newPriority, setNewPriority] = useState<string | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    if (focusAddInput && inputRef.current) {
      inputRef.current.focus();
      setFocusAddInput(false);
    }
  }, [focusAddInput, setFocusAddInput]);

  useEffect(() => {
    if (settings) {
      setNewTime(settings[0].defaultTime ? settings[0].defaultTime.toString() : "15");
      setNewPriority(settings[0].defaultPriority || "medium");
    }
  }, [settings]);

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationKey: ['createTodo'],
    mutationFn: async () => {
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
            projectId: selectedProjectId,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
      setIsCreated(true);
      toast({
        title: "Todo added successfully.",
        description: "You have one more thing to do!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      alert(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTodo();
  };

  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Focus on initial mount
    focusInput();

    // Focus after successful todo creation
    if (isCreated) {
      focusInput();
      setIsCreated(false);
    }
  }, [isCreated]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text color="red.500">Failed to load settings</Text>
      </Flex>
    );
  }

  if (!settings) {
    return null;
  }
  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit(e);
        }
      }}
    >
      <Box my="1rem" gap={2}>
        <InputGroup
        >
          <Input
            type='text'
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            ref={inputRef}
            autoFocus
          />
          <InputRightElement>
            <Box onClick={handleSubmit} cursor="pointer">
              {isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
            </Box>
          </InputRightElement>
        </InputGroup>
      </Box>
      <Tabs align='center' variant='soft-rounded' colorScheme='teal'>
        <TabList>
          <Tab>Time</Tab>
          <Tab>Priority</Tab>
          <Tab>Project</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TimeSelect value={newTime} onChange={setNewTime} />
          </TabPanel>
          <TabPanel>
            <PrioritySelect value={newPriority} onChange={setNewPriority} />
          </TabPanel>
          <TabPanel>
            <ProjectSelector
              token={token}
              onProjectSelect={setSelectedProjectId}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </form>
  );
};

export default TodoForm;

