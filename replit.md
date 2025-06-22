# AI Security Lab - Prompt Injection Training Platform

## Overview

This is an educational web application designed to teach users about prompt injection techniques in AI systems. Built with Flask and Python, it provides an interactive learning environment where users can explore different types of prompt injection attacks, understand their mechanics, and learn defensive strategies.

The platform serves as a controlled sandbox for cybersecurity education, helping developers and security professionals understand AI vulnerabilities without risking real systems.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **Styling**: Dark theme using Replit's Bootstrap theme with custom CSS
- **JavaScript**: Vanilla JavaScript for interactive features and AJAX communication
- **Components**: 
  - Landing page with feature overview
  - Interactive tutorial with step-by-step guidance
  - Lab environment for hands-on testing

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Structure**: Modular design with separate files for routes, examples, and configuration
- **Session Management**: Flask sessions with configurable secret key
- **API**: RESTful endpoints for chat functionality and injection testing

### Key Design Patterns
- **MVC Pattern**: Clear separation between templates (views), routes (controllers), and data models
- **Factory Pattern**: App initialization in separate module to avoid circular imports
- **Configuration Management**: Environment-based configuration with fallback defaults

## Key Components

### Core Application Files
- **`app.py`**: Flask application factory and configuration
- **`main.py`**: Application entry point for development
- **`routes.py`**: URL routing and request handling logic
- **`injection_examples.py`**: Pre-built prompt injection examples and tutorial content

### Frontend Components
- **Templates**:
  - `base.html`: Common layout with navigation and Bootstrap integration
  - `index.html`: Landing page with feature overview
  - `lab.html`: Interactive testing environment
  - `tutorial.html`: Step-by-step learning interface
- **Static Assets**:
  - `custom.css`: Custom styling for dark theme and component spacing
  - `main.js`: JavaScript for AJAX communication and UI interactions

### Educational Content Structure
- **Injection Examples**: Categorized by difficulty (Beginner, Intermediate, Advanced)
- **Risk Assessment**: Color-coded risk levels (Low, Medium, High)
- **Tutorial Steps**: Progressive learning with explanations and hands-on practice

## Data Flow

### User Interaction Flow
1. User accesses landing page and chooses learning path
2. Tutorial mode: Progressive steps with theory and examples
3. Lab mode: Interactive testing with pre-built or custom prompts
4. Real-time feedback through AJAX calls to backend API

### API Communication
- **POST /api/chat**: Processes user messages and injection attempts
- **Request Format**: JSON with message, system_prompt, and injection_type
- **Response Format**: JSON with AI response and injection analysis
- **Error Handling**: Structured error responses with HTTP status codes

### Security Analysis Pipeline
1. Input validation and sanitization
2. Injection pattern detection and analysis
3. Risk assessment and categorization
4. Educational feedback generation

## External Dependencies

### Python Packages
- **Flask 3.1.1**: Web framework for routing and templating
- **OpenAI 1.90.0**: Integration with OpenAI API for AI responses
- **Gunicorn 23.0.0**: WSGI HTTP server for production deployment
- **psycopg2-binary 2.9.10**: PostgreSQL adapter (prepared for future database integration)
- **email-validator 2.2.0**: Email validation utilities
- **flask-sqlalchemy 3.1.1**: ORM for database operations (prepared for future use)

### Frontend Dependencies
- **Bootstrap 5**: UI framework with dark theme from Replit
- **Font Awesome 6.4.0**: Icon library for consistent iconography
- **Marked.js**: Markdown rendering for tutorial content

### Environment Configuration
- **OpenAI API Key**: Required for AI response generation
- **Session Secret**: Flask session security (configurable via environment)

## Deployment Strategy

### Development Environment
- **Runtime**: Python 3.11 with Nix package management
- **Development Server**: Flask's built-in server with debug mode
- **Hot Reload**: Automatic reloading on code changes

### Production Deployment
- **Server**: Gunicorn WSGI server with auto-scaling configuration
- **Binding**: 0.0.0.0:5000 with port reuse for better performance
- **Scaling**: Replit's autoscale deployment target for automatic resource management
- **Process Management**: Parallel workflow execution for multiple tasks

### Infrastructure Requirements
- **OpenSSL**: For secure communications
- **PostgreSQL**: Database server (prepared for future data persistence)
- **Environment Variables**: Secure configuration management

## Security Measures

### API Key Protection
- **Environment Variables**: OpenAI API key stored securely in Replit's environment system
- **No Hard-coding**: No secrets exposed in source code files
- **Git Protection**: `.gitignore` file prevents accidental exposure of sensitive files
- **Safe Fallbacks**: Demo responses when API key is unavailable

### Best Practices Implemented
- Secrets managed through Replit's secure environment
- `.env` file contains only placeholder values
- Git repository excludes all environment files
- Code uses `os.environ.get()` for secure key retrieval

## Changelog

- June 22, 2025: Initial setup and security hardening
  - Fixed import errors and startup issues
  - Implemented secure API key management
  - Added comprehensive `.gitignore` for security
  - Removed exposed secrets from version control
  - Created comprehensive GitHub documentation (README, CONTRIBUTING, LICENSE, SECURITY)

## User Preferences

Preferred communication style: Simple, everyday language.