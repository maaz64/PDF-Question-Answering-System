import { useState, ChangeEvent, useRef, useEffect } from 'react'
import axios from 'axios'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { ScrollArea } from "./components/ui/scroll-area"
import { Upload, Send, Bot, User } from "lucide-react"
const BASE_URL = 'https://pdf-question-answering-system.onrender.com/api'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [docId, setDocId] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    try {
      const response = await axios.post<{ message: string; docId: string }>(`${BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDocId(response.data.docId)
      setMessages(prev => [...prev, { role: 'assistant', content: `PDF "${file.name}" uploaded successfully. You can now ask questions about it.` }])
    } catch (error) {
      console.error('Error uploading PDF:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error uploading PDF. Please try again.' }])
    }
    setLoading(false)
  }

  const handleAskQuestion = async () => {
    if (!docId || !question) return

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setQuestion('')
    setLoading(true)
    try {
      const response = await axios.post<{ answer: string }>(`${BASE_URL}/ask`, { docId, question })
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }])
    } catch (error) {
      console.error('Error asking question:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing question. Please try again.' }])
    }
    setLoading(false)
  }

 

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 text-white p-4">
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
      </div>

      {/* Main content */}
      
      <div className="flex-1 flex flex-col">
        {/* Messages area */}
        {docId ? (<>
        <ScrollArea className="flex-1 p-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start mb-4 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              {message.role === 'assistant' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                    <Bot className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="bg-gray-200 rounded-lg p-2 max-w-3/4">
                    {message.content}
                  </div>
                </div>
              )}
              {message.role === 'user' && (
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-lg p-2 max-w-3/4">
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
        </>):
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center bg-gray-800 p-10 rounded-lg w-2/3 max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to PDF Q&A</h1>
          <p className="text-lg text-gray-300 text-center mb-4">
            To get started:
          </p>
            <ol className="text-gray-300 list-decimal list-inside space-y-2">
              <li>Choose a PDF file using the sidebar on the left</li>
              <li>Click the "Upload PDF" button</li>
              <li>Once uploaded, you can ask questions about the PDF content</li>
            </ol>
          </div>
        </div>
        }

        {/* Input area */}
        <div className="p-4 border-t">
          <div className="flex items-center">
            <Textarea
              value={question}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
              placeholder="Ask a question about the PDF..."
              className="flex-1 mr-2"
              rows={1}
            />
            <Button 
              onClick={handleAskQuestion}
              disabled={!docId || !question || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
