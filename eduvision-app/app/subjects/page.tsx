"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen, Book, ArrowLeft } from "lucide-react"

// Updated subjects data based on your requirements
const subjectsData: Record<
  string,
  Record<
    string,
    Array<{ id: string; name: string; description: string; books: number; clickable: boolean; icon: string }>
  >
> = {
  cse: {
    "4": [
      {
        id: "or",
        name: "Operations Research",
        description: "Linear programming, optimization",
        books: 3,
        clickable: true,
        icon: "📊",
      },
      {
        id: "ss",
        name: "Signals and Systems",
        description: "Signal processing fundamentals",
        books: 2,
        clickable: false,
        icon: "📡",
      },
      {
        id: "java",
        name: "JAVA Programming",
        description: "Object-oriented programming",
        books: 4,
        clickable: false,
        icon: "☕",
      },
      {
        id: "db",
        name: "Database Systems",
        description: "RDBMS, SQL, normalization",
        books: 3,
        clickable: false,
        icon: "🗄️",
      },
      {
        id: "com",
        name: "Computer Organization and Microprocessor",
        description: "CPU architecture, assembly",
        books: 2,
        clickable: true,
        icon: "🖥️",
      },
      {
        id: "dc",
        name: "Data Communications",
        description: "Network protocols, data transmission",
        books: 2,
        clickable: false,
        icon: "📶",
      },
    ],
    "5": [
      {
        id: "wad",
        name: "Web Application Development",
        description: "HTML, CSS, JavaScript, frameworks",
        books: 3,
        clickable: false,
        icon: "🌐",
      },
      {
        id: "os",
        name: "Operating Systems",
        description: "Process management, memory",
        books: 4,
        clickable: true,
        icon: "💻",
      },
      {
        id: "at",
        name: "Automata Theory",
        description: "Formal languages, finite automata",
        books: 2,
        clickable: false,
        icon: "🤖",
      },
      {
        id: "cn",
        name: "Computer Networks",
        description: "TCP/IP, network layers",
        books: 3,
        clickable: false,
        icon: "🌍",
      },
      {
        id: "se",
        name: "Software Engineering",
        description: "SDLC, testing methodologies",
        books: 3,
        clickable: false,
        icon: "⚙️",
      },
      {
        id: "ai",
        name: "Artificial Intelligence",
        description: "ML algorithms, neural networks",
        books: 5,
        clickable: true,
        icon: "🧠",
      },
    ],
    "6": [
      {
        id: "es",
        name: "Embedded Systems",
        description: "Microcontrollers, IoT",
        books: 3,
        clickable: true,
        icon: "🔧",
      },
      {
        id: "daa",
        name: "Design and Analysis of Algorithms",
        description: "Algorithm complexity, optimization",
        books: 4,
        clickable: true,
        icon: "📈",
      },
      {
        id: "ml",
        name: "Machine Learning",
        description: "Supervised, unsupervised learning",
        books: 5,
        clickable: false,
        icon: "🤖",
      },
      {
        id: "nsc",
        name: "Net.Security and Cryptography",
        description: "Encryption, network security",
        books: 3,
        clickable: false,
        icon: "🔒",
      },
      {
        id: "cc",
        name: "Cloud Computing",
        description: "AWS, Azure, distributed systems",
        books: 3,
        clickable: false,
        icon: "☁️",
      },
      {
        id: "dm",
        name: "Disaster Mitigation",
        description: "Risk assessment, emergency planning",
        books: 2,
        clickable: false,
        icon: "🚨",
      },
    ],
  },
  "ai-ds": {
    "4": [
      {
        id: "or",
        name: "Operations Research",
        description: "Linear programming, optimization",
        books: 3,
        clickable: true,
        icon: "📊",
      },
      {
        id: "ss",
        name: "Signals and Systems",
        description: "Signal processing fundamentals",
        books: 2,
        clickable: false,
        icon: "📡",
      },
      {
        id: "java",
        name: "JAVA Programming",
        description: "Object-oriented programming",
        books: 4,
        clickable: false,
        icon: "☕",
      },
      {
        id: "db",
        name: "Database Systems",
        description: "RDBMS, SQL, normalization",
        books: 3,
        clickable: false,
        icon: "🗄️",
      },
      {
        id: "com",
        name: "Computer Organization and Microprocessor",
        description: "CPU architecture, assembly",
        books: 2,
        clickable: true,
        icon: "🖥️",
      },
      {
        id: "dc",
        name: "Data Communications",
        description: "Network protocols, data transmission",
        books: 2,
        clickable: false,
        icon: "📶",
      },
    ],
    "5": [
      {
        id: "wad",
        name: "Web Application Development",
        description: "HTML, CSS, JavaScript, frameworks",
        books: 3,
        clickable: false,
        icon: "🌐",
      },
      {
        id: "os",
        name: "Operating Systems",
        description: "Process management, memory",
        books: 4,
        clickable: true,
        icon: "💻",
      },
      {
        id: "at",
        name: "Automata Theory",
        description: "Formal languages, finite automata",
        books: 2,
        clickable: false,
        icon: "🤖",
      },
      {
        id: "cn",
        name: "Computer Networks",
        description: "TCP/IP, network layers",
        books: 3,
        clickable: false,
        icon: "🌍",
      },
      {
        id: "se",
        name: "Software Engineering",
        description: "SDLC, testing methodologies",
        books: 3,
        clickable: false,
        icon: "⚙️",
      },
      {
        id: "ai",
        name: "Artificial Intelligence",
        description: "ML algorithms, neural networks",
        books: 5,
        clickable: true,
        icon: "🧠",
      },
    ],
    "6": [
      {
        id: "es",
        name: "Embedded Systems",
        description: "Microcontrollers, IoT",
        books: 3,
        clickable: true,
        icon: "🔧",
      },
      {
        id: "daa",
        name: "Design and Analysis of Algorithms",
        description: "Algorithm complexity, optimization",
        books: 4,
        clickable: true,
        icon: "📈",
      },
      {
        id: "ml",
        name: "Machine Learning",
        description: "Supervised, unsupervised learning",
        books: 5,
        clickable: false,
        icon: "🤖",
      },
      {
        id: "nsc",
        name: "Net.Security and Cryptography",
        description: "Encryption, network security",
        books: 3,
        clickable: false,
        icon: "🔒",
      },
      {
        id: "cc",
        name: "Cloud Computing",
        description: "AWS, Azure, distributed systems",
        books: 3,
        clickable: false,
        icon: "☁️",
      },
      {
        id: "dm",
        name: "Disaster Mitigation",
        description: "Risk assessment, emergency planning",
        books: 2,
        clickable: false,
        icon: "🚨",
      },
    ],
  },
  it: {
    "4": [
      {
        id: "or",
        name: "Operations Research",
        description: "Linear programming, optimization",
        books: 3,
        clickable: true,
        icon: "📊",
      },
      {
        id: "ss",
        name: "Signals and Systems",
        description: "Signal processing fundamentals",
        books: 2,
        clickable: false,
        icon: "📡",
      },
      {
        id: "java",
        name: "JAVA Programming",
        description: "Object-oriented programming",
        books: 4,
        clickable: false,
        icon: "☕",
      },
      {
        id: "db",
        name: "Database Systems",
        description: "RDBMS, SQL, normalization",
        books: 3,
        clickable: false,
        icon: "🗄️",
      },
      {
        id: "com",
        name: "Computer Organization and Microprocessor",
        description: "CPU architecture, assembly",
        books: 2,
        clickable: true,
        icon: "🖥️",
      },
      {
        id: "dc",
        name: "Data Communications",
        description: "Network protocols, data transmission",
        books: 2,
        clickable: false,
        icon: "📶",
      },
    ],
    "5": [
      {
        id: "wad",
        name: "Web Application Development",
        description: "HTML, CSS, JavaScript, frameworks",
        books: 3,
        clickable: false,
        icon: "🌐",
      },
      {
        id: "os",
        name: "Operating Systems",
        description: "Process management, memory",
        books: 4,
        clickable: true,
        icon: "💻",
      },
      {
        id: "at",
        name: "Automata Theory",
        description: "Formal languages, finite automata",
        books: 2,
        clickable: false,
        icon: "🤖",
      },
      {
        id: "cn",
        name: "Computer Networks",
        description: "TCP/IP, network layers",
        books: 3,
        clickable: false,
        icon: "🌍",
      },
      {
        id: "se",
        name: "Software Engineering",
        description: "SDLC, testing methodologies",
        books: 3,
        clickable: true,
        icon: "⚙️",
      },
      {
        id: "ai",
        name: "Artificial Intelligence",
        description: "ML algorithms, neural networks",
        books: 5,
        clickable: true,
        icon: "🧠",
      },
    ],
    "6": [
      {
        id: "es",
        name: "Embedded Systems",
        description: "Microcontrollers, IoT",
        books: 3,
        clickable: true,
        icon: "🔧",
      },
      {
        id: "daa",
        name: "Design and Analysis of Algorithms",
        description: "Algorithm complexity, optimization",
        books: 4,
        clickable: true,
        icon: "📈",
      },
      {
        id: "ml",
        name: "Machine Learning",
        description: "Supervised, unsupervised learning",
        books: 5,
        clickable: false,
        icon: "🤖",
      },
      {
        id: "nsc",
        name: "Net.Security and Cryptography",
        description: "Encryption, network security",
        books: 3,
        clickable: false,
        icon: "🔒",
      },
      {
        id: "cc",
        name: "Cloud Computing",
        description: "AWS, Azure, distributed systems",
        books: 3,
        clickable: false,
        icon: "☁️",
      },
      {
        id: "dm",
        name: "Disaster Mitigation",
        description: "Risk assessment, emergency planning",
        books: 2,
        clickable: false,
        icon: "🚨",
      },
    ],
  },
}

