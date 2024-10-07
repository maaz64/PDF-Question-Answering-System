const express = require('express');
const multer = require('multer');
const { uploadDocument, askQuestion } = require('../controller/documentController');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('pdf'), uploadDocument); 
router.post('/ask', askQuestion);


module.exports = router;