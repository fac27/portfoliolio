"use client";
import { useState, useEffect } from "react";

const assistantArray = [
  { name: "skeleton", id: "asst_3aXwBiUZFqzcoSLUdGeFLGiG" },
];

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, so I hear you're working on a software development apprenticeship, tell me a bit about the company you work for.",
    },
  ]);
  const [inputContent, setInputContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  //initialise assistant to skeleton assistant, later we will want to change this so we'll keep it in state
  const [assistantId, setAssistantId] = useState<string | null>(
    assistantArray[0].id
  );
  const [threadId, setThreadId] = useState(null);

  useEffect(() => {
    const createThread = async () => {
      const response = await fetch("/api/create-thread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setThreadId(data.threadId);
    };

    createThread();
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!assistantId) {
      setError("Assistant is not initialised.");
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: inputContent },
    ]);

    try {
      const userMessage = inputContent;
      setInputContent("");

      const response = await fetch("/api/submit-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId,
          threadId,
          message: { role: "user", content: userMessage },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      setMessages((currentMessages) => [
        ...currentMessages,
        responseData.messages[0],
      ]);
    } catch (error) {
      console.error("There was an error submitting the message: ", error);
      setError("There was an error handling your request.");

      setTimeout(() => setError(null), 5000);
    }
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