interface Subject {
  id: string
  name: string
  description: string
  books: number
  clickable: boolean
  icon: string
}

export default function SubjectsPage() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const router = useRouter()

  useEffect(() => {
    const branch = localStorage.getItem("selectedBranch")
    const semester = localStorage.getItem("selectedSemester")
    const user = localStorage.getItem("user")

    if (!user || !branch || !semester) {
      router.push("/")
      return
    }

    setSelectedBranch(branch)
    setSelectedSemester(semester)

    // Get subjects for the selected branch and semester
    const branchSubjects = subjectsData[branch]?.[semester] || []
    setSubjects(branchSubjects)
  }, [router])

  const handleSubjectSelect = (subject: Subject) => {
    if (!subject.clickable) {
      return // Don't allow selection of non-clickable subjects
    }
    localStorage.setItem("selectedSubject", subject.id)
    router.push("/chat")
  }

  const handleBack = () => {
    router.push("/semester")
  }

  const getBranchName = (branchId: string) => {
    const branches: Record<string, string> = {
      cse: "Computer Science Engineering",
      "ai-ds": "AI & Data Science",
      it: "Information Technology",
    }
    return branches[branchId] || branchId.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950 to-gray-950">
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
            <span className="text-blue-400 font-semibold">{getBranchName(selectedBranch)}</span>
            <span className="mx-2">•</span>
            <span className="text-green-400 font-semibold">Semester {selectedSemester}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-8 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Semester Selection
        </Button>

        {/* Subject Selection */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="flex items-center justify-center space-x-3 text-3xl mb-4">
              <Book className="h-8 w-8 text-green-400" />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Select a Subject
              </span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Choose a subject to start chatting with the AI assistant
            </CardDescription>
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Available for Demo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400">Coming Soon</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {subjects.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className={`transition-all duration-300 border-2 transform ${
                      subject.clickable
                        ? "cursor-pointer hover:scale-105 border-gray-600 bg-gray-800/50 hover:border-green-400 hover:bg-green-900/20 hover:shadow-lg hover:shadow-green-500/20"
                        : "cursor-not-allowed border-gray-700 bg-gray-800/30 opacity-60"
                    } backdrop-blur`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <CardContent className="p-6 relative">
                      {subject.clickable && (
                        <div className="absolute top-3 right-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                      {!subject.clickable && (
                        <div className="absolute top-3 right-3 bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                          Soon
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">{subject.icon}</div>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                          {subject.books} books
                        </span>
                      </div>

                      <h3
                        className={`font-bold mb-3 leading-tight text-lg ${
                          subject.clickable ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {subject.name}
                      </h3>

                      <p className={`text-sm leading-relaxed ${subject.clickable ? "text-gray-300" : "text-gray-500"}`}>
                        {subject.description}
                      </p>

                      {subject.clickable && (
                        <div className="mt-4 flex items-center text-green-400 text-sm font-medium">
                          <span>Click to start →</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Book className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No subjects available for this branch and semester combination.</p>
                <Button variant="outline" onClick={handleBack} className="mt-4 border-gray-700 text-gray-300">
                  Go Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
