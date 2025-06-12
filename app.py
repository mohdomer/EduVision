from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import logging
import re
import socket

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    logging.warning("GOOGLE_API_KEY not found in environment variables")

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGSystem:
    def __init__(self):
        self.vector_store = None
        self.current_pdf = None
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        
    def get_pdf_text(self, pdf_path):
        """Extract text from PDF file"""
        text = ""
        try:
            pdf_reader = PdfReader(pdf_path)
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            logger.error(f"Error reading PDF {pdf_path}: {str(e)}")
            return None

    def get_text_chunks(self, text):
        """Split text into chunks"""
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
        chunks = text_splitter.split_text(text)
        return chunks

    def create_vector_store(self, text_chunks):
        """Create and save vector store"""
        try:
            self.vector_store = FAISS.from_texts(text_chunks, embedding=self.embeddings)
            self.vector_store.save_local("faiss_index")
            return True
        except Exception as e:
            logger.error(f"Error creating vector store: {str(e)}")
            return False

    def get_conversational_chain(self):
        """Create conversational chain"""
        prompt_template = """
        Context:\n {context}\n
        Question: \n{question}\n

        Answer the question based on the context provided. If you cannot find the answer in the context, say "I don't have enough information in the provided context to answer this question."

        Answer:
        """

        try:
            model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)
            prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
            
            try:
                chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
                return chain
            except Exception as e:
                logger.error(f"Error creating chain with custom prompt: {e}")
                # Fallback to default chain
                return load_qa_chain(model, chain_type="stuff")
        except Exception as e:
            logger.error(f"Error creating Google Generative AI model: {e}")
            raise Exception(f"Failed to initialize Gemini model: {str(e)}")

    def load_and_process_pdf(self, pdf_path):
        """Load and process PDF for RAG"""
        try:
            if not os.path.exists(pdf_path):
                logger.error(f"PDF not found: {pdf_path}")
                return False
            
            # Extract text from PDF
            raw_text = self.get_pdf_text(pdf_path)
            if not raw_text:
                return False
            
            # Create text chunks
            text_chunks = self.get_text_chunks(raw_text)
            
            # Create vector store
            success = self.create_vector_store(text_chunks)
            if success:
                self.current_pdf = pdf_path
                logger.info(f"Successfully processed PDF: {pdf_path}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error processing PDF {pdf_path}: {str(e)}")
            return False

    def query(self, user_question):
        """Query the RAG system"""
        try:
            if not os.path.exists("faiss_index"):
                return {"error": "No PDF loaded. Please load a PDF first."}
            
            # Load vector store
            try:
                new_db = FAISS.load_local("faiss_index", self.embeddings, allow_dangerous_deserialization=True)
            except TypeError:
                # Fallback for older FAISS versions
                new_db = FAISS.load_local("faiss_index", self.embeddings)
            
            # Search for similar documents
            docs = new_db.similarity_search(user_question, k=3)
            
            # Try to get conversational chain response
            try:
                chain = self.get_conversational_chain()
                response = chain(
                    {"input_documents": docs, "question": user_question},
                    return_only_outputs=True
                )
                
                return {
                    "answer": response["output_text"],
                    "source_pdf": self.current_pdf
                }
            except Exception as chain_error:
                logger.error(f"Chain error: {str(chain_error)}")
                
                # Fallback: Use Google Gemini directly with context
                try:
                    context = "\n\n".join([doc.page_content for doc in docs])
                    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)
                    
                    prompt = f"""Context from the document:
{context}

Question: {user_question}

Based on the context provided above, please answer the question. If the context doesn't contain enough information to answer the question, please say so.

Answer:"""
                    
                    try:
                        direct_response = model.invoke(prompt)
                        return {
                            "answer": direct_response.content if hasattr(direct_response, 'content') else str(direct_response),
                            "source_pdf": self.current_pdf,
                            "note": "Response generated using direct model call (fallback mode)"
                        }
                    except Exception as direct_error:
                        logger.error(f"Direct model error: {str(direct_error)}")
                        
                        # Final fallback: Return context with explanation
                        if "not found" in str(direct_error).lower() or "404" in str(direct_error):
                            return {
                                "error": "Google Gemini API model not available. Please check your API key and model availability.",
                                "details": f"Model error: {str(direct_error)}",
                                "context_preview": context[:200] + "..." if len(context) > 200 else context
                            }
                        else:
                            return {"error": f"All query methods failed. Chain error: {str(chain_error)}, Direct error: {str(direct_error)}"}
                        
                except Exception as model_init_error:
                    logger.error(f"Model initialization error: {str(model_init_error)}")
                    return {
                        "error": "Failed to initialize Google Gemini model",
                        "details": str(model_init_error),
                        "suggestion": "Please check your GOOGLE_API_KEY and internet connection"
                    }
            
        except Exception as e:
            logger.error(f"Error querying RAG system: {str(e)}")
            return {"error": f"Error processing query: {str(e)}"}

# Initialize RAG system
rag_system = RAGSystem()

