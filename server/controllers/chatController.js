const Chat = require('../models/Chat');
const Document = require('../models/Document');
const axios = require('axios');

// @desc    Ask a question about a document
// @route   POST /api/chat
// @access  Private
const askQuestion = async (req, res) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({ message: 'Please provide documentId and question' });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        if (document.status !== 'completed') {
            return res.status(400).json({ message: 'Document processing not completed yet' });
        }

        // Call NLP service for QA
        const nlpUrl = process.env.NLP_SERVICE_URL || 'http://127.0.0.1:8000';
        const qaResponse = await axios.post(`${nlpUrl}/qa`, {
            text: document.extractedText,
            question: question
        });

        const answer = qaResponse.data.answer;

        // Save to chat history
        let chat = await Chat.findOne({ user: req.user.id, document: documentId });

        if (!chat) {
            chat = await Chat.create({
                user: req.user.id,
                document: documentId,
                messages: []
            });
        }

        chat.messages.push({ role: 'user', content: question });
        chat.messages.push({ role: 'ai', content: answer });

        await chat.save();

        res.status(200).json({
            question,
            answer,
            chatId: chat._id
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat history for a document
// @route   GET /api/chat/:documentId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ 
            user: req.user.id, 
            document: req.params.documentId 
        });

        if (!chat) {
            return res.status(200).json({ messages: [] });
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    askQuestion,
    getChatHistory
};
