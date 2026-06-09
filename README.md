<div align="center">

# 🧬 SepsisIQ·India

### Advanced AI-Powered Sepsis Risk Assessment & Antibiotic Stewardship Platform

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google)](https://openrouter.ai)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)

**SepsisIQ·India** is a mobile-first clinical AI decision-support platform purpose-built for India's ICU landscape. It delivers real-time sepsis mortality risk scoring, Carbapenem-Resistance (CR) probability, organism differentials, and personalized antibiotic regimen recommendations — all grounded in validated clinical scoring systems and powered by large language model inference.

</div>

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Inference Engine** | LLM-powered risk assessment via OpenRouter (Gemini 2.5 Flash) or native Google Gemini SDK |
| 📊 **Clinical Scoring** | Auto-computed SOFA, qSOFA, APACHE II, and custom RISC scores from patient vitals |
| 🦠 **Organism Differential** | Ranked probability list of suspected pathogens with CR risk level (High / Medium / Low) |
| 💊 **Antibiotic Regimen** | Weight-adjusted, India-specific antibiotic recommendations with clinical rationale |
| 📈 **SHAP Explainability** | Feature importance waterfall showing risk-increasing and protective factors |
| 🏥 **Ward View** | Real-time ICU patient board with risk stratification and alert badges |
| 📋 **EMR Progress Note** | Auto-generated clinical note with AI polishing via `/api/polish` |
| 🔔 **Alert System** | Automatic critical/warning alerts triggered by AI-computed risk thresholds |
| 🔒 **Secure Architecture** | All API keys stay server-side; client never touches AI credentials directly |
| 📱 **Mobile-First UI** | Designed for bedside tablet / smartphone use in Indian ICUs |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Vite + React)                │
│                                                          │
│  PatientInput → Inference (loading) → Results           │
│                      ↓                                  │
│           /api/inference (fetch)                         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               Express Server  (api/index.ts)             │
│                                                          │
│  1. Parse & validate all vitals (parseFloat)            │
│  2. Compute SOFA-based expected mortality range         │
│  3. Build grounded clinical prompt                      │
│  4. POST → OpenRouter  (google/gemini-2.5-flash)        │
│     OR  → Google GenAI SDK (gemini-1.5-flash fallback)  │
│  5. Return JSON { mortalityRisk, crRisk, organisms, … } │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 6, Framer Motion, Tailwind CSS |
| **Backend** | Node.js, Express, `tsx` runtime |
| **AI Provider** | OpenRouter API (primary) · Google GenAI SDK (fallback) |
| **AI Model** | `google/gemini-2.5-flash` via OpenRouter |
| **Deployment** | Vercel (Serverless Functions via `vercel.json` rewrites) |
| **Scoring** | SOFA · qSOFA · APACHE II · RISC (custom India-weighted) |

---

## 🩺 Clinical Scoring Logic

All scores are computed client-side from raw vitals before the AI call, giving the model verified, grounded numbers to reason from.

### SOFA Score
Computed from: SpO₂ (respiratory), Platelets (coagulation), MAP (cardiovascular), GCS (CNS), Creatinine (renal).

### qSOFA
Computed from: RR ≥ 22, GCS < 15, MAP < 65 (proxy for SBP ≤ 100).

### APACHE II (Simplified)
Computed from: Temperature, MAP, HR, RR, Age, WBC, Creatinine, GCS.

### RISC Score *(India-Specific Custom)*
Computed from: Lactate, Septic Shock status, ICU stay duration, Nosocomial origin, Comorbidity count.

> **Risk Thresholds used for AI grounding:**
> - SOFA 0–1 → Low risk, expected mortality < 5%
> - SOFA 2–3 → Moderate risk, expected mortality 5–15%
> - SOFA 4–7 → High risk, expected mortality 20–40%
> - SOFA ≥ 8 → Critical risk, expected mortality 50–80%

---

## 🚀 Local Development

### Prerequisites
- **Node.js** v18 or later
- An **OpenRouter API key** (recommended) **or** a **Google Gemini API key**

### 1. Clone & Install

```bash
git clone https://github.com/RandomAssassin-rgb/SepsisIQ-India
cd SepsisIQ-India
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Option A — OpenRouter (Recommended: broader model access, credit-based billing)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx

# Option B — Native Google Gemini SDK
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxx
```

> **Note:** If both keys are present, OpenRouter takes priority. If neither key is set, the app enters **Offline Simulation Mode** and shows placeholder data.

### 3. Run the App

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🌍 Vercel Deployment

