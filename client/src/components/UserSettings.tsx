import { useState, useEffect } from "react";
import { Stack, Button, useToast } from "@chakra-ui/react";
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
      setDefaultTime(settings[0].defaultTime?.toString() || "15");
      setDefaultPriority(settings[0].defaultPriority || "medium");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(BASE_URL + `/user-settings/${settings[0]?._id}`, {
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
    onError: (error) => {
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

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TimeSelect value={defaultTime} onChange={setDefaultTime} />
        <PrioritySelect value={defaultPriority} onChange={setDefaultPriority} />
        <Button type="submit" isLoading={isLoading} colorScheme="teal">
          Save Settings
        </Button>
      </Stack>
    </form>
  );
};

export default UserSettings;

