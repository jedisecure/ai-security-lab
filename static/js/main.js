// Main JavaScript functionality for the AI Security Lab - Security Hardened Version 1.2

// Global variables with proper initialization
let currentExample = null;
let examples = [];

// Security utilities
const Security = {
    // Rate limiting
    lastRequestTime: 0,
    REQUEST_THROTTLE: 1000, // 1 second between requests
    
    // Input validation
    validateApiResponse(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid API response format');
        }
        return true;
    },
    
    // Safe HTML creation for badges and elements
    createBadge(text, className) {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text; // Safe text assignment
        return span;
    },
    
    // CSRF token retrieval
    getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : null;
    },
    
    // Rate limiting check
    canMakeRequest() {
        const now = Date.now();
        if (now - this.lastRequestTime < this.REQUEST_THROTTLE) {
            return false;
        }
        this.lastRequestTime = now;
        return true;
    },
    
    // Safe error logging (no sensitive data)
    logError(message, context = '') {
        console.error(`[AI Security Lab] ${message}`, context ? `Context: ${context}` : '');
    }
};

// Initialize the lab interface
function initializeLab() {
    setupEventListeners();
    loadExamples();
}

// Set up event listeners
function setupEventListeners() {
    // Send message button
    const sendButton = document.getElementById('send-message');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Clear chat button
    const clearButton = document.getElementById('clear-chat');
    if (clearButton) {
        clearButton.addEventListener('click', clearChat);
    }
    
    // Load example button
    const loadButton = document.getElementById('load-example');
    if (loadButton) {
        loadButton.addEventListener('click', loadSelectedExample);
    }
    
    // Example list items
    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const exampleId = parseInt(this.getAttribute('data-example-id'));
            selectExample(exampleId);
        });
    });
    
    // Enter key support for textareas
    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Load examples from the server
function loadExamples() {
    // Examples are already loaded via template, but we can enhance them
    document.querySelectorAll('.example-item').forEach(item => {
        const exampleId = parseInt(item.getAttribute('data-example-id'));
        examples[exampleId] = {
            id: exampleId,
            element: item
        };
    });
}

// Select an example from the sidebar
function selectExample(exampleId) {
    currentExample = exampleId;
    
    // Update visual selection
    document.querySelectorAll('.example-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-example-id="${exampleId}"]`).classList.add('active');
    
    // Load example details
    loadExampleDetails(exampleId);
    
    // Show load button
    const loadButton = document.getElementById('load-example');
    if (loadButton) {
        loadButton.style.display = 'inline-block';
    }
}

// Load and display example details with security validation
function loadExampleDetails(exampleId) {
    // Input validation
    if (!exampleId || typeof exampleId !== 'number' || exampleId < 1) {
        showAlert('Invalid example ID', 'warning');
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Add CSRF token if available
    const csrfToken = Security.getCsrfToken();
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }
    
    fetch(`/api/example/${encodeURIComponent(exampleId)}`, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load example`);
            }
            return response.json();
        })
        .then(example => {
            try {
                Security.validateApiResponse(example);
                displayExampleDetails(example);
            } catch (validationError) {
                Security.logError('Invalid example data received', validationError.message);
                showAlert('Received invalid example data', 'danger');
            }
        })
        .catch(error => {
            Security.logError('Failed to load example details', error.message);
            showAlert('Unable to load example details. Please try again.', 'danger');
        });
}

// Display example details in the UI with proper validation and XSS protection
function displayExampleDetails(example) {
    // Validate required properties exist
    if (!example || typeof example !== 'object') {
        Security.logError('Invalid example object provided to displayExampleDetails');
        return;
    }
    
    const requiredFields = ['title', 'description', 'explanation'];
    for (const field of requiredFields) {
        if (!example[field] || typeof example[field] !== 'string') {
            Security.logError(`Missing or invalid ${field} in example data`);
            showAlert('Example data is incomplete', 'warning');
            return;
        }
    }
    
    const detailsCard = document.getElementById('example-details');
    const title = document.getElementById('example-title');
    const description = document.getElementById('example-description');
    const explanation = document.getElementById('example-explanation');
    const difficulty = document.getElementById('example-difficulty');
    const risk = document.getElementById('example-risk');
    const outcome = document.getElementById('example-outcome');
    
    // Validate elements exist before updating
    if (!detailsCard || !title || !description || !explanation) {
        Security.logError('Required DOM elements not found for example display');
        return;
    }
    
    // Safely set text content (prevents XSS)
    title.textContent = example.title;
    description.textContent = example.description;
    
    // Safe explanation handling - use textContent instead of innerHTML for security
    explanation.textContent = example.explanation;
    
    // Optional fields with validation
    if (difficulty && example.difficulty) {
        difficulty.textContent = example.difficulty;
    }
    
    if (risk && example.risk_level) {
        const riskLevel = example.risk_level;
        // Validate risk level is one of expected values
        const validRiskLevels = ['low', 'medium', 'high'];
        if (validRiskLevels.includes(riskLevel.toLowerCase())) {
            risk.textContent = riskLevel;
            risk.className = `badge bg-${getRiskLevelClass(riskLevel)}`;
        }
    }
    
    if (outcome && example.expected_outcome) {
        outcome.textContent = example.expected_outcome;
    }
    
    detailsCard.style.display = 'block';
}

// Load selected example into the input fields with security validation
function loadSelectedExample() {
    if (currentExample === null || typeof currentExample !== 'number') {
        showAlert('No valid example selected', 'warning');
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const csrfToken = Security.getCsrfToken();
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }
    
    fetch(`/api/example/${encodeURIComponent(currentExample)}`, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load example`);
            }
            return response.json();
        })
        .then(example => {
            try {
                Security.validateApiResponse(example);
                
                // Validate required fields
                if (!example.system_prompt || !example.injection_payload || !example.title) {
                    throw new Error('Example missing required fields');
                }
                
                const systemPrompt = document.getElementById('system-prompt');
                const userInput = document.getElementById('user-input');
                
                if (!systemPrompt || !userInput) {
                    throw new Error('Input elements not found');
                }
                
                // Safely set values (textarea.value is safe from XSS)
                systemPrompt.value = example.system_prompt;
                userInput.value = example.injection_payload;
                
                showAlert(`Loaded example: ${example.title}`, 'success');
            } catch (validationError) {
                Security.logError('Example validation failed', validationError.message);
                showAlert('Failed to load example data', 'danger');
            }
        })
        .catch(error => {
            Security.logError('Failed to load selected example', error.message);
            showAlert('Unable to load example. Please try again.', 'danger');
        });
}

