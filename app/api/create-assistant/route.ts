import OpenAI from "openai";
import fs from "fs";

export const POST = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    const responseData = JSON.stringify({ error: "Method not allowed" });
    return new Response(responseData, {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const openai = new OpenAI();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing env var from OpenAI");
    }

    // File and assistant setup only needs to run once, then comment out and get assistant id from Open AI account
    // We can share an assistant once we are on the same Open AI API key

    const file = await openai.files.create({
      file: fs.createReadStream("data/SDL4.pdf"),
      purpose: "assistants",
    });

    const assistant = await openai.beta.assistants.create({
      instructions: `You are helping a software developer apprentice write a portfolio for their training programme, ask them questions about their job and projects they've worked on. Don't go into too much detail, you only need a basic overview of these. When you have a basic overview of their job and their work projects, say goodbye and end the conversation. Do not mention the file uploaded unless asked, or read it unless you need to - it provides a detailed description of the assessment criteria for the apprenticeship.`,
      name: "KSB Assistant",
      model: "gpt-4-1106-preview",
      tools: [{ type: "retrieval" }],
      file_ids: [file.id],
    });

    const thread = await openai.beta.threads.create();

    const responseData = JSON.stringify({
      // Replace assistant.id with assistant id after first run
      assistantId: assistant.id,
      threadId: thread.id,
    });

    return new Response(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const responseData = JSON.stringify({ error: "Server error" });

    return new Response(responseData, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
