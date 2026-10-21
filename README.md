# repoguard-Ai
RepoGuard AI
Automated AI-powered security reviews and vulnerability detection for GitHub pull requests. Built for the Nebius x NVIDIA Global AI Hackathon (Coding and Agentic Engineering Track).

RepoGuard AI automates code security audits during the pull request phase, giving developers instant, real-time vulnerability assessments and remediations directly on their GitHub PRs before any risky code gets merged into production.

 Live Links & Infrastructure
Frontend Dashboard (Netlify): https://repoguard-ai.netlify.app

Backend API (Render): https://repoguard-ai-h08c.onrender.com

Demo Video: RepoGuard AI – Automated GitHub PR Security Auditor (Demo)

Powered by Nebius Token Factory & NVIDIA
RepoGuard AI directly leverages Nebius Token Factory to run inference on NVIDIA Nemotron open-weights models (such as nvidia/nemotron-3-super-120b and nvidia/nemotron-nano).

GitHub PR Ingestion: The FastAPI backend fetches raw .patch diff files directly from public GitHub PR endpoints.

Nebius Token Factory Processing: The complete PR diff context is sent to Nebius Token Factory using an OpenAI-compatible endpoint ([https://api.tokenfactory.nebius.ai/v1](https://api.tokenfactory.nebius.ai/v1)) running NVIDIA Nemotron.

Structured Security Analysis: The NVIDIA model identifies security vulnerabilities (SQL Injections, API key/secret leaks, XSS, logic flaws) and returns structured JSON containing line-by-line file locations, severity grades (Critical, High, Medium, Low), and exact fix code snippets.

 Features
Instant PR Auditing: Paste any public GitHub Pull Request URL to trigger an automated security scan.

Real-time AI Security Review: Powered by NVIDIA Nemotron models hosted on Nebius Token Factory.

Interactive Code Diff Viewer: Visual syntax highlighting showing line additions, deletions, and line-by-line vulnerability highlights.

Security Scorecard: Generates an overall security score (0–100), issue counts, and actionable code fixes.

Developer-Centric UI: GitHub Light theme palette built with Next.js and Tailwind CSS.

Tech Stack
AI & Infrastructure: Nebius Token Factory API ([https://api.tokenfactory.nebius.ai/v1](https://api.tokenfactory.nebius.ai/v1)) running NVIDIA Nemotron models.

Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons (Deployed on Netlify).

Backend: Python, FastAPI, Uvicorn, GitHub REST API (Deployed on Render).

Quickstart & Local Setup Instructions
Prerequisites
Node.js (v18+) & npm

Python (v3.10+) & pip

1. Clone the Repository
git clone https://github.com/your-username/repoguard-ai.git

cd repoguard-ai

2. Backend Setup
cd backend

python -m venv venv

source venv/bin/activate  (On Windows: venv\Scripts\activate)

pip install -r requirements.txt

Set environment variables in backend/.env:
NEBIUS_API_KEY=your_nebius_token_factory_key

Run the backend server:
uvicorn main:app --reload --port 8000

3. Frontend Setup
cd ../frontend

npm install

npm run dev

Open http://localhost:3000 in your browser to test locally!
