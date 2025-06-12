"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen, GraduationCap, MessageSquare, Zap } from "lucide-react"

const branches = [
  { id: "cse", name: "Computer Science Engineering (CSE)", icon: "💻", description: "Core CS concepts & programming" },
  {
    id: "ai-ds",
    name: "Artificial Intelligence & Data Science (AI-DS)",
    icon: "🤖",
    description: "AI, ML & Data Analytics",
  },
  {
    id: "ai-ml",
    name: "Artificial Intelligence & Machine Learning (AI-ML)",
    icon: "🧠",
    description: "Advanced AI & ML techniques",
  },
]

export default function HomePage() {
  const [selectedBranch, setSelectedBranch] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleContinue = () => {
    if (selectedBranch) {
      localStorage.setItem("selectedBranch", selectedBranch)
      router.push("/semester")
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/30 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <BookOpen className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              EduVision
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full text-sm">
              Welcome, {user.email.split("@")[0]}
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Core Concept Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-green-900/30 border-gray-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl flex items-center justify-center space-x-3 mb-4">
                <div className="relative">
                  <Brain className="h-10 w-10 text-blue-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  EduVision - Intelligent Academic Assistant
                </span>
              </CardTitle>
              <CardDescription className="text-gray-200 text-xl font-medium">
                Built for MJ College Engineering Students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <p className="text-gray-200 text-center leading-relaxed text-lg">
                EduVision is an intelligent academic assistant for engineering students. Select your branch and
                semester, choose a subject, and chat with an AI trained on your textbooks.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-400 flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>Ask Questions Like:</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 p-4 rounded-xl border-l-4 border-blue-500 backdrop-blur">
                      <p className="text-gray-200">"Summarize the 56th page from the book 'XYZ' by author 'ABC'"</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl border-l-4 border-green-500 backdrop-blur">
                      <p className="text-gray-200">"Explain the concept of 'xyz' from the book 'abc'"</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-400 flex items-center space-x-2">
                    <Zap className="h-6 w-6" />
                    <span>Powered by RAG Technology</span>
                  </h3>
                  <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur">
                    <p className="text-gray-200">
                      The system uses a RAG (Retrieval-Augmented Generation) approach powered by static PDFs available
                      per subject and author.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Branch Selection */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-white">Select Your Branch</span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Choose your engineering branch to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all duration-300 border-2 transform hover:scale-105 ${
                    selectedBranch === branch.id
                      ? "border-blue-500 bg-gradient-to-br from-blue-900/40 to-blue-800/20 shadow-lg shadow-blue-500/20"
                      : "border-gray-600 bg-gray-800/50 hover:border-blue-400 hover:bg-gray-800/70"
                  } backdrop-blur`}
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{branch.icon}</div>
                    <h3 className="font-bold text-white mb-2 text-lg leading-tight">{branch.name}</h3>
                    <p className="text-gray-300 text-sm">{branch.description}</p>
                    {selectedBranch === branch.id && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="ml-2 text-blue-400 text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedBranch}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-14 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {selectedBranch ? "Continue to Semester Selection →" : "Please select a branch first"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
