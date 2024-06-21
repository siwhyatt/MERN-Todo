import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../App";

export type Project = {
  _id: string;
  userId: string;
  name: string;
  description?: string | null;
};

export const useProjectsQuery = (token: string) => {
  return useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const res = await fetch(BASE_URL + "/projects", {
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
        return data || [];
      } catch (error) {
        console.log(error);
      }
    },
  });
};

