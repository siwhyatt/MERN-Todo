import { useState, useEffect } from "react";
import { Stack, Button, useToast, Text, Box, Spinner } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import TimeSelect from "./TimeSelect";
import PrioritySelect from "./PrioritySelect";
import { useSettingsQuery } from "../hooks/useSettings";


const UserSettings = ({ token }: { token: string }) => {
  const [defaultTime, setDefaultTime] = useState<string>("");
  const [defaultPriority, setDefaultPriority] = useState<string>("");
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useSettingsQuery(token);

  useEffect(() => {
    if (settings) {
      console.log(settings)
      setDefaultTime(settings[0].defaultTime?.toString() || "15");
      setDefaultPriority(settings[0].defaultPriority || "medium");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!settings || !settings[0]._id) {
        throw new Error("Settings not loaded");
      }
      const res = await fetch(BASE_URL + `/user-settings/${settings[0]._id}`, {
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

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Box p={4} my={3} borderWidth='1px' borderRadius='lg'>
          <Text mb={1}>
            Default todo time:
          </Text>
          <TimeSelect value={defaultTime} onChange={setDefaultTime} />
        </Box>
        <Box p={4} my={3} borderWidth='1px' borderRadius='lg'>
          <Text mb={1}>
            Default todo priority:
          </Text>
          <PrioritySelect value={defaultPriority} onChange={setDefaultPriority} />
        </Box>
        <Button type="submit" isLoading={mutation.isPending} colorScheme="teal">
          Save Settings
        </Button>
      </Stack>
    </form>
  );
};

export default UserSettings;

