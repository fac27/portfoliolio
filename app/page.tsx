"use client";
import { useState } from "react";
import sanitise from "../utils/sanitise";

export default function Home() {
  const [inputContent, setInputContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setStream("");
    event.preventDefault();
    const time = 1000;

    const prompt = inputContent;

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

    if (sanitisedData === "not valid object") {
      setError("OpenAI returned invalid JSON \n Try re-sending request.");
      setTimeout(() => setError(""), time + 1500);

      return;
    }

    setStream("");
  };
  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center gap-4">
      <form onSubmit={onSubmit}>
        <h1>Tell us about your company:</h1>
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          className="text-black"
        />
        {error && <p>{error}</p>}
        <button className="bg-blue-500" type="submit">
          SUBMIT
        </button>
      </form>
      <div>{stream}</div>
    </div>
  );
}
