import axios from "./axios";
import type { ParsedDocument } from "../types/ParsedDocument";

export const uploadFile = async (file: File): Promise<ParsedDocument> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<ParsedDocument>("/parse", formData);

  return response.data;
};
