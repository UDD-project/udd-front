import axios from "./axios";
import type { SearchResultDTO } from "../types/SearchResult";

export const fetchAllIncidents = async (): Promise<SearchResultDTO[]> => {
  const response = await axios.get<SearchResultDTO[]>("/search/all");
  return response.data;
};

export const searchIncidents = async (
  params: Record<string, string | boolean>
) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== false) {
      queryParams.append(key, String(value));
    }
  });

  const response = await axios.get(`/search?${queryParams.toString()}`);
  return response.data;
};

export const searchIncidentsBool = async (expression: string[]) => {
  const response = await axios.post("/search/bool", {
    expression,
  });
  return response.data;
};
