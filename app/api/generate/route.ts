import { openAINotStreamed } from "../../../utils/openAI";
import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/openAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const POST = async (req: Request): Promise<Response> => {
  const messages = await req.json();

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: interviewSystemContent },
      ...messages,
    ],
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
    stream: true,
    n: 1,
  };

  const response = await openAINotStreamed(payload);
  return new Response(JSON.stringify(response));
  /* const stream = await OpenAIStream(payload);
  return new Response(stream); */
};

const interviewSystemContent = `You are helping an apprentice write a portfolio for their training programme, ask them questions about their job and projects they've worked on. When you have a basic overview of both, say goodbye and call the endConversation function to end the conversation.`;

const skeletonsystemContent = `You are helping an apprentice write their portfolio, they will describe the place they work and you will return a JSON object with the structure of their portfolio. The apprentice will then fill in the details.

  Example input: 
  I'm an apprentice at a company called tldraw, they make an open source developer library that helps people make applications based around a collaborative whiteboard. They also make an online collaborative whiteboard of their own, which is free-to-use and has features allowing a user to log in and save projects.I've also been working on an internal tool called a dev dashboard that tracks our github repos as well as social media engagement.

  Example Output:
  {
  Introduction: {
    Overview: "",
    "Roles and Responsibilities": "",
  },
  "Open Source Library": {
    "Contributions to the Codebase": "",
    "Pull Requests and Code Reviews": "",
    "Documentation Contributions": "",
    "Community Engagement": "",
    "Testing and QA": "",
  },
  "tldraw.com": {
    "Front-End Components": "",
    "Back-End Features": "",
    Testing: "",
    Authentication: "",
    "Testing and Qa": "",
  },
  "Dev-Dashboard": {
    "Design Process": "",
    "Integration with Github API": "",
    "Analytics and data visualisation": "",
  },
  Conclusion: {
    "Key Skills and Takeaways": "",
    "Areas of Improvement": "",
  },
}`;
