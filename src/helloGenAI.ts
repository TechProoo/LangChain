import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";

dotenv.config();


const llm = new ChatGroq ({
  model: "llama-3.3-70b-versatile",
})

const response = await llm.invoke(
 "Describe the importance of learning generative AI for javascript developers in 50 words"

)

console.log(response)