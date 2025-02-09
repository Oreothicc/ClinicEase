const express = require('express');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = 3000;

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize Google Cloud Vision client
const visionClient = new ImageAnnotatorClient();

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY; // Ensure API key is in .env
const genAI = new GoogleGenerativeAI(apiKey);

// Serve static files (HTML, CSS, JS)
app.use(express.static('views'));

// Function to clean Gemini API response
function cleanGeminiResponse(rawResponse) {
    return rawResponse.replace(/```json\s*/g, '').replace(/```/g, '').trim();
}

// Function to process text with Gemini API
async function extractMedicinesAndDosages(ocrText) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
Extract the medicine names and dosages from the following text in a structured JSON format without any additional formatting. 
Only return a valid JSON object with a key "medicines" as an array. Do not include any markdown, backticks, or extra text.
Example:
{
  "medicines": [
    {"name": "Paracetamol", "dosage": "500mg"},
    {"name": "Amoxicillin", "dosage": "250mg"}
  ]
}
Here is the text: "${ocrText}"
`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        if (!response) throw new Error("No response from Gemini API.");

        return cleanGeminiResponse(response.text());
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to extract medicine details.");
    }
}

// Route to handle file upload and OCR
app.post('/upload', upload.single('prescription'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Path to the uploaded image
        const imagePath = path.join(__dirname, req.file.path);

        // Call Google Cloud Vision API
        const [result] = await visionClient.textDetection(imagePath);
        const text = result.textAnnotations[0]?.description || "No text detected";

        // Process text with Gemini API
        const extractedData = await extractMedicinesAndDosages(text);
        
        try {
            const parsedData = JSON.parse(extractedData);
            res.json(parsedData);
        } catch (parseError) {
            console.error('JSON Parsing Error:', parseError);
            res.status(500).send('Error parsing the extracted data.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the image.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
