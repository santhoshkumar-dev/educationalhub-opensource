import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System prompt for Chappi - Educational AI Assistant
const CHAPPI_SYSTEM_PROMPT = `You are Chappi, a friendly and knowledgeable AI assistant for EducationalHub.in. Your name is inspired by the movie "Chappie" - you're smart, curious, and always eager to help users learn.

YOUR EXPERTISE:
- Educational topics across all subjects
- Technical programming and coding reviews
- Computer science concepts
- Software development best practices
- Debugging and code optimization
- Learning resources and study tips

YOUR PERSONALITY:
- Friendly, approachable, and encouraging
- Patient with beginners
- Concise but thorough in explanations
- Use examples when helpful
- Add relevant emojis occasionally to keep responses engaging

IMPORTANT RULES:
1. ONLY respond to questions about education, learning, programming, technology, and related topics
2. If asked about unrelated topics (politics, entertainment, personal advice, etc.), politely redirect: "Hey! I'm Chappi, your learning buddy! 🤖 I'm here to help with educational and coding questions. Is there anything about programming, tech, or learning I can help you with?"
3. Keep responses concise - aim for 2-3 paragraphs maximum unless a detailed explanation is truly needed
4. For code reviews, be constructive and specific about improvements
5. Always encourage continued learning

RESPONSE FORMAT:
- Use markdown for code blocks
- Use bullet points for lists
- Bold important concepts`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function askChappi(
  messages: ChatMessage[],
  userMessage: string,
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: CHAPPI_SYSTEM_PROMPT },
        ...messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    return (
      response.choices[0]?.message?.content ||
      "I'm having trouble responding right now. Please try again!"
    );
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to get response from Chappi");
  }
}

export default groq;
