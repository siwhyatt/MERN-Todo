import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../App";

export type Settings = {
  _id?: string;
  userId: string;
  defaultTime: number;
  defaultPriority: string;
}

export const useSettingsQuery = (token: string) => {
  return useQuery<Settings, Error>({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });
};
