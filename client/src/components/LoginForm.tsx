import { Button, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../App";

const LoginForm = ({ setToken }: { setToken: (token: string) => void }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const toast = useToast();

  const { mutate: loginUser, isPending } = useMutation({
    mutationKey: ["loginUser"],
    mutationFn: async () => {
      const res = await fetch(BASE_URL + `/auth/login`, {
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
    onSuccess: (data) => {
      toast({
        title: "Login successful.",
        description: "You have successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setToken(data.token);
      setFormData({ email: "", password: "" });
      localStorage.setItem('token', data.token);
      navigate('/todos');
    },
    onError: (error: any) => {
      toast({
        title: "Login failed.",
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
    loginUser();
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
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <Button type="submit" isLoading={isPending} colorScheme="teal">
          Login
        </Button>
      </Stack>
    </form>
  );
};

export default LoginForm;

