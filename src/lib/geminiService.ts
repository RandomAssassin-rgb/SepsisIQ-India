/**
 * Generic clinical AI assessment service.
 * Communication with AI providers is handled server-side for security.
 */

export const runInference = async (patientData: any, scores: any) => {
  try {
    const response = await fetch("/api/inference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientData, scores }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server Inference Failed");
    }

    const rawData = await response.json();
    return normalizeInferenceData(rawData);
  } catch (err) {
    console.error("SepsisIQ: Server inference failed, falling back to mock:", err);
    return getMockInferenceData();
  }
};

/**
 * Ensures AI response data has all required fields and arrays to prevent UI crashes.
 */
function normalizeInferenceData(data: any) {
  return {
    mortalityRisk: typeof data.mortalityRisk === 'number' ? data.mortalityRisk : (parseFloat(data.mortalityRisk) || 0),
    crRisk: typeof data.crRisk === 'number' ? data.crRisk : (parseFloat(data.crRisk) || 0),
    deteriorationProb6h: typeof data.deteriorationProb6h === 'number' ? data.deteriorationProb6h : (parseFloat(data.deteriorationProb6h) || 0),
    organisms: Array.isArray(data.organisms) ? data.organisms : [],
    recommendedRegimen: Array.isArray(data.recommendedRegimen) ? data.recommendedRegimen : [],
    cultureRecommendations: Array.isArray(data.cultureRecommendations) ? data.cultureRecommendations : [],
    escalationThresholds: Array.isArray(data.escalationThresholds) ? data.escalationThresholds : [],
    shapExplainability: {
      riskIncreasing: Array.isArray(data.shapExplainability?.riskIncreasing) ? data.shapExplainability.riskIncreasing : [],
      protective: Array.isArray(data.shapExplainability?.protective) ? data.shapExplainability.protective : []
    },
    clinicalReasoning: data.clinicalReasoning || "Assessment completed."
  };
}

export const polishNote = async (note: string) => {
  try {
    const response = await fetch("/api/polish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });

    if (!response.ok) return note;
    return await response.text();
  } catch (err) {
    return note;
  }
};

function getMockInferenceData() {
  return {
    mortalityRisk: 35.5,
    crRisk: 58.2,
    deteriorationProb6h: 22.0,
    organisms: [
      { name: "Klebsiella pneumoniae", likelihood: 45, crRiskLevel: "High" },
      { name: "Escherichia coli", likelihood: 30, crRiskLevel: "Medium" },
      { name: "Acinetobacter baumannii", likelihood: 15, crRiskLevel: "High" }
    ],
    recommendedRegimen: [
      { drug: "Meropenem", dose: "2g", route: "IV", frequency: "q8h", rationale: "High suspicion of multi-drug resistant Gram-negative organisms." },
      { drug: "Colistin", dose: "9MU loading, then 4.5MU", route: "IV", frequency: "q12h", rationale: "Empirical cover for possible CRKP/CRAB given local epidemiology." }
    ],
    cultureRecommendations: ["Blood Culture x 2 sets", "Urine Culture", "Tracheal Aspirate Culture"],
    escalationThresholds: ["MAP < 65 mmHg despite fluids", "Lactate > 4 mmol/L", "Urine output < 0.5 mL/kg/hr for 6 hours"],
    shapExplainability: {
      riskIncreasing: [
        { factor: "Age > 65", impact: 12.5 },
        { factor: "Procalcitonin 8.4 ng/mL", impact: 15.2 },
        { factor: "GCS 12", impact: 8.4 }
      ],
      protective: [
        { factor: "Early Fluid Resuscitation", impact: -10.2 },
        { factor: "Broad-spectrum coverage initiated", impact: -5.4 },
        { factor: "Stable SpO2", impact: -3.1 }
      ]
    },
    clinicalReasoning: "The patient presents with several high-risk markers for sepsis... [Using Mock Data Fallback]"
  };
}
