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

    const thread = await openai.beta.threads.create();

    const responseData = JSON.stringify({
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
