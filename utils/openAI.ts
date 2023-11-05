import OpenAI from "openai";

import { OpenAIStreamPayload } from "./openAIStream";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

export const openAINotStreamed = async (
  payload: OpenAIStreamPayload
): Promise<ChatCompletionMessage> => {
  const functions = [
    {
      name: "endConversation",
      description:
        "a function to call when you have enough information from the user",
      parameters: { type: "object", properties: {} },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: payload.messages,
    functions: functions,
    function_call: "auto", // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;
  // Step 2: check if GPT wanted to call a function

  if (responseMessage.function_call) {
    console.log("GPT wants to call a function");
  }
  return responseMessage;
};
