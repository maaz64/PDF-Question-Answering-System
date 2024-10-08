const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const fs = require('fs');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// PDF upload endpoint
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const dataBuffer = await fs.promises.readFile(req.file.path);
    const data = await pdf(dataBuffer);

    const newDoc = new Document({
      name: req.file.originalname,
      content: data.text,
    });

    await newDoc.save();
    await fs.promises.unlink(req.file.path);

    res.status(200).json({ message: 'PDF uploaded and processed successfully', docId: newDoc._id });
  } catch (error) {
    res.status(500).json({ message: 'Error processing PDF', error });
  }
};

// Question answering endpoint
const askQuestion = async (req, res) => {
  const { docId, question } = req.body;
  try {
    const doc = await Document.findById(docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const prompt = `Give me proper text based response based on the following document and do not do any formatting and don;t include \n or enter in the response, answer this question: "${question}" Document content : ${doc.content}`;

    // Use Google's Generative AI to generate a response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ message: 'Error processing question', error: error.message });
  }
};

module.exports = {
  uploadDocument,
  askQuestion
};