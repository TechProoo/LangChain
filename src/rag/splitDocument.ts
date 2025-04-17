import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadDocuments } from "../../completed/rag/loadDocuments";

export async function splitDocuments(
  rawDocuments: Document[]
): Promise<Document[]> {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const documentChunks = await splitter.splitDocuments(rawDocuments);

  console.log(
    `${rawDocuments.length} documents split into ${documentChunks.length} chunks.`
  );

  return documentChunks;
}

// const rawDocuments = await loadDocuments();

// await splitDocuments(rawDocuments);
