import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// AI Initialization
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

// API Route for AI Inference
app.post("/api/inference", async (req, res) => {
  try {
    const { patientData, scores } = req.body;
    // Parse all patient vitals to numbers for correct comparison
    const vitals = {
      spo2: parseFloat(patientData.spo2) || 0,
      hr: parseFloat(patientData.hr) || 0,
      lactate: parseFloat(patientData.lactate) || 0,
      map: parseFloat(patientData.map) || 0,
      temp: parseFloat(patientData.temp) || 0,
      rr: parseFloat(patientData.rr) || 0,
      gcs: parseFloat(patientData.gcs) || 15,
      wbc: parseFloat(patientData.wbc) || 0,
      creatinine: parseFloat(patientData.creatinine) || 0,
      platelets: parseFloat(patientData.platelets) || 0,
      age: parseFloat(patientData.age) || 0,
      icu_stay: parseFloat(patientData.icu_stay) || 0,
    };

    // Determine clinical context from scores for the AI
    const sofaRisk = scores.sofa >= 8 ? 'critical' : scores.sofa >= 4 ? 'high' : scores.sofa >= 2 ? 'moderate' : 'low';
    const qsofaRisk = scores.qsofa >= 2 ? 'high' : 'low';
    const expectedMortality = scores.sofa >= 8 ? '50-80%' : scores.sofa >= 4 ? '20-40%' : scores.sofa >= 2 ? '5-15%' : '<5%';

    const prompt = `
      You are an advanced clinical ML inference engine for SepsisIQ·India.
      Your task is to generate ACCURATE, DATA-DRIVEN sepsis risk scores based STRICTLY on the patient vitals and pre-computed clinical scores below.
      
      CRITICAL RULES:
      1. You MUST return a VALID JSON object only — no markdown, no explanation outside JSON.
      2. All numeric fields (mortalityRisk, crRisk, deteriorationProb6h) must be actual numbers (0-100).
      3. Your risk scores MUST be consistent with the pre-computed clinical scores below. Do NOT inflate risk scores beyond what the data supports.
      4. If SOFA is low (0-2), mortalityRisk should be LOW (<15). If SOFA is 4-7, moderate (20-45). If SOFA >=8, high (50-80%).
      
      === PATIENT VITALS (Verified Numbers) ===
      - SpO2: ${vitals.spo2}%
      - Heart Rate: ${vitals.hr} bpm
      - MAP: ${vitals.map} mmHg
      - Temperature: ${vitals.temp}°C
      - Respiratory Rate: ${vitals.rr} breaths/min
      - GCS: ${vitals.gcs}
      - Lactate: ${vitals.lactate} mmol/L
      - WBC: ${vitals.wbc} x10³/μL
      - Creatinine: ${vitals.creatinine} mg/dL
      - Platelets: ${vitals.platelets} x10³/μL
      - Age: ${vitals.age} years
      - ICU Stay: ${vitals.icu_stay} days
      - Origin: ${patientData.origin || 'Unknown'}
      - Septic Shock: ${patientData.shock || 'No'}
      - Prior Carbapenem Use: ${patientData.prior_carbapenem || 'No'}
      - Comorbidities: ${Array.isArray(patientData.comorbidities) ? patientData.comorbidities.join(', ') || 'None' : 'None'}
      - Infection Source: ${patientData.source || 'Unknown'}
      
      === PRE-COMPUTED CLINICAL SCORES ===
      - SOFA Score: ${scores.sofa} → Risk Level: ${sofaRisk.toUpperCase()} (Expected mortality: ${expectedMortality})
      - qSOFA Score: ${scores.qsofa} → ${qsofaRisk === 'high' ? 'HIGH risk — sepsis screening positive' : 'Low risk — sepsis screening negative'}
      - APACHE II: ${scores.apacheII}
      - RISC Score: ${scores.risc}
      
      === REQUIRED OUTPUT FORMAT ===
      Return ONLY this JSON structure:
      {
        "mortalityRisk": <number 0-100, MUST align with SOFA score risk level above>,
        "crRisk": <number 0-100, probability of carbapenem-resistant organism; increase with prior carbapenem use, nosocomial, high SOFA>,
        "deteriorationProb6h": <number 0-100, probability of clinical deterioration in 6 hours>,
        "organisms": [
          { "name": "<organism name>", "likelihood": <number 0-100>, "crRiskLevel": "<High|Medium|Low>" }
        ],
        "recommendedRegimen": [
          { "drug": "<drug name>", "dose": "<dose>", "route": "<IV|PO|IM>", "frequency": "<e.g., q8h>", "rationale": "<clinical rationale>" }
        ],
        "cultureRecommendations": ["<recommendation 1>", "<recommendation 2>"],
        "escalationThresholds": ["<threshold 1>", "<threshold 2>"],
        "shapExplainability": {
          "riskIncreasing": [{ "factor": "<factor name>", "impact": <decimal 0-1> }],
          "protective": [{ "factor": "<factor name>", "impact": <decimal 0-1> }]
        },
        "clinicalReasoning": "<detailed clinical reasoning based on actual vitals above>"
      }
    `;

    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== "MY_OPENROUTER_API_KEY") {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "SepsisIQ India",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 1500,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (status ${response.status}): ${errorText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(`OpenRouter API returned error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("OpenRouter API returned empty response.");
      }
      return res.json(JSON.parse(content));
    } else if (ai) {
      const responseData = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mortalityRisk: { type: Type.NUMBER },
              crRisk: { type: Type.NUMBER },
              deteriorationProb6h: { type: Type.NUMBER },
              organisms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    likelihood: { type: Type.NUMBER },
                    crRiskLevel: { type: Type.STRING }
                  }
                }
              },
              recommendedRegimen: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    drug: { type: Type.STRING },
                    dose: { type: Type.STRING },
                    route: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    rationale: { type: Type.STRING }
                  }
                }
              },
              cultureRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              escalationThresholds: { type: Type.ARRAY, items: { type: Type.STRING } },
              shapExplainability: {
                type: Type.OBJECT,
                properties: {
                  riskIncreasing: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { factor: { type: Type.STRING }, impact: { type: Type.NUMBER } }
                    }
                  },
                  protective: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { factor: { type: Type.STRING }, impact: { type: Type.NUMBER } }
                    }
                  }
                }
              },
              clinicalReasoning: { type: Type.STRING }
            },
            required: ["mortalityRisk", "crRisk", "deteriorationProb6h", "organisms", "recommendedRegimen", "cultureRecommendations", "escalationThresholds", "shapExplainability", "clinicalReasoning"]
          }
        }
      });
      return res.json(JSON.parse(responseData.text || '{}'));
    }
    
    return res.status(500).json({ error: "No AI provider configured on server." });
  } catch (error: any) {
    console.error("Inference Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// API Route for Polishing Notes
app.post("/api/polish", async (req, res) => {
  try {
    const { note } = req.body;
    const prompt = `Polish this clinical note: ${note}`;
    
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== "MY_OPENROUTER_API_KEY") {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`OpenRouter Polish error (status ${response.status}): ${errorText}`);
        return res.send(note);
      }
      const data = await response.json();
      if (data.error) {
        console.warn(`OpenRouter Polish returned error: ${data.error.message || JSON.stringify(data.error)}`);
        return res.send(note);
      }
      return res.send(data.choices?.[0]?.message?.content || note);
    } else if (ai) {
      const responseData = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      return res.send(responseData.text || note);
    }
    return res.send(note);
  } catch (error) {
    console.error("Polishing Error:", error);
    const noteToReturn = req.body.note || "";
    return res.send(noteToReturn);
  }
});

// API Route for Inquiry Submissions
app.post("/api/inquiry", async (req, res) => {
  try {
    const inquiryData = req.body;
    const timestamp = new Date().toISOString();
    const submission = { ...inquiryData, timestamp, id: Date.now() };

    console.log("SepsisIQ: New Inquiry Received:", submission);

    try {
      const filePath = path.join(__dirname, "submissions.json");
      let submissions: any[] = [];
      
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        submissions = JSON.parse(fileContent);
      } catch (err) {}

      submissions.push(submission);
      await fs.writeFile(filePath, JSON.stringify(submissions, null, 2));
    } catch (fsError) {
      console.warn("SepsisIQ: Local persistence skipped (Read-only filesystem detected).", fsError);
    }

    return res.status(201).json({ success: true, message: "Inquiry received successfully (Logged to server)" });
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
