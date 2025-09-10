const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

// Accept either a string or an array of {role, content} messages.
async function generateContent(content) {
  // Normalize incoming content to a single text blob the SDK expects.
  let textPayload;

  if (Array.isArray(content)) {
    // If array of messages, join them with role prefix so the model sees the conversation.
    textPayload = content
      .map((m) => {
        if (typeof m === "string") return m;
        const role = m.role || "user";
        const body = m.content || m.text || "";
        return `${role}: ${body}`;
      })
      .join("\n");
  } else if (typeof content === "object" && content !== null && content.content) {
    // single object with content field
    textPayload = content.content;
  } else {
    // assume plain string
    textPayload = String(content || "");
  }

  const response = await ai.models.generateContent({
    model: "models/gemini-2.0-flash",
    // SDK expects contents: [{ parts: [{ text: "..." }] }]
    contents: [{ parts: [{ text: textPayload }] }],
    config: {
      systemInstruction: "answer the question asked by user in less words but give the full overview",
    },
  });

  // Be defensive when extracting text from SDK response.
  const textFromOutput =
    response?.output?.[0]?.content
      ?.map((c) => c?.text)
      .filter(Boolean)
      .join("\n") || response?.text || "";

  return textFromOutput;
}

// from Gemini docx(embeddings)
async function generateVector(content){
  const response = await ai.models.embedContent({
    model: "models/embedding-001",   // full model name
    contents: [{ parts: [{ text: content }] }],
    config: {
      outputDimensionality: 768,  // optional
    },
  });

  // Return the actual vector
  return response.embeddings[0].values;
}

module.exports = {generateContent,generateVector}
