"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen, Calendar, ArrowLeft } from "lucide-react"

const semesters = [
  {
    id: "4",
    name: "4th Semester",
    description: "Intermediate level courses",
    icon: "📚",
    color: "from-purple-600 to-purple-700",
  },
  {
    id: "5",
    name: "5th Semester",
    description: "Advanced concepts & specialization",
    icon: "🎓",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: "6",
    name: "6th Semester",
    description: "Industry focus & final projects",
    icon: "🚀",
    color: "from-green-600 to-green-700",
  },
]

export default function SemesterPage() {
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const branch = localStorage.getItem("selectedBranch")
    const user = localStorage.getItem("user")

    if (!user || !branch) {
      router.push("/")
      return
    }

    setSelectedBranch(branch)
  }, [router])

  const handleContinue = () => {
    if (selectedSemester) {
      localStorage.setItem("selectedSemester", selectedSemester)
      router.push("/subjects")
    }
  }

  const handleBack = () => {
    router.push("/home")
  }

  const getBranchName = (branchId: string) => {
    const branches: Record<string, string> = {
      cse: "Computer Science Engineering",
      "ai-ds": "AI & Data Science",
      "ai-ml": "AI & Machine Learning",
    }
    return branches[branchId] || branchId.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
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
          <div className="text-gray-300 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
            Branch: <span className="font-semibold text-blue-400">{getBranchName(selectedBranch)}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-8 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Branch Selection
        </Button>

        {/* Semester Selection */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="flex items-center justify-center space-x-3 text-3xl mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Choose Your Semester
              </span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Select the semester you're currently in or want to study
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              {semesters.map((semester) => (
                <Card
                  key={semester.id}
                  className={`cursor-pointer transition-all duration-300 border-2 transform hover:scale-105 ${
                    selectedSemester === semester.id
                      ? "border-purple-500 bg-gradient-to-br from-purple-900/40 to-purple-800/20 shadow-lg shadow-purple-500/20"
                      : "border-gray-600 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800/70"
                  } backdrop-blur`}
                  onClick={() => setSelectedSemester(semester.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">{semester.icon}</div>
                    <h3 className="font-bold text-white mb-3 text-xl">{semester.name}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{semester.description}</p>
                    {selectedSemester === semester.id && (
                      <div className="mt-4 flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="ml-2 text-purple-400 text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedSemester}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold h-14 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {selectedSemester ? "Continue to Subject Selection →" : "Please select a semester first"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
