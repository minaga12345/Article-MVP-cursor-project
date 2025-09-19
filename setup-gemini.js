#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Article Draft MVP with Gemini API...\n');

// Create .env file for backend
const envContent = `# AI Service Configuration
# Using Gemini API (Free from Google AI Studio)
USE_GEMINI=true
GEMINI_API_KEY=AIzaSyAXw1862klCghDYUm46asowU7Iw363bUuc

# Server Configuration
PORT=5000
`;

const envPath = path.join(__dirname, 'backend', '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Created backend/.env with Gemini API key');
console.log('✅ Gemini API is now configured and ready to use!');
console.log('\n📋 Next steps:');
console.log('1. Install backend dependencies: cd backend && npm install');
console.log('2. Start backend: cd backend && npm run dev');
console.log('3. Start frontend: npm run dev');
console.log('4. Open http://localhost:3000');
console.log('\n🎉 Your app is ready with FREE Gemini AI!');
