import { useState, useEffect } from "react";
import { Stack, Button, useToast, Text, Box, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import TimeSelect from "./TimeSelect";
import PrioritySelect from "./PrioritySelect";
import { useSettingsQuery } from "../hooks/useSettings";

const UserSettings = ({ token }: { token: string }) => {
  const { data: settings, isLoading, error } = useSettingsQuery(token);
  const [defaultTime, setDefaultTime] = useState<string>("");
  const [defaultPriority, setDefaultPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const toast = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (settings) {
      setDefaultTime(settings.defaultTime ? settings.defaultTime.toString() : "15");
      setDefaultPriority(settings.defaultPriority as 'low' | 'medium' | 'high' || "medium");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!settings || !settings._id) {
        throw new Error("Settings not loaded");
      }
      const res = await fetch(BASE_URL + `/user-settings/${settings._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          defaultTime: parseInt(defaultTime),
          defaultPriority: defaultPriority,
        }),

      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Settings updated.",
        description: "Your settings have been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating settings.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const bg = useColorModeValue("gray.300", "gray.700");


  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Text color="red.500">Failed to load settings</Text>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Box bg={bg} p={4} my={3} borderWidth='1px' borderRadius='lg'>
          <Text align={'center'} mb={2}>
            Default todo time:
          </Text>
          <TimeSelect value={defaultTime} onChange={setDefaultTime} />
        </Box>
        <Box bg={bg} p={4} my={3} borderWidth='1px' borderRadius='lg'>
          <Text align={'center'} mb={2}>
            Default todo priority:
          </Text>
          <PrioritySelect value={defaultPriority} onChange={(value) => setDefaultPriority(value)} />
        </Box>
        <Button type="submit" isLoading={mutation.isPending} colorScheme="teal">
          Save Settings
        </Button>
      </Stack>
    </form>
  );
};

export default UserSettings;

