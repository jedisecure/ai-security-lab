// Main JavaScript functionality for the AI Security Lab

// Global variables
let currentExample = null;
let examples = [];

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

// Load and display example details
function loadExampleDetails(exampleId) {
    fetch(`/api/example/${exampleId}`)
        .then(response => response.json())
        .then(example => {
            displayExampleDetails(example);
        })
        .catch(error => {
            console.error('Error loading example:', error);
            showAlert('Failed to load example details', 'danger');
        });
}

// Display example details in the UI
function displayExampleDetails(example) {
    const detailsCard = document.getElementById('example-details');
    const title = document.getElementById('example-title');
    const description = document.getElementById('example-description');
    const explanation = document.getElementById('example-explanation');
    const difficulty = document.getElementById('example-difficulty');
    const risk = document.getElementById('example-risk');
    const outcome = document.getElementById('example-outcome');
    
    if (detailsCard && title && description && explanation) {
        title.textContent = example.title;
        description.textContent = example.description;
        
        // Render explanation as markdown
        if (typeof marked !== 'undefined') {
            explanation.innerHTML = marked.parse(example.explanation);
        } else {
            explanation.textContent = example.explanation;
        }
        
        if (difficulty) difficulty.textContent = example.difficulty;
        if (risk) {
            risk.textContent = example.risk_level;
            risk.className = `badge bg-${getRiskLevelClass(example.risk_level)}`;
        }
        if (outcome) outcome.textContent = example.expected_outcome;
        
        detailsCard.style.display = 'block';
    }
}

// Load selected example into the input fields
function loadSelectedExample() {
    if (currentExample === null) return;
    
    fetch(`/api/example/${currentExample}`)
        .then(response => response.json())
        .then(example => {
            const systemPrompt = document.getElementById('system-prompt');
            const userInput = document.getElementById('user-input');
            
            if (systemPrompt) systemPrompt.value = example.system_prompt;
            if (userInput) userInput.value = example.injection_payload;
            
            showAlert(`Loaded example: ${example.title}`, 'success');
        })
        .catch(error => {
            console.error('Error loading example:', error);
            showAlert('Failed to load example', 'danger');
        });
}

// Send message to the API
function sendMessage() {
    const systemPrompt = document.getElementById('system-prompt').value.trim();
    const userInput = document.getElementById('user-input').value.trim();
    
    if (!userInput) {
        showAlert('Please enter a message to test', 'warning');
        return;
    }
    
    if (!systemPrompt) {
        showAlert('Please enter a system prompt', 'warning');
        return;
    }
    
    // Show loading state
    showLoading(true);
    hideResults();
    
    // Prepare request data
    const requestData = {
        message: userInput,
        system_prompt: systemPrompt,
        injection_type: 'user_input'
    };
    
    // Send request
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayResults(data);
        } else {
            showAlert(data.error || 'An error occurred', 'danger');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Error:', error);
        showAlert('Failed to send message. Please try again.', 'danger');
    });
}

// Display the results of the injection test
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const aiResponse = document.getElementById('ai-response');
    const riskBadge = document.getElementById('risk-badge');
    const successBadge = document.getElementById('success-badge');
    const detectedPatterns = document.getElementById('detected-patterns');
    const patternExplanation = document.getElementById('pattern-explanation');
    
    if (resultsDiv && aiResponse) {
        // Display AI response
        aiResponse.textContent = data.response;
        
        // Display risk level
        if (riskBadge) {
            const riskLevel = data.injection_analysis.risk_level;
            riskBadge.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
            riskBadge.className = `badge bg-${getRiskLevelClass(riskLevel)}`;
        }
        
        // Display injection success
        if (successBadge) {
            const success = data.injection_success;
            successBadge.textContent = success ? 'Successful' : 'Failed';
            successBadge.className = `badge bg-${success ? 'danger' : 'success'}`;
        }
        
        // Display detected patterns
        if (detectedPatterns) {
            const patterns = data.injection_analysis.detected_patterns;
            if (patterns.length > 0) {
                detectedPatterns.innerHTML = patterns.map(pattern => 
                    `<span class="badge bg-info me-1 mb-1">${formatPatternName(pattern)}</span>`
                ).join('');
            } else {
                detectedPatterns.innerHTML = '<span class="text-muted">No specific patterns detected</span>';
            }
        }
        
        // Display explanation
        if (patternExplanation) {
            patternExplanation.textContent = data.injection_analysis.explanation;
        }
        
        resultsDiv.style.display = 'block';
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

// Show alert messages
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Find container and insert alert
    const container = document.querySelector('.container-fluid') || document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the lab page
    if (document.getElementById('send-message')) {
        initializeLab();
    }
    
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
