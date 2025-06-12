"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, BookOpen, Send, User, Bot, ArrowLeft, FileText, Zap } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface BookInfo {
  id: string
  title: string
  author: string
  filename: string
}

// Real books data based on actual PDFs in static2 folder
const booksData: Record<string, BookInfo[]> = {
  COMP: [
    {
      id: "comp_ram",
      title: "Computer Fundamentals- Architecture and Organization",
      author: "B. Ram",
      filename: "IV SEM- (COMP) 'Computer Fundamentals- Architecture and Organization' by B. Ram.pdf"
    },
    {
      id: "comp_mano",
      title: "Computer System Architecture",
      author: "Morris Mano",
      filename: "IV SEM- (COMP) 'Computer System Architecture' by Morris Mano.pdf"
    }
  ],
  OR: [
    {
      id: "or_taha",
      title: "Operations Research- An Introduction",
      author: "Hamdy A. Taha",
      filename: "IV SEM- (OR) 'Operations Research- An Introduction' by Hamdy A. Taha.pdf"
    },
    {
      id: "or_wagner",
      title: "Principles of Operations Research",
      author: "Harvey M. Wagner",
      filename: "IV SEM- (OR) 'Principles of Operations Research' by Harvey M. Wagner.pdf"
    }
  ],
  AI: [
    {
      id: "ai_nilsson",
      title: "The Quest for Artificial Intelligence",
      author: "Nils J. Nilsson",
      filename: "V SEM- (AI) 'The Quest for Artificial Intelligence' by Nils J. Nilsson.pdf"
    }
  ],
  OS: [
    {
      id: "os_silberschatz",
      title: "Operating System Concepts",
      author: "Abraham Silberschatz",
      filename: "V SEM- (OS) 'Operating System Concepts' by Abraham Silberschatz.pdf"
    },
    {
      id: "os_stallings",
      title: "Operating Systems- Internals and Design Principles",
      author: "William Stallings",
      filename: "V SEM- (OS) 'Operating Systems- Internals and Design Principles' by William Stallings.pdf"
    },
    {
      id: "os_bach",
      title: "The Design of the Unix-Operating System",
      author: "Maurice J. Bach",
      filename: "V SEM- (OS) 'The Design of the Unix-Operating System' by Maurice J. Bach.pdf"
    }
  ],
  SE: [
    {
      id: "se_jalote",
      title: "An Integrated approach to Software Engineering",
      author: "Pankaj Jalote",
      filename: "V SEM- (SE) 'An Integrated approach to Software Engineering' by Pankaj Jalote.pdf"
    }
  ],
  DAA: [
    {
      id: "daa_aho",
      title: "Data Structures and Algorithms",
      author: "Alfred V. Aho",
      filename: "VI SEM- (DAA) 'Data Structures and Algorithms' by Alfred V. Aho.pdf"
    },
    {
      id: "daa_horowitz",
      title: "Fundamentals of computer algorithms",
      author: "Ellis Horowitz",
      filename: "VI SEM- (DAA) 'Fundamentals of computer algorithms' by Ellis Horowitz.pdf"
    }
  ],
  ES: [
    {
      id: "es_wolf",
      title: "Computers as Components-Principles of Embedded Computer System Design",
      author: "Wayne Wolf",
      filename: "VI SEM- (ES) 'Computers as Components-Principles of Embedded Computer System Design' by Wayne Wolf.pdf"
    },
    {
      id: "es_mazidi",
      title: "The 8051 Microcontroller and Embedded Systems",
      author: "Muhammed Ali Mazidi",
      filename: "VI SEM- (ES) 'The 8051 Microcontroller and Embedded Systems' by Muhammed Ali Mazidi.pdf"
    }
  ]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userSelections, setUserSelections] = useState({
    branch: "",
    semester: "",
    subject: "",
  })
  const [availableBooks, setAvailableBooks] = useState<BookInfo[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    const branch = localStorage.getItem("selectedBranch")
    const semester = localStorage.getItem("selectedSemester")
    const subject = localStorage.getItem("selectedSubject")

    if (!user || !branch || !semester || !subject) {
      router.push("/")
      return
    }

    setUserSelections({ branch, semester, subject })

    // Load available books for the subject
    const books = booksData[getSubjectCode(subject)] || []
    setAvailableBooks(books)

    // Test backend connection
    testBackendConnection()

    // Clear any corrupted chat history and start fresh
    try {
      const chatHistory = localStorage.getItem(`chat_${subject}`)
      if (chatHistory) {
        const parsedMessages = JSON.parse(chatHistory).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      } else {
        // Add welcome message
        const welcomeMessage: Message = {
          id: "1",
          type: "assistant",
          content: `🎓 Welcome to EduVision AI for ${getSubjectName(subject)}!\n\nI'm here to help you with your textbooks. Here's how to get started:\n\n📚 **Step 1:** Select a book from the dropdown above\n🤖 **Step 2:** Ask me anything about the content\n💡 **Step 3:** Get instant, accurate answers from your PDFs\n\nI can help you with:\n• Chapter summaries\n• Concept explanations\n• Examples and problems\n• Quick definitions\n\nSelect a book above to begin!`,
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      // Clear corrupted data and start fresh
      localStorage.removeItem(`chat_${subject}`)
      const welcomeMessage: Message = {
        id: "1",
        type: "assistant",
        content: `🎓 Welcome to EduVision AI for ${getSubjectName(subject)}!\n\nI'm here to help you with your textbooks. Select a book above to begin!`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Save chat history whenever messages change
    if (userSelections.subject && messages.length > 0) {
      localStorage.setItem(`chat_${userSelections.subject}`, JSON.stringify(messages))
    }
  }, [messages, userSelections.subject])

  const testBackendConnection = async () => {
    const possiblePorts = [5001, 5002, 5003, 8000, 8001, 8080, 3001, 4000, 4001]
    
    for (const port of possiblePorts) {
      try {
        const response = await fetch(`http://localhost:${port}/health`, { timeout: 2000 })
        if (response.ok) {
          setIsConnected(true)
          // Store the working port for future use
          localStorage.setItem('backend_port', port.toString())
          console.log(`✅ Connected to backend on port ${port}`)
          return
        }
      } catch {
        // Try next port
        continue
      }
    }
    
    setIsConnected(false)
    console.log('❌ Could not connect to backend on any port')
  }

  const getBackendUrl = () => {
    const savedPort = localStorage.getItem('backend_port')
    return `http://localhost:${savedPort || '5001'}`
  }

  const getSubjectName = (subjectId: string) => {
    const subjects: Record<string, string> = {
      dsa: "Data Structures & Algorithms",
      oop: "Computer Programming",
      dbms: "Database Management Systems",
      math1: "Engineering Mathematics I",
      signals: "Embedded Systems",
      electronics: "Electronic Devices",
      ai: "Artificial Intelligence",
      os: "Operating Systems",
      se: "Software Engineering"
    }
    return subjects[subjectId] || subjectId.toUpperCase()
  }

  const getBranchName = (branchId: string) => {
    const branches: Record<string, string> = {
      cse: "CSE",
      ece: "ECE",
      me: "ME",
      ce: "CE",
      ee: "EE",
      it: "IT",
    }
    return branches[branchId] || branchId.toUpperCase()
  }

  const getSubjectCode = (subjectId: string) => {
    const subjectCodes: Record<string, string> = {
      dsa: "DAA",
      oop: "COMP",
      dbms: "DBMS",
      math1: "MATH",
      signals: "ES",
      electronics: "ES",
      ai: "AI",
      os: "OS",
      se: "SE"
    }
    return subjectCodes[subjectId] || subjectId.toUpperCase()
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedBook) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Real API call to Flask backend
    try {
      const backendUrl = getBackendUrl()
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch: userSelections.branch,
          subject: getSubjectCode(userSelections.subject),
          semester: userSelections.semester,
          question: inputMessage,
          book: selectedBook.title,
          author: selectedBook.author,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      let assistantResponse = ""
      if (data.error) {
        assistantResponse = `❌ **Error:** ${data.error}\n\nPlease try:\n• Selecting a different book\n• Rephrasing your question\n• Checking if the backend is running`
      } else {
        assistantResponse = data.answer || "I couldn't generate a response. Please try again."
        
        // Add source information if available
        if (data.metadata && data.metadata.pdf_used) {
          assistantResponse += `\n\n📖 **Source:** ${selectedBook.title} by ${selectedBook.author}`
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling RAG API:', error)
      
      // Try to reconnect to backend
      await testBackendConnection()
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "🔌 **Connection Error**\n\nCouldn't connect to the AI service. The system is automatically checking for available backend ports. Please:\n• Make sure the backend is running (python app.py)\n• Check the console for the correct port\n• Try refreshing the page",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleBack = () => {
    router.push("/subjects")
  }

  const handleBookSelect = (bookId: string) => {
    const book = availableBooks.find(b => b.id === bookId)
    setSelectedBook(book || null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-7 w-7 text-blue-400 animate-pulse" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-ping`}></div>
              </div>
              <BookOpen className="h-7 w-7 text-green-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                EduVision
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
                {getBranchName(userSelections.branch)} • Sem {userSelections.semester} • {getSubjectName(userSelections.subject)}
              </div>
              <Button variant="ghost" onClick={handleBack} className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Book Selection */}
      <div className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-200">Select Your Textbook</h3>
            </div>
            <Select value={selectedBook?.id || ""} onValueChange={handleBookSelect}>
              <SelectTrigger className="w-full bg-gray-800/80 border-gray-600/50 text-white hover:bg-gray-800 transition-all h-14 text-lg shadow-lg">
                <SelectValue placeholder="📚 Choose a book from your curriculum..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 max-h-60 z-50">
                {availableBooks.length > 0 ? (
                  availableBooks.map((book) => (
                    <SelectItem 
                      key={book.id} 
                      value={book.id} 
                      className="text-white hover:bg-gray-700 focus:bg-gray-700 py-3 px-4 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-300">{book.title}</span>
                        <span className="text-sm text-gray-400">by {book.author}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-books" disabled className="text-gray-500">
                    No books available for this subject
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {selectedBook && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 font-medium">Ready!</span>
                </div>
                <p className="text-sm text-green-200 mt-1">
                  {selectedBook.title} by {selectedBook.author} is loaded
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 bg-gradient-to-b from-transparent to-gray-950/20">
          <div className="container mx-auto max-w-4xl space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex max-w-[85%] ${
                    message.type === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start space-x-3`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      message.type === "user" 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                        : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}
                  >
                    {message.type === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div
                    className={`rounded-2xl p-4 shadow-xl ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-gray-800/90 text-gray-100 border border-gray-700/50 backdrop-blur"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-3">
                      {message.timestamp instanceof Date 
                        ? message.timestamp.toLocaleTimeString() 
                        : new Date(message.timestamp).toLocaleTimeString()
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="bg-gray-800/90 border border-gray-700/50 backdrop-blur rounded-2xl p-4 shadow-xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">AI is thinking...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-xl shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedBook
                    ? `Ask about "${selectedBook.title}"...`
                    : "📚 Please select a book first to start asking questions..."
                }
                disabled={!selectedBook || isLoading}
                className="flex-1 bg-gray-800/80 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 h-14 text-lg rounded-xl shadow-lg"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !selectedBook || isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 h-14 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {!selectedBook && (
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">💡 Select a textbook above to start your AI-powered study session</p>
              </div>
            )}

            {!isConnected && (
              <div className="mt-4 text-center">
                <p className="text-red-400 text-sm">🔌 Backend disconnected - Checking ports automatically...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}