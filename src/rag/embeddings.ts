import { HfInference } from "@huggingface/inference";

const hf = new HfInference("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");

async function getEmbeddings() {
  const response = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: "What is vector embedding?",
  });

  console.log(response);
  console.log(response.length);
}

getEmbeddings();