def check_available_models():
    """Check which Google Generative AI models are available"""
    try:
        models = genai.list_models()
        model_names = []
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                model_names.append(model.name)
        logger.info(f"Available Gemini models: {model_names}")
        
        # Check if our desired model is available
        desired_model = "models/gemini-2.0-flash"
        if desired_model in model_names:
            logger.info(f"✅ Model {desired_model} is available")
            return True
        else:
            logger.warning(f"❌ Model {desired_model} not found. Available models: {model_names}")
            return False
    except Exception as e:
        logger.error(f"Error checking available models: {str(e)}")
        return False

def find_available_port(preferred_ports):
    """Find an available port from a list of preferred ports"""
    for port in preferred_ports:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                logger.info(f"✅ Port {port} is available")
                return port
        except OSError:
            logger.warning(f"❌ Port {port} is already in use")
            continue
    
    # If no preferred port is available, find any available port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('localhost', 0))
        port = s.getsockname()[1]
        logger.info(f"✅ Using random available port: {port}")
        return port

def find_pdf_by_criteria(branch, subject, semester, book=None, author=None):
    """Find PDF in static2 folder based on criteria"""
    static_folder = "static2"
    
    if not os.path.exists(static_folder):
        logger.error(f"Static folder {static_folder} not found")
        return None
    
    # Convert semester to Roman numeral format
    semester_map = {
        "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V", 
        "6": "VI", "7": "VII", "8": "VIII"
    }
    
    roman_semester = semester_map.get(str(semester), str(semester))
    
    # List all PDF files
    try:
        pdf_files = [f for f in os.listdir(static_folder) if f.endswith('.pdf')]
    except Exception as e:
        logger.error(f"Error listing files in {static_folder}: {str(e)}")
        return None
    
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
    try:
        pdf_files = [f for f in os.listdir(static_folder) if f.endswith('.pdf')]
        return jsonify({"pdfs": pdf_files})
    except Exception as e:
        return jsonify({"error": f"Error listing PDFs: {str(e)}"}), 500

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
    try:
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
        
        logger.info(f"Chat request: {subject} - {book} by {author}")
        
        # Find and load PDF
        pdf_path = find_pdf_by_criteria(branch, subject, semester, book, author)
        
        if not pdf_path:
            available_pdfs = [f for f in os.listdir("static2") if f.endswith('.pdf')]
            return jsonify({
                "error": "No matching PDF found",
                "criteria": {
                    "branch": branch,
                    "subject": subject,
                    "semester": semester,
                    "book": book,
                    "author": author
                },
                "available_pdfs": available_pdfs[:5]  # Show first 5 for debugging
            }), 404
        
        # Load PDF if it's different from current one
        if rag_system.current_pdf != pdf_path:
            logger.info(f"Loading new PDF: {pdf_path}")
            success = rag_system.load_and_process_pdf(pdf_path)
            if not success:
                return jsonify({"error": "Failed to load PDF. Check server logs for details."}), 500
        
        # Query the system
        logger.info(f"Querying: {question}")
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
        
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/test', methods=['GET'])
def test():
    """Simple test endpoint"""
    return jsonify({
        "message": "Backend is working!",
        "google_api_configured": bool(os.getenv("GOOGLE_API_KEY")),
        "static2_exists": os.path.exists("static2"),
        "pdf_count": len([f for f in os.listdir("static2") if f.endswith('.pdf')]) if os.path.exists("static2") else 0,
        "model_available": check_available_models()
    })

@app.route('/models', methods=['GET'])
def list_available_models():
    """List available Google Generative AI models"""
    try:
        models = genai.list_models()
        model_info = []
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                model_info.append({
                    "name": model.name,
                    "display_name": model.display_name,
                    "description": getattr(model, 'description', 'No description'),
                    "supported_methods": model.supported_generation_methods
                })
        
        return jsonify({
            "available_models": model_info,
            "total_count": len(model_info),
            "desired_model_available": "models/gemini-2.0-flash" in [m["name"] for m in model_info]
        })
    except Exception as e:
        return jsonify({"error": f"Failed to list models: {str(e)}"}), 500

if __name__ == '__main__':
    # Check if static2 folder exists
    if not os.path.exists('static2'):
        logger.error("static2 folder not found!")
    else:
        logger.info("static2 folder found with PDF files")
    
    # Check if Google API key is set
    if not os.getenv("GOOGLE_API_KEY"):
        logger.error("GOOGLE_API_KEY not found in environment variables!")
    else:
        logger.info("Google API key configured")
        
        # Check available models
        logger.info("Checking available Gemini models...")
        try:
            if check_available_models():
                logger.info("✅ Gemini 2.0 Flash model is available")
            else:
                logger.warning("❌ Gemini 2.0 Flash model not available - will try anyway")
        except Exception as e:
            logger.warning(f"Could not check models: {e} - will try anyway")
    
    # Find an available port
    preferred_ports = [5001, 5002, 5003, 8000, 8001, 8080, 3001, 4000, 4001]
    port = find_available_port(preferred_ports)
    
    logger.info(f"🚀 Starting Flask server on port {port}")
    logger.info(f"📡 API will be available at: http://localhost:{port}")
    logger.info(f"💡 Update your frontend to use: http://localhost:{port}/chat")
    
    app.run(debug=True, host='0.0.0.0', port=port)