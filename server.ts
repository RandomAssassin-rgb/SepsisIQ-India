import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI Initialization
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Route for AI Inference
  app.post("/api/inference", async (req, res) => {
    try {
      const { patientData, scores } = req.body;
      const prompt = `
        You are an advanced clinical ML inference engine for SepsisIQ·India.
        Analyze the following patient data and pre-computed clinical scores to provide a comprehensive sepsis risk assessment.
        
        CRITICAL INSTRUCTION: You MUST return a VALID JSON object. All number fields must be actual numbers (0-100), not strings. All array fields must be populated with clinically relevant data based on the inputs.
        
        Patient Data:
        ${JSON.stringify(patientData, null, 2)}
        
        Pre-computed Scores:
        - SOFA Score: ${scores.sofa}
        - qSOFA Score: ${scores.qsofa}
        - APACHE II: ${scores.apache}
        - RISC Score: ${scores.risc}
        
        The patient's current vitals:
        - SPO2: ${patientData.vitals?.spo2}%
        - HR: ${patientData.vitals?.hr} bpm
        - Lactate: ${patientData.vitals?.lactate} mmol/L
        - MAP: ${patientData.vitals?.map} mmHg
        
        Expected JSON Structure Example:
        {
          "mortalityRisk": 42.5,
          "crRisk": 65.0,
          "deteriorationProb6h": 28.5,
          "organisms": [
            { "name": "Klebsiella pneumoniae", "likelihood": 45, "crRiskLevel": "High" }
          ],
          "recommendedRegimen": [
            { "drug": "Meropenem", "dose": "2g", "route": "IV", "frequency": "q8h", "rationale": "High SOFA and risk of CR Gram negatives" }
          ],
          "cultureRecommendations": ["Blood Culture x 2", "Urine Culture"],
          "escalationThresholds": ["MAP < 65 mmHg", "Lactate > 4"],
          "shapExplainability": {
            "riskIncreasing": [{ "factor": "Lactate 3.8", "impact": 0.15 }],
            "protective": [{ "factor": "Fluid Resuscitation", "impact": 0.05 }]
          },
          "clinicalReasoning": "Consistent with sepis/septic shock based on elevated SOFA and Lactate."
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
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });
        const data = await response.json();
        return res.json(JSON.parse(data.choices?.[0]?.message?.content || '{}'));
      } else if (ai) {
        // Use the same pattern as geminiService.ts with full schema enforcement
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
      
      res.status(500).json({ error: "No AI provider configured on server." });
    } catch (error: any) {
      console.error("Inference Error:", error);
      res.status(500).json({ error: error.message });
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
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await response.json();
        return res.send(data.choices?.[0]?.message?.content || note);
      } else if (ai) {
        const responseData = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });
        return res.send(responseData.text || note);
      }
      res.send(note);
    } catch (error) {
      console.error("Polishing Error:", error);
      const noteToReturn = req.body.note || "";
      res.send(noteToReturn);
    }
  });

  // API Route for Inquiry Submissions
  app.post("/api/inquiry", async (req, res) => {
    try {
      const inquiryData = req.body;
      const timestamp = new Date().toISOString();
      const submission = { ...inquiryData, timestamp, id: Date.now() };

      console.log("SepsisIQ: New Inquiry Received:", submission);

      // In production (Vercel), we cannot write to the local filesystem.
      // We'll attempt it but catch errors to prevent server crashes.
      try {
        const filePath = path.join(__dirname, "submissions.json");
        let submissions = [];
        
        try {
          const fileContent = await fs.readFile(filePath, "utf-8");
          submissions = JSON.parse(fileContent);
        } catch (err) {}

        submissions.push(submission);
        await fs.writeFile(filePath, JSON.stringify(submissions, null, 2));
      } catch (fsError) {
        console.warn("SepsisIQ: Local persistence skipped (Read-only filesystem detected).", fsError);
      }

      res.status(201).json({ success: true, message: "Inquiry received successfully (Logged to server)" });
    } catch (error) {
      console.error("Error processing inquiry:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
