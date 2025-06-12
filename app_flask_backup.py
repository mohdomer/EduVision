from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
import logging
import re
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI (you'll need to set your API key)
# os.environ["OPENAI_API_KEY"] = "your-api-key-here"

class RAGSystem:
    def __init__(self):
        self.vectorstore = None
        self.qa_chain = None
        self.current_pdf = None
        
    def load_and_process_pdf(self, pdf_path):
        """Load and process a PDF file for RAG"""
        try:
            # Check if PDF exists
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"PDF not found: {pdf_path}")
            
            # Load PDF
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            texts = text_splitter.split_documents(documents)
            
            # Create embeddings and vector store
            embeddings = OpenAIEmbeddings()
            self.vectorstore = FAISS.from_documents(texts, embeddings)
            
            # Create QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=OpenAI(temperature=0),
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever()
            )
            
            self.current_pdf = pdf_path
            logger.info(f"Successfully loaded and processed PDF: {pdf_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error processing PDF {pdf_path}: {str(e)}")
            return False
    
    def query(self, question):
        """Query the RAG system"""
        if not self.qa_chain:
            return {"error": "No PDF loaded. Please load a PDF first."}
        
        try:
            response = self.qa_chain.run(question)
            return {"answer": response, "source_pdf": self.current_pdf}
        except Exception as e:
            logger.error(f"Error querying RAG system: {str(e)}")
            return {"error": f"Error processing query: {str(e)}"}

# Initialize RAG system
rag_system = RAGSystem()

def find_pdf_by_criteria(branch, subject, semester, book=None, author=None):
    """Find PDF in static2 folder based on criteria"""
    static_folder = "static2"
    
    # Convert semester to Roman numeral format
    semester_map = {
        "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V", 
        "6": "VI", "7": "VII", "8": "VIII"
    }
    
    roman_semester = semester_map.get(str(semester), str(semester))
    
    # List all PDF files
    pdf_files = [f for f in os.listdir(static_folder) if f.endswith('.pdf')]
    
    # Filter by semester and subject
    matching_files = []
    for file in pdf_files:
        if f"{roman_semester} SEM" in file and f"({subject.upper()})" in file:
            matching_files.append(file)
    
    # If book and author are specified, try to find exact match
    if book and author:
        for file in matching_files:
            if book.lower() in file.lower() and author.lower() in file.lower():
                return os.path.join(static_folder, file)
    
    # Return first matching file if no exact match
    if matching_files:
        return os.path.join(static_folder, matching_files[0])
    
    return None

@app.route('/')
def home():
    return jsonify({"message": "RAG System API is running", "status": "online"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "current_pdf": rag_system.current_pdf})

@app.route('/list-pdfs')
def list_pdfs():
    """List all available PDFs"""
    static_folder = "static2"
    pdf_files = [f for f in os.listdir(static_folder) if f.endswith('.pdf')]
    return jsonify({"pdfs": pdf_files})

@app.route('/load-pdf', methods=['POST'])
def load_pdf():
    """Load a specific PDF for RAG"""
    data = request.get_json()
    
    if 'pdf_path' in data:
        # Direct PDF path
        pdf_path = data['pdf_path']
    else:
        # Find PDF by criteria
        branch = data.get('branch')
        subject = data.get('subject')
        semester = data.get('semester')
        book = data.get('book')
        author = data.get('author')
        
        if not all([branch, subject, semester]):
            return jsonify({"error": "Missing required parameters: branch, subject, semester"}), 400
        
        pdf_path = find_pdf_by_criteria(branch, subject, semester, book, author)
        
        if not pdf_path:
            return jsonify({"error": "No matching PDF found for the given criteria"}), 404
    
    # Load the PDF
    success = rag_system.load_and_process_pdf(pdf_path)
    
    if success:
        return jsonify({
            "message": "PDF loaded successfully",
            "pdf_path": pdf_path,
            "status": "ready"
        })
    else:
        return jsonify({"error": "Failed to load PDF"}), 500

@app.route('/query', methods=['POST'])
def query():
    """Query the RAG system"""
    data = request.get_json()
    
    if 'question' not in data:
        return jsonify({"error": "Missing 'question' parameter"}), 400
    
    question = data['question']
    response = rag_system.query(question)
    
    return jsonify(response)

@app.route('/chat', methods=['POST'])
def chat():
    """Complete endpoint for eduvision-app integration"""
    data = request.get_json()
    
    # Required parameters
    required_params = ['branch', 'subject', 'semester', 'question']
    missing_params = [param for param in required_params if param not in data]
    
    if missing_params:
        return jsonify({"error": f"Missing required parameters: {', '.join(missing_params)}"}), 400
    
    branch = data['branch']
    subject = data['subject']
    semester = data['semester']
    question = data['question']
    book = data.get('book')
    author = data.get('author')
    
    # Find and load PDF
    pdf_path = find_pdf_by_criteria(branch, subject, semester, book, author)
    
    if not pdf_path:
        return jsonify({
            "error": "No matching PDF found",
            "criteria": {
                "branch": branch,
                "subject": subject,
                "semester": semester,
                "book": book,
                "author": author
            }
        }), 404
    
    # Load PDF if it's different from current one
    if rag_system.current_pdf != pdf_path:
        success = rag_system.load_and_process_pdf(pdf_path)
        if not success:
            return jsonify({"error": "Failed to load PDF"}), 500
    
    # Query the system
    response = rag_system.query(question)
    
    # Add metadata
    response['metadata'] = {
        "branch": branch,
        "subject": subject,
        "semester": semester,
        "book": book,
        "author": author,
        "pdf_used": pdf_path
    }
    
    return jsonify(response)

if __name__ == '__main__':
    # Check if static2 folder exists
    if not os.path.exists('static2'):
        logger.error("static2 folder not found!")
    else:
        logger.info("static2 folder found with PDF files")
    
    app.run(debug=True, host='0.0.0.0', port=5000)