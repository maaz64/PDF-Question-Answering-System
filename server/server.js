require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const connectDB = require('./config/db');
const cors = require('cors');
const fs = require('fs');
const Document = require('./models/Document');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);


// Set up multer for handling file uploads
// const upload = multer({ dest: 'uploads/' });

// // PDF upload endpoint
// app.post('/upload', upload.single('pdf'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   try {
//     const dataBuffer = await fs.promises.readFile(req.file.path);
//     const data = await pdf(dataBuffer);

//     const newDoc = new Document({
//       name: req.file.originalname,
//       content: data.text,
//     });

//     await newDoc.save();

//     // Clean up the uploaded file
//     await fs.promises.unlink(req.file.path);

//     res.status(200).json({ message: 'PDF uploaded and processed successfully', docId: newDoc._id });
//   } catch (error) {
//     console.error('Error processing PDF:', error);
//     res.status(500).json({ message: 'Error processing PDF', error: error.message });
//   }
// });

const upload = multer({ dest: 'uploads/' });

// PDF upload endpoint
app.post('/upload', upload.single('pdf'), async (req, res) => {
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

    res.status(200).json({ message: 'PDF uploaded and processed successfully', docId: newDoc._id });
  } catch (error) {
    res.status(500).json({ message: 'Error processing PDF', error });
  }
});

// Question answering endpoint
app.post('/ask', async (req, res) => {
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
});

const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
