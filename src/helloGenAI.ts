import dotenv from "dotenv";
import { OpenAI } from "@langchain/openai";

dotenv.config();

const llm = new OpenAI();

const response = await llm.invoke(
  "Describe the importance of learning generative AI for javascript developers in 50 words."
);

console.log(response);
