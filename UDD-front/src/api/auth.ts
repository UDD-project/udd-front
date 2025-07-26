import axios from "./axios";
import type { User } from "../types/User";

export const login = async (user: User): Promise<string> => {
  const response = await axios.post<string>("/auth/signin", user);
  return response.data;
};

export const register = async (user: User): Promise<string> => {
  const response = await axios.post<string>("/auth/signup", user);
  return response.data;
};
