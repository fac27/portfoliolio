"use client";
import { useState } from "react";
import sanitise from "../utils/sanitise";
import { ChatGPTMessage } from "../utils/openAIStream";

export default function Home() {
  const [messages, setMessages] = useState<ChatGPTMessage[]>([]);
  const [inputContent, setInputContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setStream("");
    event.preventDefault();
    const time = 1000;

    const prompt = inputContent;
    setMessages((messages) => [
      ...messages,
      { role: "user", content: inputContent },
    ]);
    setInputContent("");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (response.status === 400) {
      setError(response.statusText);
      setTimeout(() => setError(""), time);
      return;
    }

    if (response.status === 404) {
      setError("404 Not Found");
      setTimeout(() => setError(""), time);
      return;
    }
    if (response.status === 500) {
      setError("API Key Depracated, contact developers.");
      setTimeout(() => setError(""), time);
      return;
    }
    if (response.status !== 200) {
      const data = await response.json();
      setError(data.statusText);
      setTimeout(() => setError(""), time);
    }

    const data = response.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    const streamedData: string[] = [];

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setStream((prev) => prev + chunkValue);
      streamedData.push(chunkValue);
    }

    const finalData = streamedData.join("");

    const sanitisedData = sanitise(finalData);
    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: `${JSON.stringify(sanitisedData)}` },
    ]);

    if (sanitisedData === "not valid object") {
      setError("OpenAI returned invalid JSON \n Try re-sending request.");
      setTimeout(() => setError(""), time + 1500);
      setStream("");
      return;
    }

    setStream("");
  };
  return (
    <div className="flex flex-col h-screen w-screen items-center justify-between gap-4">
      <h1 className="p-10">Tell us about your company:</h1>
      <form
        className="flex w-full p-10 gap-2 flex-col items-center justify-center"
        onSubmit={onSubmit}
      >
        {messages.map((message, index) =>
          message.role === "user" ? (
            <UserMessage key={index} content={message.content} />
          ) : (
            <AssistantMessage key={index} content={message.content} />
          )
        )}
        <div>
          <p className="text-green-200 font-mono">{stream}</p>
        </div>
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          className="text-black text-lg w-full h-fit min-h-[150px] bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        />
        {error && <p>{error}</p>}
        <button className="bg-blue-500 p-2 rounded-lg" type="submit">
          SUBMIT
        </button>
      </form>
    </div>
  );
}

const UserMessage = ({ content }: { content: string }) => (
  <div className="p-4 rounded-xl border shadow-sm border-gray-800 bg-slate-600 self-end">
    <p className="text-white">{content}</p>
  </div>
);

const AssistantMessage = ({ content }: { content: string }) => (
  <div className="p-4 rounded-xl border shadow-sm border-gray bg-slate-900 self-baseline">
    <p className="text-green-400 font-mono">{content}</p>
  </div>
);
