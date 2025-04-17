import dotenv from "dotenv";
import { HuggingFaceInference } from "@langchain/community/llms/hf";

dotenv.config();

const llm = new HuggingFaceInference({
  model: "google/flan-t5-large",
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
});

const response = await llm.invoke("What is food");

console.log(response);
