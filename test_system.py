#!/usr/bin/env python3
"""
Test script to verify the RAG system is working properly
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001"

def test_endpoint(name, url, method="GET", data=None):
    """Test a single endpoint"""
    print(f"\n🧪 Testing {name}...")
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        else:
            response = requests.post(url, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {name} - Success")
            if "error" in result:
                print(f"⚠️  Warning: {result['error']}")
            return True, result
        else:
            print(f"❌ {name} - Failed with status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False, None
    except Exception as e:
        print(f"❌ {name} - Exception: {str(e)}")
        return False, None

def main():
    print("🚀 Testing EduVision RAG System")
    print("=" * 50)
    
    # Test 1: Health check
    success, _ = test_endpoint("Health Check", f"{BASE_URL}/health")
    if not success:
        print("❌ Backend is not running! Please start it with: python app.py")
        return
    
    # Test 2: Test endpoint
    success, result = test_endpoint("Backend Status", f"{BASE_URL}/test")
    if success:
        print(f"   📊 Google API: {'✅' if result.get('google_api_configured') else '❌'}")
        print(f"   📁 Static2 folder: {'✅' if result.get('static2_exists') else '❌'}")
        print(f"   📄 PDF count: {result.get('pdf_count', 0)}")
    
    # Test 3: List PDFs
    success, result = test_endpoint("List PDFs", f"{BASE_URL}/list-pdfs")
    if success and result.get('pdfs'):
        print(f"   📚 Found {len(result['pdfs'])} PDFs")
        print(f"   📖 Sample: {result['pdfs'][0][:50]}...")
    
    # Test 4: Load a PDF
    pdf_data = {
        "branch": "CSE",
        "subject": "COMP",
        "semester": "4",
        "book": "Computer Fundamentals- Architecture and Organization",
        "author": "B. Ram"
    }
    success, result = test_endpoint("Load PDF", f"{BASE_URL}/load-pdf", "POST", pdf_data)
    if success:
        print(f"   📁 Loaded: {result.get('pdf_path', 'Unknown')}")
    
    # Test 5: Query the system
    if success:  # Only if PDF loaded successfully
        query_data = {"question": "What is a computer?"}
        success, result = test_endpoint("Query System", f"{BASE_URL}/query", "POST", query_data)
        if success and not result.get('error'):
            answer = result.get('answer', '')
            print(f"   🤖 Answer preview: {answer[:100]}...")
        elif result and result.get('error'):
            print(f"   ⚠️  Query error: {result['error']}")
    
    # Test 6: Full chat endpoint
    chat_data = {
        "branch": "CSE",
        "subject": "COMP",
        "semester": "4",
        "question": "What is computer architecture?",
        "book": "Computer Fundamentals- Architecture and Organization",
        "author": "B. Ram"
    }
    success, result = test_endpoint("Full Chat", f"{BASE_URL}/chat", "POST", chat_data)
    if success and not result.get('error'):
        answer = result.get('answer', '')
        print(f"   🎯 Chat answer preview: {answer[:100]}...")
        if result.get('metadata'):
            print(f"   📋 PDF used: {result['metadata'].get('pdf_used', 'Unknown')}")
    elif result and result.get('error'):
        print(f"   ⚠️  Chat error: {result['error']}")
    
    print("\n" + "=" * 50)
    print("🏁 Testing completed!")
    print("\n💡 If you see errors, try:")
    print("   1. Restart the backend: python app.py")
    print("   2. Check your GOOGLE_API_KEY in .env")
    print("   3. Verify static2 folder has PDF files")

if __name__ == "__main__":
    main()