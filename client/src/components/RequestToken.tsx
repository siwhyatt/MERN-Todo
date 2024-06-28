import { Button, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../App";

const RequestToken = () => {
  const [formData, setFormData] = useState({ email: "" });
  const navigate = useNavigate();
  const toast = useToast();

  const { mutate: requestToken, isPending } = useMutation({
    mutationKey: ["requestToken"],
    mutationFn: async () => {
      const res = await fetch(BASE_URL + `/reset-password/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Request successful.",
        description: "Please check your email inbox.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormData({ email: "" });
      navigate('/reset-password/email-sent');
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestToken();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <Button type="submit" isLoading={isPending} colorScheme="teal">
          Send Request
        </Button>
      </Stack>
    </form>
  );
};

export default RequestToken;


