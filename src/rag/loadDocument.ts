import { Document } from "langchain/document";
import { crawlLangchainDocsUrls } from "./crawlDocuments";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import cliProgress from "cli-progress";

const progressBar = new cliProgress.SingleBar({});
export const loadDocuments = async (): Promise<Document[]> => {
  const langchainDocUrls = await crawlLangchainDocsUrls();

  console.log(
    `Starting document download. ${langchainDocUrls.length} total documents`
  );
  progressBar.start(langchainDocUrls.length, 0);

  const rawDocuments: Document[] = []; // Initialize the array
  for (const url of langchainDocUrls) {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    rawDocuments.push(...docs);
    progressBar.increment();
  }

  progressBar.stop();
  console.log(`${rawDocuments.length} documents loaded`);
  return rawDocuments;
};

// const rawDocuments = await loadDocuments();

// console.log(rawDocuments.slice(0, 4));
