import { useState, useEffect } from "react";
import { Stack, Button, RadioGroup, Radio, useToast } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import { ObjectId } from 'mongodb';

interface UserSettingsData {
  _id?: ObjectId;
  userId: ObjectId;
  defaultTime: number;
  defaultPriority: string;
}

const UserSettings = ({ token }: { token: string }) => {
  const [defaultTime, setDefaultTime] = useState<string>("");
  const [defaultPriority, setDefaultPriority] = useState<string>("");
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoading } = useQuery<UserSettingsData>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const res = await fetch(BASE_URL + "/user-settings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
  });

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
    onError: (error: any) => {
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
        <RadioGroup
          value={defaultTime}
          onChange={setDefaultTime}
        >
          <Stack spacing={5} direction="row">
            <Radio value="15">15m</Radio>
            <Radio value="30">30m</Radio>
            <Radio value="60">1h</Radio>
            <Radio value="120">2h</Radio>
          </Stack>
        </RadioGroup>
        <RadioGroup
          value={defaultPriority}
          onChange={setDefaultPriority}
        >
          <Stack spacing={5} direction="row">
            <Radio size='lg' value="low" colorScheme='blue'>Low</Radio>
            <Radio size='lg' value="medium" colorScheme='green'>Med</Radio>
            <Radio size='lg' value="high" colorScheme='red'>High</Radio>
          </Stack>
        </RadioGroup>
        <Button type="submit" isLoading={isLoading} colorScheme="teal">
          Save Settings
        </Button>
      </Stack>
    </form>
  );
};

export default UserSettings;

