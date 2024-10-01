const { HfInference } = require('@huggingface/inference');
const pdf = require('pdf-parse');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function translateText(text, sourceLanguage, targetLanguage) {
  if (!text || !sourceLanguage || !targetLanguage) {
    throw new Error('Missing required parameters for translation');
  }

  const modelName = `Helsinki-NLP/opus-mt-${sourceLanguage}-${targetLanguage}`;
  try {
    const result = await hf.translation({
      model: modelName,
      inputs: text,
    });
    return result.translation_text;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate text: ${error.message}`);
  }
}

async function translateDocument(filePath, sourceLanguage, targetLanguage) {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await pdf(dataBuffer);
    
    if (!data.text.trim()) {
      throw new Error('The PDF does not contain any text to translate');
    }

    const translatedText = await translateText(data.text, sourceLanguage, targetLanguage);
    
    const outputPath = path.join('uploads', `translated_${path.basename(filePath)}`);
    await generatePDF(translatedText, outputPath);
    
    return { translatedText, pdfPath: outputPath };
  } catch (error) {
    console.error('Document translation error:', error);
    throw new Error(`Failed to translate document: ${error.message}`);
  }
}

async function generatePDF(text, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);
    doc.fontSize(12).text(text, 100, 100);
    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = {
  translateText,
  translateDocument,
};