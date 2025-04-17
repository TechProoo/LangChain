import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import dotenv from "dotenv";
import { CohereEmbeddings } from "@langchain/cohere";

dotenv.config();

export async function createRetriever(): Promise<VectorStoreRetriever> {
  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-v4.0",
  });

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index("langchain-dd");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });

  const retriever = vectorStore.asRetriever();

  return retriever;
}

// test code

// const retrieverChain = await createRetriever();

// const context = await retrieverChain.invoke("What is langchain?");

// console.log(context);
