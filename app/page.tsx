"use client";
import { useState } from "react";
import sanitise from "../utils/sanitise";
import { ChatGPTMessage } from "../utils/openAIStream";

export default function Home() {
  const [messages, setMessages] = useState<ChatGPTMessage[]>([
    {
      role: "assistant",
      content:
        "Hello, so I hear you're working on a software development apprenticeship, tell me a bit about the company you work for.",
    },
  ]);
  const [inputContent, setInputContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setStream("");
    event.preventDefault();
    const time = 1000;

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
      body: JSON.stringify(messages),
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
    const data = await response.json();
    console.log(data);

    /* const streamedData: string[] = [];

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setStream((prev) => prev + chunkValue);
      streamedData.push(chunkValue);
    }

    const finalData = streamedData.join(""); */

    //const sanitisedData = sanitise(finalData);
    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: data.content },
    ]);

    setStream("");
  };

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-between gap-4 p-3">
      <div className="flex flex-col items-start gap-4 overflow-scroll">
        <h1 className="p-10 text-xl self-center">
          Let&apos;s get some info for your Skeleton
        </h1>
        {messages.map((message, index) =>
          message.role === "user" ? (
            <UserMessage key={index} content={message.content} />
          ) : (
            <AssistantMessage key={index} content={message.content} />
          )
        )}
      </div>
      <form
        className="flex flex-col w-full p-10 gap-4 items-center justify-center"
        onSubmit={onSubmit}
      >
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          className="text-gray-50 text-lg w-full h-fit min-h-[150px] bg-gray-500 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        />
        {error && <p>{error}</p>}
        <button className="bg-blue-900 p-2 rounded-lg self-end" type="submit">
          SUBMIT
        </button>
      </form>
    </div>
  );
}

const UserMessage = ({ content }: { content: string }) => (
  <div className="p-4 rounded-xl border shadow-sm border-gray-800 bg-slate-600 self-end max-w-[75%]">
    <p className="text-white">{content}</p>
  </div>
);

const AssistantMessage = ({ content }: { content: string }) => (
  <div className="p-4 rounded-xl border shadow-sm border-gray bg-slate-900 self-baseline max-w-[75%]">
    <p className="text-green-400 font-mono">{content}</p>
  </div>
);
