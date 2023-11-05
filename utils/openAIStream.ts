import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

import { ChatCompletionCreateParams } from "openai/resources/index.mjs";

// This file came from a guide on how to stream responses, it doesn't use the openai library
// We should move away from this and use the openai library instead, because we can get help from
// typescript with newer features like function calls. Right now I've installed the openai library
// just to get access to the Function interface.

export type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}
export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  functions?: ChatCompletionCreateParams.Function[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export const OpenAIStream = async (payload: OpenAIStreamPayload) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;
  const myFunction: ChatCompletionCreateParams.Function = {
    name: "endConversation",
    description:
      "a function to call when you have enough information from the user",
    //When a function doesn't take parameters you can submit an onbject like this
    parameters: { type: "object", properties: {} },
  };
  payload.functions = [myFunction];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      };
      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
};
