import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
// import { LLMChain } from "langchain/chains";
import { Runnable, RunnableSequence } from "@langchain/core/runnables";

dotenv.config();

await personalisedPitch("Generative AI", "Javascript Developer", 20);

async function personalisedPitch(
  course: string,
  role: string,
  wordLimit: number
) {
  const promptTemplate = new PromptTemplate({
    template:
      "Describe the importance of learning {course} for a {role}. Limit the output to {wordLimit} words",
    inputVariables: ["course", "role", "wordLimit"],
  });

  const formattedPrompt = await promptTemplate.format({
    course,
    role,
    wordLimit,
  });

  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    // temperature: 0
    topP: 0,
  });

  const outputParser = new StringOutputParser();

  // Option 1 - LangChain legacy chain
  //   const legecyLlmChain = new LLMChain({
  //     prompt: promptTemplate,
  //     llm,
  //     outputParser,
  //   });

  //   const answer = await legecyLlmChain.invoke({
  //     course,
  //     role,
  //     wordLimit,
  //   });

  //   console.log("Answer from legacy LLM:", answer);

  //   option 2 - LCEL chain
  //   const lcelChain = promptTemplate.pipe(llm).pipe(outputParser);

  const lcelChain = RunnableSequence.from([promptTemplate, llm, outputParser]);
  const lcelResponse = await lcelChain.invoke({
    course,
    role,
    wordLimit,
  });

  console.log("Answer from LCEL chain:", lcelResponse);
}
