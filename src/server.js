require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { translateText, translateDocument } = require('./translationService');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/downloads', express.static(path.join(__dirname, '..', 'uploads')));

app.post('/api/translate-text', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const translatedText = await translateText(text, sourceLanguage, targetLanguage);
    res.json({ translatedText });
  } catch (error) {
    console.error('Text translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/translate-document', upload.single('document'), async (req, res) => {
  try {
    const { sourceLanguage, targetLanguage } = req.body;
    if (!req.file || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const { path: filePath } = req.file;
    const { translatedText, pdfPath } = await translateDocument(filePath, sourceLanguage, targetLanguage);
    const downloadUrl = `/downloads/${path.basename(pdfPath)}`;
    res.json({ translatedText, downloadUrl });
  } catch (error) {
    console.error('Document translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});