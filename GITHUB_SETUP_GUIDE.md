# GitHub Setup Guide for Beginners

This guide will help you upload your AI Security Lab to GitHub.

## Before You Start

Make sure you have:
- A GitHub account (create one at github.com if you don't have one)
- Git installed on your computer
- Your project files ready (you already have them in Replit)

## Method 1: Upload via GitHub Website (Easiest for Beginners)

### Step 1: Create a New Repository
1. Go to github.com and sign in
2. Click the green "New" button or the "+" icon in the top right
3. Choose "New repository"
4. Name your repository: `ai-security-lab`
5. Add description: "Educational platform for learning prompt injection techniques"
6. Choose "Public" (so others can see it)
7. Check "Add a README file"
8. Click "Create repository"

### Step 2: Upload Your Files
1. In your new repository, click "uploading an existing file"
2. Drag and drop all your project files OR click "choose your files"
3. Select all files from your Replit project:
   - All .py files (app.py, main.py, routes.py, injection_examples.py)
   - All template files (templates folder)
   - All static files (static folder)
   - Documentation files (README.md, CONTRIBUTING.md, etc.)
   - Configuration files (.gitignore, .env.example)
   
### Step 3: Commit Your Files
1. Scroll down to "Commit changes"
2. Write: "Initial upload of AI Security Lab"
3. Click "Commit changes"

## Method 2: Using Git Commands (More Advanced)

If you want to use Git commands:

```bash
# On your computer, clone the empty repository
git clone https://github.com/yourusername/ai-security-lab.git
cd ai-security-lab

# Copy all your files from Replit to this folder
# Then add and commit them
git add .
git commit -m "Initial upload of AI Security Lab"
git push origin main
```

## Method 3: Download from Replit and Upload

### Step 1: Download from Replit
1. In Replit, go to your project
2. Click the three dots menu
3. Choose "Download as zip"
4. Extract the zip file on your computer

### Step 2: Upload to GitHub
1. Create a new repository on GitHub (as in Method 1)
2. Upload the extracted files (as in Method 1, Step 2)

## Important Files to Include

Make sure you upload these key files:
- README.md (main documentation)
- All Python files (.py)
- templates/ folder (HTML files)
- static/ folder (CSS, JS files)
- CONTRIBUTING.md (contribution guidelines)
- LICENSE (open source license)
- SECURITY.md (security information)
- .gitignore (protects sensitive files)
- .env.example (environment setup example)

## Files NOT to Upload

Never upload:
- .env (contains your real API keys)
- __pycache__/ folders
- Any files with real secrets or passwords

## After Upload

Once uploaded, your repository will:
- Show your README.md as the main page
- Display your code for others to view and fork
- Allow others to contribute via pull requests
- Be searchable on GitHub

## Getting Help

If you run into issues:
1. Check GitHub's help documentation
2. Ask in GitHub Community forums
3. Watch YouTube tutorials on "How to upload to GitHub"

Your AI Security Lab is now ready to share with the world!