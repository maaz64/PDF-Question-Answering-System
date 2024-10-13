import { useState, ChangeEvent, useRef, useEffect } from 'react'
import axios from 'axios'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { ScrollArea } from "./components/ui/scroll-area"
import { Upload, Send, Bot, User, Sun, Moon } from "lucide-react"
const BASE_URL = 'https://pdf-question-answering-system.onrender.com/api'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [docId, setDocId] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('pdf', file)

    setLoading(true)
    setError(null)
    try {
      const response = await axios.post<{ message: string; docId: string }>(`${BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDocId(response.data.docId)
      setMessages(prev => [...prev, { role: 'assistant', content: `PDF "${file.name}" uploaded successfully. You can now ask questions about it.` }])
    } catch (error) {
      console.error('Error uploading PDF:', error)
      setError('Error uploading PDF. Please try again.')
    }
    setLoading(false)
  }

  const handleAskQuestion = async () => {
    if (!docId || !question) return

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setQuestion('')
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post<{ answer: string }>(`${BASE_URL}/ask`, { docId, question })
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }])
    } catch (error) {
      console.error('Error asking question:', error)
      setError('Error processing question. Please try again.')
    }
    setLoading(false)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Here you would typically also update your app's theme
    // This might involve changing a class on the body or using a theme context
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 dark:bg-gray-900 text-white p-4 hidden md:block">
        <h1 className="text-2xl font-bold mb-4">PDF Q&A</h1>
        <div className="mb-4">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-full mb-2 bg-gray-700"
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" /> Choose PDF
          </Button>
          {file && (
            <Button 
              onClick={handleUpload} 
              disabled={loading}
              className="w-full bg-gray-700"
            >
              Upload PDF
            </Button>
          )}
        </div>
        <div className="overflow-hidden mt-4">
          {file && <p className="text-sm overflow-x-scroll">Selected: {file.name}</p>}
        </div>
        {error && (
          <div className="mt-4 p-2 bg-red-600 text-white rounded">
            {error}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Navbar */}
        <div className="md:hidden bg-gray-800 dark:bg-gray-900 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">PDF Q&A</h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {docId ? (
            <ScrollArea className="h-full p-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start mb-4 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        <Bot className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="bg-gray-200 rounded-lg p-2 max-w-[75%]">
                        {message.content}
                      </div>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="flex items-start">
                      <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[75%]">
                        {message.content}
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center ml-2">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg max-w-md">
                <h1 className="text-2xl font-bold mb-4 dark:text-white">Welcome to PDF Q&A</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  To get started:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Choose a PDF file using the sidebar on the left</li>
                  <li>Click the "Upload PDF" button</li>
                  <li>Once uploaded, you can ask questions about the PDF content</li>
                </ol>
              </div>
            </div>
          )}    
        </div>

        {/* Input area */}
        <div className="p-4 border-t bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <Textarea
              value={question}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
              placeholder="Ask a question about the PDF..."
              className="flex-1"
              rows={1}
            />
            <div className="flex-shrink-0 flex space-x-2">
              <Button 
                onClick={handleAskQuestion}
                disabled={!docId || !question || loading}
              >
                <Send className="h-4 w-4" />
              </Button>
              <div className="md:hidden">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-gray-700"
                  variant="outline"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {file && (
            <div className="mt-2 md:hidden">
              <Button 
                onClick={handleUpload} 
                disabled={loading}
                className="w-full bg-gray-700"
              >
                Upload PDF
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
