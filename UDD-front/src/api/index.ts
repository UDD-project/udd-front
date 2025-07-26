import axios from "./axios";
import type { ParsedDocument } from "../types/ParsedDocument";

export const indexParsedDocument = async (document: ParsedDocument) => {
  const response = await axios.post("/index", document);
  return response.data;
};
