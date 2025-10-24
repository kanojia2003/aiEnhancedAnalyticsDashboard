<!--
  AI-Enhanced Analytics Dashboard
  Professional README generated on 2025-10-24
-->

# AI-Enhanced Analytics Dashboard 🚀

> Turn raw data into actionable insights using AI-powered analytics, anomaly detection, and interactive dashboards.

## About the Project

A modern web application that combines rich data visualizations with AI-powered insights. The AI-Enhanced Analytics Dashboard helps analysts and product teams upload datasets or connect external APIs and automatically generate interactive dashboards, AI-based anomaly detection, trend predictions, and human-friendly summaries.

Why this project exists:

- Data teams often spend time wrangling and interpreting datasets before insights can be surfaced.
- This project shows how AI (OpenAI) can accelerate analysis and present concise, actionable narratives alongside charts.

Core idea — "AI-Enhanced Analytics":

- Combine programmatic data transformations and visualization (Recharts/Chart.js) with generative AI to produce summaries, anomaly explanations, and chart recommendations.
- Offer exportable reports (PDF/CSV/JSON) and an exploratory UI with an optional AI chat assistant to ask natural-language questions about the dataset.

## Tech Stack

- Frontend
  - React.js (functional components + hooks)
  - Tailwind CSS (utility-first styling)
  - Recharts / Chart.js (data visualization)
  - Framer Motion (animations / micro-interactions)

- AI Integration
  - OpenAI API (GPT-family) for insight generation, recommendations, and answer-to-question features

- Deployment
  - Frontend: Vercel

## Architecture Overview

High-level flow (textual diagram):

Frontend (React) ↔ OpenAI API

- User uploads CSV or connects data source from the UI.
- Frontend parses CSV (Papaparse) and shows previews.
- Frontend sends data (or a sampled subset) to the backend.
- Backend prepares prompts & calls OpenAI (rate-limited & retried with backoff).
- The AI returns structured insights (JSON) and suggested charts.
- Results and generated and returned to the UI.
- The UI renders visualizations, AI summaries, and allows export (PDF/CSV/JSON).


## Features

- Data Upload
  - Upload CSV files via drag-and-drop or file picker.
  - Client-side parsing and validation with PapaParse.

- Visualization
  - Create bar, line, pie, and scatter charts (Recharts/Chart.js).
  - Chart configurator for mapping columns to axes and choosing aggregations.

- AI Insight Generation
  - Automatically generate summaries, anomalies, correlations, and recommendations using OpenAI.
  - Suggest chart types and highlight interesting patterns.

- Natural Language Q&A
  - Ask questions about your dataset and receive concise natural-language answers plus references to data rows.

- Export & Reporting
  - Export dashboard and data as PDF, CSV, Excel (CSV as placeholder), or JSON.


## Setup & Installation

These instructions assume you have Node.js (>=16) and npm installed.

1) Clone the repo

2) Install frontend dependencies

npm install

3) Run the development server (frontend)

```bash
npm run dev

4) Build for production

```bash
npm run build

How to upload data and generate dashboards:

1. Open the app in your browser (e.g., http://localhost:5173).
2. Navigate to "Upload Data" and drag/drop or browse to a CSV file.
3. Inspect the parsed preview and adjust column types if needed.
4. Open the Chart Configurator to create one or more charts.
5. Click "Generate AI Insights" to run analysis (OpenAI API call).
6. Review AI insights and suggested charts. Save charts to the dashboard.
7. Export the report via the Reports page (PDF/CSV/JSON).

How AI insights are displayed:

- Summaries: Short human-readable paragraph with key metrics (top trends, anomalies, correlations).
- Anomalies: Row pointers with descriptions and suggested actions.
- Chart suggestions: Suggested chart types and configuration that make sense for the dataset.


## Environment Variables

Create a `.env` file at the project root and add the following values (example):

```bash
# .env.example
VITE_OPENAI_API_KEY=sk-REPLACE_ME
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_MAX_TOKENS=2000
VITE_OPENAI_TEMPERATURE=0.7
```

## Contact / Connect

- Developer: Neeraj Kanojia
- GitHub: https://github.com/kanojia2003
- LinkedIn: https://www.linkedin.com/in/neeraj-kanojia
- Email: neerajkanojia99@gmail.com
- Portfolio: https://neerajkanojia.netlify.app/