// Send message to the API with comprehensive security measures
function sendMessage() {
    // Rate limiting check
    if (!Security.canMakeRequest()) {
        showAlert('Please wait before sending another request', 'warning');
        return;
    }
    
    const systemPromptElement = document.getElementById('system-prompt');
    const userInputElement = document.getElementById('user-input');
    
    if (!systemPromptElement || !userInputElement) {
        Security.logError('Required input elements not found');
        showAlert('Form elements not available', 'danger');
        return;
    }
    
    const systemPrompt = systemPromptElement.value.trim();
    const userInput = userInputElement.value.trim();
    
    // Enhanced input validation
    if (!userInput || userInput.length === 0) {
        showAlert('Please enter a message to test', 'warning');
        return;
    }
    
    if (!systemPrompt || systemPrompt.length === 0) {
        showAlert('Please enter a system prompt', 'warning');
        return;
    }
    
    // Length validation (prevent overly long inputs)
    if (userInput.length > 5000 || systemPrompt.length > 2000) {
        showAlert('Input too long. Please shorten your message.', 'warning');
        return;
    }
    
    // Show loading state
    showLoading(true);
    hideResults();
    
    // Prepare request data with validation
    const requestData = {
        message: userInput,
        system_prompt: systemPrompt,
        injection_type: 'user_input'
    };
    
    // Prepare headers with CSRF protection
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const csrfToken = Security.getCsrfToken();
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Send request with proper error handling
    fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Request failed`);
        }
        return response.json();
    })
    .then(data => {
        showLoading(false);
        try {
            Security.validateApiResponse(data);
            
            if (data.success) {
                displayResults(data);
            } else {
                const errorMessage = typeof data.error === 'string' ? data.error : 'Request failed';
                showAlert(errorMessage, 'danger');
            }
        } catch (validationError) {
            Security.logError('Invalid API response received', validationError.message);
            showAlert('Received invalid response from server', 'danger');
        }
    })
    .catch(error => {
        showLoading(false);
        Security.logError('API request failed', error.message);
        showAlert('Request failed. Please check your connection and try again.', 'danger');
    });
}

// Display the results of the injection test with comprehensive validation
function displayResults(data) {
    // Validate input data structure
    if (!data || typeof data !== 'object') {
        Security.logError('Invalid data provided to displayResults');
        showAlert('Invalid result data received', 'danger');
        return;
    }
    
    // Validate required fields
    if (!data.response || typeof data.response !== 'string') {
        Security.logError('Missing or invalid response in result data');
        showAlert('Invalid response data', 'danger');
        return;
    }
    
    if (!data.injection_analysis || typeof data.injection_analysis !== 'object') {
        Security.logError('Missing injection analysis in result data');
        showAlert('Analysis data unavailable', 'warning');
        return;
    }
    
    const resultsDiv = document.getElementById('results');
    const aiResponse = document.getElementById('ai-response');
    const riskBadge = document.getElementById('risk-badge');
    const successBadge = document.getElementById('success-badge');
    const detectedPatterns = document.getElementById('detected-patterns');
    const patternExplanation = document.getElementById('pattern-explanation');
    
    // Validate DOM elements exist
    if (!resultsDiv || !aiResponse) {
        Security.logError('Required result display elements not found');
        showAlert('Result display not available', 'danger');
        return;
    }
    
    // Safely display AI response (textContent prevents XSS)
    aiResponse.textContent = data.response;
    
    // Display risk level with validation
    if (riskBadge && data.injection_analysis.risk_level) {
        const riskLevel = data.injection_analysis.risk_level;
        if (typeof riskLevel === 'string') {
            const validRiskLevels = ['low', 'medium', 'high'];
            if (validRiskLevels.includes(riskLevel.toLowerCase())) {
                riskBadge.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
                riskBadge.className = `badge bg-${getRiskLevelClass(riskLevel)}`;
            }
        }
    }
    
    // Display injection success with validation
    if (successBadge && typeof data.injection_success === 'boolean') {
        const success = data.injection_success;
        successBadge.textContent = success ? 'Successful' : 'Failed';
        successBadge.className = `badge bg-${success ? 'danger' : 'success'}`;
    }
    
    // Display detected patterns with security validation
    if (detectedPatterns && data.injection_analysis && Array.isArray(data.injection_analysis.detected_patterns)) {
        const patterns = data.injection_analysis.detected_patterns;
        
        // Clear existing content safely
        detectedPatterns.innerHTML = '';
        
        if (patterns.length > 0) {
            // Validate and create elements safely
            patterns.forEach(pattern => {
                if (typeof pattern === 'string' && pattern.length > 0) {
                    const badge = Security.createBadge(formatPatternName(pattern), 'badge bg-info me-1 mb-1');
                    detectedPatterns.appendChild(badge);
                }
            });
        } else {
            const noPatternsSpan = document.createElement('span');
            noPatternsSpan.className = 'text-muted';
            noPatternsSpan.textContent = 'No specific patterns detected';
            detectedPatterns.appendChild(noPatternsSpan);
        }
    }
    
    // Display explanation with validation
    if (patternExplanation && data.injection_analysis.explanation) {
        if (typeof data.injection_analysis.explanation === 'string') {
            patternExplanation.textContent = data.injection_analysis.explanation;
        }
    }
    
    resultsDiv.style.display = 'block';
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Clear the chat interface
function clearChat() {
    const userInput = document.getElementById('user-input');
    const resultsDiv = document.getElementById('results');
    
    if (userInput) userInput.value = '';
    if (resultsDiv) resultsDiv.style.display = 'none';
    
    hideResults();
    showAlert('Chat cleared', 'info');
}

// Show/hide loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    const sendButton = document.getElementById('send-message');
    
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
    
    if (sendButton) {
        sendButton.disabled = show;
        if (show) {
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        } else {
            sendButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Test Injection';
        }
    }
}

// Hide results
function hideResults() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }
}

// Utility function to get CSS class for risk level
function getRiskLevelClass(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'success';
    }
}

// Format pattern names for display
function formatPatternName(pattern) {
    return pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Secure alert function with XSS protection
function showAlert(message, type = 'info') {
    // Input validation
    if (!message || typeof message !== 'string') {
        Security.logError('Invalid message provided to showAlert');
        return;
    }
    
    // Validate alert type
    const validTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    if (!validTypes.includes(type)) {
        type = 'info';
    }
    
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        // Fallback to container if alert-container doesn't exist
        const container = document.querySelector('.container-fluid') || document.querySelector('.container');
        if (!container) {
            Security.logError('No suitable container found for alert');
            return;
        }
    }
    
    // Create alert safely without innerHTML
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    
    // Create message text safely
    const messageText = document.createElement('span');
    messageText.textContent = message; // Safe text assignment
    
    // Create close button safely
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');
    
    // Assemble alert
    alertDiv.appendChild(messageText);
    alertDiv.appendChild(closeButton);
    
    const targetContainer = alertContainer || document.querySelector('.container-fluid') || document.querySelector('.container');
    if (alertContainer) {
        targetContainer.appendChild(alertDiv);
    } else {
        targetContainer.insertBefore(alertDiv, targetContainer.firstChild);
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Feedback functionality removed - now using Google Forms

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the lab page
    if (document.getElementById('send-message')) {
        initializeLab();
    }
    
    // Feedback form functionality removed - now using Google Forms
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// Export functions for global access
window.initializeLab = initializeLab;
window.sendMessage = sendMessage;
window.clearChat = clearChat;
window.loadSelectedExample = loadSelectedExample;
