import { Button, Input, Stack, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../App";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}
const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: "", resetToken: "" });
  const query = useQuery();
  const { resetToken } = query.get("resetToken");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (resetToken) {
      setFormData((prevFormData) => ({ ...prevFormData, resetToken }));
    }
  }, [resetToken]);

  const { mutate: resetPassword, isPending } = useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: async () => {
      const res = await fetch(BASE_URL + `/reset-password/reset`, {
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
        title: "Password reset successful.",
        description: "You may now login with your new password.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormData({ email: "" });
      navigate('/login');
    },
    onError: (error: any) => {
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
    resetPassword();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter new password"
          required
        />
        <Button type="submit" isLoading={isPending} colorScheme="teal">
          Send Request
        </Button>
      </Stack>
    </form>
  );
};

export default ResetPassword;



