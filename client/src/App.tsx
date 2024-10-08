import { useState, ChangeEvent } from 'react'
import axios from 'axios'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://pdf-question-answering-system.onrender.com/api'

export default function App() { 
  const [file, setFile] = useState<File | null>(null)
  const [docId, setDocId] = useState<string>('') 
  const [question, setQuestion] = useState<string>('')
  const [answer, setAnswer] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setQuestion('')
      setAnswer('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('pdf', file)

    setLoading(true)
    try {
      const response = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDocId(response.data.docId)
    } catch (error) {
      console.error('Error uploading PDF:', error)
    }
    setLoading(false)
  }

  const handleAskQuestion = async () => {
    if (!docId || !question) return

    setLoading(true)
    try {
      const response = await axios.post<{ answer: string }>(`${BASE_URL}/ask`, { docId, question })
      setAnswer(response.data.answer)
    } catch (error) {
      console.error('Error asking question:', error)
      alert('Error processing question')
    }
    setLoading(false)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">PDF Question Answering System</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="flex-grow"
              aria-label="Select PDF file"
            />
            <Button 
              onClick={handleUpload} 
              disabled={!file || loading}
            >
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {docId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input 
                type="text" 
                value={question} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                placeholder="Ask a question about the PDF"
                className="flex-grow"
                aria-label="Enter your question"
              />
              <Button 
                onClick={handleAskQuestion}
                disabled={!question || loading}
              >
                Ask
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <p className="text-center">Loading...</p>}

      {answer && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{answer}</p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}