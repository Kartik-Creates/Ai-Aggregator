import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"

// Create Perplexity client using OpenAI-compatible API
const perplexity = createOpenAI({
  name: "perplexity",
  apiKey: process.env.PERPLEXITY_API_KEY || "demo-key",
  baseURL: "https://api.perplexity.ai/",
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Define AI providers with their configurations
    const providers = [
      {
        name: "ChatGPT",
        model: openai("gpt-4o-mini"),
        apiKey: process.env.OPENAI_API_KEY,
      },
      {
        name: "Claude",
        model: anthropic("claude-3-haiku-20240307"),
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      {
        name: "Gemini",
        model: google("gemini-1.5-flash"),
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      },
      {
        name: "Perplexity",
        model: perplexity("llama-3.1-sonar-small-32k-online"),
        apiKey: process.env.PERPLEXITY_API_KEY,
      },
    ]

    // Function to get response from a single provider
    const getProviderResponse = async (provider: any) => {
      const startTime = Date.now()

      try {
        // For demo purposes, if no API key is provided, return a mock response
        if (!provider.apiKey || provider.apiKey === "demo-key") {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

          const mockResponses = {
            ChatGPT: `This is a demo response from ChatGPT. In a real implementation, this would be the actual response from OpenAI's GPT model. The response would be contextual and relevant to your prompt: "${prompt}". 

ChatGPT typically provides detailed, conversational responses with good reasoning capabilities.`,

            Claude: `This is a demo response from Claude (Anthropic). Claude is known for being helpful, harmless, and honest. For your prompt "${prompt}", Claude would provide a thoughtful and well-structured response.

Claude often excels at analysis, writing, and following complex instructions with high accuracy.`,

            Gemini: `This is a demo response from Google's Gemini. Gemini is Google's advanced AI model that can handle multimodal inputs. For "${prompt}", Gemini would leverage its training to provide comprehensive insights.

Gemini is particularly strong at reasoning, coding, and creative tasks.`,

            Perplexity: `This is a demo response from Perplexity AI. Perplexity specializes in search-grounded responses with citations. For your query "${prompt}", Perplexity would provide up-to-date information with source references.

Perplexity excels at providing current information and factual accuracy with proper citations.`,
          }

          return {
            provider: provider.name,
            response:
              mockResponses[provider.name as keyof typeof mockResponses] || `Demo response from ${provider.name}`,
            responseTime: Date.now() - startTime,
          }
        }

        const { text } = await generateText({
          model: provider.model,
          prompt: prompt,
          maxTokens: 500, // Limit response length for better comparison
        })

        return {
          provider: provider.name,
          response: text,
          responseTime: Date.now() - startTime,
        }
      } catch (error) {
        console.error(`Error with ${provider.name}:`, error)
        return {
          provider: provider.name,
          response: "",
          error: `Failed to get response from ${provider.name}`,
          responseTime: Date.now() - startTime,
        }
      }
    }

    // Get responses from all providers simultaneously
    const responses = await Promise.all(providers.map((provider) => getProviderResponse(provider)))

    return NextResponse.json({
      success: true,
      responses: responses,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
