import os

import json
import logging
from flask import render_template, request, jsonify, flash
from openai import OpenAI
import markdown

from app import app
from injection_examples import INJECTION_EXAMPLES, TUTORIAL_STEPS

# Initialize OpenAI client
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "demo-key")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY != "demo-key" else None

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    """Main landing page with overview of the lab"""
    return render_template('index.html')

@app.route('/lab')
def lab():
    """Interactive lab interface for testing prompt injections"""
    return render_template('lab.html', examples=INJECTION_EXAMPLES)

@app.route('/tutorial')
def tutorial():
    """Step-by-step tutorial on prompt injection techniques"""
    return render_template('tutorial.html', steps=TUTORIAL_STEPS)

@app.route('/api/chat', methods=['POST'])
def chat():
    """API endpoint for processing chat messages and prompt injections"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        system_prompt = data.get('system_prompt', 'You are a helpful assistant.')
        injection_type = data.get('injection_type', 'user_input')
        
        if not user_message:
            return jsonify({
                'error': 'Message is required',
                'success': False
            }), 400
        
        # Analyze the message for injection attempts
        injection_analysis = analyze_injection_attempt(user_message)
        
        # Get AI response
        ai_response = get_ai_response(system_prompt, user_message)
        
        # Determine if injection was successful
        injection_success = detect_injection_success(system_prompt, user_message, ai_response)
        
        return jsonify({
            'response': ai_response,
            'injection_analysis': injection_analysis,
            'injection_success': injection_success,
            'success': True
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': f'An error occurred: {str(e)}',
            'success': False
        }), 500

def get_ai_response(system_prompt, user_message):
    """Get response from OpenAI API or fallback demo responses"""
    if openai_client and OPENAI_API_KEY != "demo-key":
        try:
            # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
            # do not change this unless explicitly requested by the user
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return get_demo_response(user_message)
    else:
        return get_demo_response(user_message)

def get_demo_response(user_message):
    """Provide demo responses when OpenAI API is not available"""
    message_lower = user_message.lower()
    
    # Demo responses for common injection patterns
    if "ignore" in message_lower and "instruction" in message_lower:
        return "I understand you're trying to test prompt injection! This is a demo response showing how an AI might respond to injection attempts."
    
    elif "system" in message_lower or "prompt" in message_lower:
        return "Demo response: This appears to be a prompt injection attempt. In a real scenario, this might reveal system instructions or behave unexpectedly."
    
    elif "password" in message_lower or "secret" in message_lower:
        return "Demo response: I don't have access to any passwords or secrets. This injection attempt is trying to extract sensitive information."
    
    elif "roleplay" in message_lower or "pretend" in message_lower:
        return "Demo response: This injection uses social engineering to try to make me adopt a different role or behavior."
    
    else:
        return f"Demo response to: '{user_message}'. This is a simulated AI response for educational purposes."

def analyze_injection_attempt(message):
    """Analyze user input for common injection patterns"""
    patterns = {
        'instruction_override': ['ignore', 'forget', 'disregard', 'override'],
        'role_manipulation': ['roleplay', 'pretend', 'act as', 'you are now'],
        'system_probe': ['system prompt', 'instructions', 'what are you told'],
        'information_extraction': ['password', 'secret', 'confidential', 'reveal'],
        'delimiter_injection': ['---', '"""', "'''", '<system>', '</system>'],
        'context_switching': ['new conversation', 'restart', 'begin again']
    }
    
    detected_patterns = []
    message_lower = message.lower()
    
    for pattern_type, keywords in patterns.items():
        if any(keyword in message_lower for keyword in keywords):
            detected_patterns.append(pattern_type)
    
    return {
        'detected_patterns': detected_patterns,
        'risk_level': get_risk_level(detected_patterns),
        'explanation': get_pattern_explanation(detected_patterns)
    }

def get_risk_level(patterns):
    """Determine risk level based on detected patterns"""
    if len(patterns) >= 3:
        return 'high'
    elif len(patterns) >= 2:
        return 'medium'
    elif len(patterns) >= 1:
        return 'low'
    else:
        return 'safe'

def get_pattern_explanation(patterns):
    """Provide educational explanation of detected patterns"""
    explanations = {
        'instruction_override': 'Attempts to override or ignore system instructions',
        'role_manipulation': 'Tries to change the AI\'s role or behavior',
        'system_probe': 'Attempts to extract system prompts or instructions',
        'information_extraction': 'Tries to extract sensitive information',
        'delimiter_injection': 'Uses special characters to break prompt structure',
        'context_switching': 'Attempts to start a new conversation context'
    }
    
    if not patterns:
        return "No obvious injection patterns detected."
    
    return "; ".join([explanations.get(pattern, pattern) for pattern in patterns])

def detect_injection_success(system_prompt, user_message, ai_response):
    """Detect if the injection attempt was successful"""
    # This is a simplified detection - in reality, this would be more sophisticated
    response_lower = ai_response.lower()
    system_lower = system_prompt.lower()
    
    # Check if the AI revealed system instructions
    if any(word in response_lower for word in ['system prompt', 'instructions', 'told to']):
        return True
    
    # Check if the AI adopted a different role
    if "i am now" in response_lower or "i will now" in response_lower:
        return True
    
    # Check if normal behavior was overridden
    if "ignoring" in response_lower or "disregarding" in response_lower:
        return True
    
    return False

@app.route('/api/example/<int:example_id>')
def get_example(example_id):
    """Get a specific injection example"""
    if 0 <= example_id < len(INJECTION_EXAMPLES):
        return jsonify(INJECTION_EXAMPLES[example_id])
    else:
        return jsonify({'error': 'Example not found'}), 404

@app.errorhandler(404)
def not_found(error):
    return render_template('base.html', 
                         title='Page Not Found',
                         content='<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('base.html',
                         title='Internal Server Error', 
                         content='<h1>500 - Internal Server Error</h1><p>Something went wrong on our end.</p>'), 500
