# EduVision 🎓

**AI-Powered Academic Assistant for MJ College Students**

EduVision is an intelligent RAG (Retrieval-Augmented Generation) system that helps students interact with their textbooks using advanced AI. Students can ask questions about their course materials and get instant, accurate answers powered by Google Gemini 2.0 Flash.

## ✨ Features

- 🤖 **AI-Powered Q&A**: Ask questions about your textbooks and get intelligent responses
- 📚 **PDF Integration**: Automatically loads course PDFs based on branch, semester, and subject
- 🎯 **Smart Book Selection**: Dynamic dropdown with real textbooks from your curriculum
- 🔍 **RAG System**: Uses vector search + AI for contextually accurate answers
- 🌙 **Modern Dark UI**: Sleek, responsive interface with smooth animations
- 🔄 **Auto Port Detection**: Backend automatically finds available ports
- 💾 **Chat History**: Saves conversations per subject
- 🔌 **Real-time Connection**: Shows backend connection status

## 🏗️ Architecture

```
Frontend (Next.js) ↔ Backend (Flask) ↔ Google Gemini API
                                    ↕
                              PDF Processing (PyPDF2)
                                    ↕
                              Vector Store (FAISS)
```

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Google API Key** (for Gemini)
- **Git**

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mohdomer/EduVision.git
cd EduVision
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Add your Google API key to .env
echo "GOOGLE_API_KEY=your_google_api_key_here" > .env
```

### 3. Frontend Setup

```bash
cd eduvision-app

# Install dependencies
npm install --legacy-peer-deps

# Return to root directory
cd ..
```

### 4. Add Your PDFs

Place your course PDFs in the `static2/` folder. The system expects PDFs with this naming format:
```
[SEMESTER] SEM- ([SUBJECT]) '[BOOK TITLE]' by [AUTHOR].pdf
```

Example:
```
IV SEM- (COMP) 'Computer Fundamentals- Architecture and Organization' by B. Ram.pdf
V SEM- (AI) 'The Quest for Artificial Intelligence' by Nils J. Nilsson.pdf
```

## 🎮 Running the Application

### Start Backend (Flask API)

```bash
python app.py
```

The backend will automatically:
- ✅ Check available Google Gemini models
- ✅ Find an available port (5001, 5002, 5003, etc.)
- ✅ Display the API URL

### Start Frontend (Next.js)

```bash
cd eduvision-app
npm run dev
```

Frontend runs on: http://localhost:3000

## 📁 Project Structure

```
EduVision/
├── app.py                 # Flask backend with RAG system
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables (create this)
├── static2/              # PDF files storage
├── test_system.py        # Backend testing script
├── eduvision-app/        # Next.js frontend
│   ├── app/
│   │   ├── page.tsx      # Login page
│   │   ├── home/         # Branch selection
│   │   ├── semester/     # Semester selection  
│   │   ├── subjects/     # Subject selection
│   │   └── chat/         # Main chat interface
│   ├── components/       # Reusable UI components
│   └── package.json      # Frontend dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
GOOGLE_API_KEY=your_google_gemini_api_key
```

### Getting Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### Supported Subjects

The system currently supports these subjects:
- **COMP** - Computer Programming
- **DAA** - Data Structures & Algorithms  
- **OS** - Operating Systems
- **AI** - Artificial Intelligence
- **SE** - Software Engineering
- **ES** - Embedded Systems
- **OR** - Operations Research

## 🧪 Testing

### Test Backend

```bash
python test_system.py
```

### Test Individual Endpoints

```bash
# Health check
curl http://localhost:5001/health

# List available PDFs
curl http://localhost:5001/list-pdfs

# Test chat
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "CSE",
    "subject": "COMP",
    "semester": "4", 
    "question": "What is computer architecture?",
    "book": "Computer Fundamentals- Architecture and Organization",
    "author": "B. Ram"
  }'
```

## 🎯 Usage Flow

1. **Login**: Use any `@mjcollege.ac.in` email
2. **Select Branch**: Choose your engineering branch (CSE, AI-DS, IT)
3. **Pick Semester**: Select current semester (1-8)
4. **Choose Subject**: Pick from available subjects
5. **Select Book**: Choose from real textbooks in curriculum
6. **Ask Questions**: Get AI-powered answers from your PDFs!

## 🔍 API Endpoints

### Backend (Flask)

- `GET /` - API status
- `GET /health` - Health check
- `GET /test` - System diagnostics
- `GET /list-pdfs` - Available PDF files
- `GET /models` - Available Gemini models
- `POST /load-pdf` - Load specific PDF
- `POST /query` - Query loaded PDF
- `POST /chat` - Complete chat endpoint (main)

### Frontend (Next.js)

- `/` - Login page
- `/home` - Branch selection
- `/semester` - Semester selection
- `/subjects` - Subject selection
- `/chat` - Main chat interface

## 🛠️ Troubleshooting

### Backend Issues

```bash
# Check if backend is running
curl http://localhost:5001/health

# View backend logs
tail -f backend.log

# Test Google API connection
curl http://localhost:5001/models
```

### Frontend Issues

```bash
# Clear frontend cache
cd eduvision-app
rm -rf .next
npm run dev

# Check browser console for errors
# Open Developer Tools → Console
```

### Common Issues

1. **Port already in use**: Backend automatically finds available ports
2. **Google API errors**: Check your API key in `.env`
3. **PDF not found**: Ensure correct naming format in `static2/`
4. **Connection refused**: Make sure backend is running first

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **LangChain** for RAG framework
- **Next.js** for frontend framework
- **Flask** for backend API
- **MJ College** for educational support

## 📞 Support

For issues and questions:
- Open an [Issue](https://github.com/mohdomer/EduVision/issues)
- Email: support@eduvision.ai

---

**Made with ❤️ for MJ College Students**

*Empowering education through AI* 🚀