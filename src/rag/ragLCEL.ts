import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatHandler, chat } from "../utils/chat";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "human",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
  Context: {context} 
  `,
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});
const outputParser = new StringOutputParser();

const retriever = await createRetriever();

const retrievalChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  formatDocumentsAsString,
]);

const generationChain = RunnableSequence.from([
  {
    question: (input) => input.question,
    context: retrievalChain,
    chat_history: (input) => input.chat_history,
  },
  prompt,
  llm,
  outputParser,
]);

const qcSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`;

const qcPrompt = ChatPromptTemplate.fromMessages([
  ["system", qcSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const qcChain = RunnableSequence.from([qcPrompt, llm, outputParser]);

const chatHistory: BaseMessage[] = [];

const isLikelyQuestion = (text: string): boolean => {
  const questionWords = [
    "what",
    "why",
    "how",
    "when",
    "who",
    "where",
    "which",
    "can",
    "is",
    "are",
    "do",
    "does",
    "should",
  ];
  return (
    text.trim().endsWith("?") ||
    questionWords.some((word) => text.toLowerCase().startsWith(word))
  );
};

const chatHandler: ChatHandler = async (question: string) => {
  let contextualizedQuestion = null;

  if (chatHistory.length > 0 && isLikelyQuestion(question)) {
    try {
      contextualizedQuestion = await qcChain.invoke({
        question,
        chat_history: chatHistory,
      });
      console.log(`Contextualized Question: ${contextualizedQuestion}`);
    } catch (err) {
      console.error("QC Chain error:", err);
    }
  }

  return {
    answer: generationChain.stream({
      question: contextualizedQuestion || question,
      chat_history: chatHistory,
    }),
    answerCallBack: async (answerText: string) => {
      chatHistory.push(new HumanMessage(contextualizedQuestion || question));
      chatHistory.push(new AIMessage(answerText));
    },
  };
};

chat(chatHandler);
