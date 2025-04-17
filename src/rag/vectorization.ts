import dotenv from "dotenv";
import { loadDocuments } from "./loadDocument";
import { splitDocuments } from "./splitDocument";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { HfInference } from "@huggingface/inference";
import { CohereEmbeddings } from "@langchain/cohere";
import cliProgress from "cli-progress";

dotenv.config();

const rawDocuments = await loadDocuments();
const chunkedDocuments = await splitDocuments(rawDocuments);

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-v4.0",
});

const pinecone = new Pinecone();
const pineconeIndex = pinecone.index("langchain-dd");

console.log("Starting Vecrotization...");
const progressBar = new cliProgress.SingleBar({});
progressBar.start(chunkedDocuments.length, 0);

for (let i = 0; i < chunkedDocuments.length; i = i + 100) {
  const batch = chunkedDocuments.slice(i, i + 100);
  await PineconeStore.fromDocuments(batch, embeddings, {
    pineconeIndex,
  });

  progressBar.increment(batch.length);
}

progressBar.stop();
console.log("Chunked documents stored in pinecone.");
