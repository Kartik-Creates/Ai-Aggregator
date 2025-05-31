"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Zap, Brain, Search, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AIResponse {
  provider: string
  response: string
  error?: string
  responseTime: number
  icon: React.ReactNode
  color: string
}

export default function AIAggregatorDashboard() {
  const [prompt, setPrompt] = useState("")
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [loading, setLoading] = useState(false)

  const providers = [
    { name: "ChatGPT", icon: <Zap className="w-4 h-4" />, color: "bg-green-500" },
    { name: "Claude", icon: <Brain className="w-4 h-4" />, color: "bg-orange-500" },
    { name: "Gemini", icon: <Sparkles className="w-4 h-4" />, color: "bg-blue-500" },
    { name: "Perplexity", icon: <Search className="w-4 h-4" />, color: "bg-purple-500" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setResponses([])

    try {
      const response = await fetch("/api/ai-aggregate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch responses")
      }

      const data = await response.json()

      // Add icons and colors to responses
      const enhancedResponses = data.responses.map((resp: any) => {
        const provider = providers.find((p) => p.name === resp.provider)
        return {
          ...resp,
          icon: provider?.icon,
          color: provider?.color,
        }
      })

      setResponses(enhancedResponses)
    } catch (error) {
      console.error("Error:", error)
      // Show error state for all providers
      const errorResponses = providers.map((provider) => ({
        provider: provider.name,
        response: "",
        error: "Failed to get response",
        responseTime: 0,
        icon: provider.icon,
        color: provider.color,
      }))
      setResponses(errorResponses)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Response Aggregator</h1>
          <p className="text-slate-600 text-lg">
            Compare responses from ChatGPT, Claude, Gemini, and Perplexity simultaneously
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Enter Your Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Ask anything... (e.g., 'Explain quantum computing in simple terms')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !prompt.trim()} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting responses from all providers...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Compare AI Responses
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {providers.map((provider) => (
              <Card key={provider.name} className="h-[400px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                    {provider.icon}
                    {provider.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-500">Generating response...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {responses.length > 0 && !loading && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">AI Responses Comparison</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {responses.map((response, index) => (
                <Card key={index} className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${response.color}`} />
                        {response.icon}
                        {response.provider}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {response.responseTime}ms
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {response.error ? (
                      <Alert variant="destructive">
                        <AlertDescription>{response.error}</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{response.response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {responses.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to compare AI responses</h3>
            <p className="text-slate-500">Enter a prompt above to see how different AI models respond</p>
          </div>
        )}
      </div>
    </div>
  )
}
