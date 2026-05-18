const Document = require('../models/Document');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// @desc    Upload a PDF document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 1. Create document record in DB
        const document = await Document.create({
            user: req.user.id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            filepath: req.file.path,
            status: 'processing'
        });

        res.status(202).json(document); // Send immediate response

        // 2. Process with NLP microservice asynchronously
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path));

            const nlpUrl = process.env.NLP_SERVICE_URL || 'http://127.0.0.1:8000';
            
            // Extract text
            const extractResponse = await axios.post(`${nlpUrl}/extract`, formData, {
                headers: { ...formData.getHeaders() }
            });
            
            const extractedText = extractResponse.data.text;
            
            // Summarize
            const summaryResponse = await axios.post(`${nlpUrl}/summarize`, { text: extractedText });
            const summary = summaryResponse.data.summary;
            
            // Extract Keywords
            const keywordsResponse = await axios.post(`${nlpUrl}/keywords`, { text: extractedText });
            const keywords = keywordsResponse.data.keywords;

            // 3. Update document in DB
            document.extractedText = extractedText;
            document.summary = summary;
            document.keywords = keywords;
            document.status = 'completed';
            await document.save();

        } catch (nlpError) {
            console.error('NLP processing error:', nlpError.message);
            document.status = 'failed';
            await document.save();
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Make sure user owns document
        if (document.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    getDocument
};