1. **Push** your code to GitHub.
2. **Import** the repository in the [Vercel Dashboard](https://vercel.com/new).
3. Under **Project Settings → Environment Variables**, add:
   - `OPENROUTER_API_KEY` *(recommended)*  
   - or `GEMINI_API_KEY`
4. Click **Deploy** — Vercel auto-detects the `vercel.json` configuration.

### `vercel.json` (already configured)

The `vercel.json` rewrites all `/api/*` requests to the Express serverless function at `api/index.ts`, so your API keys never leave the server.

---

## 📁 Project Structure

```
SepsisIQ-India/
├── api/
│   └── index.ts              # Express server — AI inference endpoints
├── src/
│   ├── components/
│   │   ├── PatientInput.tsx   # Clinical data entry form with demo presets
│   │   ├── Inference.tsx      # ML loading screen + score computation
│   │   ├── Results.tsx        # Risk dashboard, SHAP charts, regimen
│   │   ├── Dashboard.tsx      # Home / overview
│   │   ├── WardView.tsx       # ICU patient board
│   │   ├── Alerts.tsx         # Critical alert feed
│   │   ├── OnCallView.tsx     # On-call physician view
│   │   ├── StewardshipDashboard.tsx  # Antibiotic stewardship analytics
│   │   ├── PatientTrajectory.tsx     # 72-hour risk timeline
│   │   ├── History.tsx        # Assessment history log
│   │   ├── Research.tsx       # Clinical reference panel
│   │   ├── Settings.tsx       # App configuration
│   │   ├── InquiryForm.tsx    # Contact / feedback form
│   │   └── Layout.tsx         # Navigation shell
│   ├── lib/
│   │   ├── geminiService.ts   # Client-side API call + normalization
│   │   └── scoreCalculators.ts # SOFA, qSOFA, APACHE II, RISC
│   ├── App.tsx
│   └── main.tsx
├── server.ts                  # Local dev server (Vite + Express)
├── vite.config.ts
├── vercel.json
├── .env.example
└── package.json
```

---

## 🔌 API Endpoints

### `POST /api/inference`

Runs the full sepsis AI assessment.

**Request body:**
```json
{
  "patientData": {
    "name": "Rajesh Sharma",
    "age": "42",
    "spo2": "88",
    "hr": "124",
    "map": "58",
    "temp": "38.4",
    "rr": "28",
    "gcs": "13",
    "lactate": "4.2",
    "wbc": "18.5",
    "creatinine": "2.1",
    "platelets": "95",
    "shock": "Yes",
    "origin": "Nosocomial",
    "source": "Lung",
    "prior_carbapenem": "Yes",
    "comorbidities": ["Diabetes"]
  },
  "scores": {
    "sofa": 8,
    "qsofa": 2,
    "apacheII": 18,
    "risc": 12
  }
}
```

**Response:**
```json
{
  "mortalityRisk": 74.5,
  "crRisk": 83.0,
  "deteriorationProb6h": 61.2,
  "organisms": [
    { "name": "Klebsiella pneumoniae", "likelihood": 50, "crRiskLevel": "High" }
  ],
  "recommendedRegimen": [
    { "drug": "Polymyxin B", "dose": "1.5 mg/kg IV q12h", "route": "IV", "frequency": "q12h", "rationale": "High CR risk, prior carbapenem exposure" }
  ],
  "cultureRecommendations": ["Blood Culture x 2 sets", "Tracheal Aspirate"],
  "escalationThresholds": ["MAP < 65 mmHg", "Lactate > 5 mmol/L"],
  "shapExplainability": {
    "riskIncreasing": [{ "factor": "Septic Shock", "impact": 0.24 }],
    "protective": [{ "factor": "Young Age (42y)", "impact": 0.05 }]
  },
  "clinicalReasoning": "Patient presents with septic shock..."
}
```

### `POST /api/polish`

Polishes a raw clinical progress note using AI.

**Request:** `{ "note": "raw clinical note text" }`  
**Response:** `"Polished note text..."`

### `POST /api/inquiry`

Logs a contact/feedback form submission.

### `GET /api/health`

Returns `{ "status": "ok" }` — used for uptime monitoring.

---

## 🛡️ Offline / Simulation Mode

If no API key is configured (or the AI call fails), the app enters **Offline Simulation Mode**:

- The Results page shows an amber warning banner: *"Offline Simulation Mode"*
- Clinical scores (SOFA, qSOFA, APACHE II, RISC) are still computed from the patient's vitals
- AI-generated fields (organisms, regimen, SHAP) show "AI Offline" placeholder data
- **No false risk inflation** — fallback mortality risk is `0%`, not a hardcoded critical value

---

## 🤝 Contributing

Contributions are welcome! This platform is focused on improving sepsis outcomes in India. If you have clinical expertise, UX feedback, or engineering ideas:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a Pull Request

---

## ⚠️ Medical Disclaimer

> **SepsisIQ·India is a clinical decision-support tool and is NOT a substitute for professional medical judgment.** All AI-generated recommendations must be reviewed by a qualified clinician before being applied to patient care. The platform is intended to augment — not replace — clinical expertise.

---

## 📄 License

MIT License © 2025 SepsisIQ·India

---

<div align="center">
Made with ❤️ for Indian ICUs
</div>
