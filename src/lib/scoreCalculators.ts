export const calculateSOFA = (data: any) => {
  let score = 0;
  // Respiratory (PaO2/FiO2) - Simplified for demo
  if (data.spo2 < 90) score += 2;
  else if (data.spo2 < 95) score += 1;

  // Coagulation (Platelets)
  if (data.platelets < 50) score += 3;
  else if (data.platelets < 100) score += 2;
  else if (data.platelets < 150) score += 1;

  // Liver (Bilirubin) - Assuming normal if not provided
  
  // Cardiovascular (MAP)
  if (data.map < 70) score += 1;
  // If on vasopressors, score would be higher (2-4)

  // CNS (GCS)
  if (data.gcs < 6) score += 4;
  else if (data.gcs < 10) score += 3;
  else if (data.gcs < 13) score += 2;
  else if (data.gcs < 15) score += 1;

  // Renal (Creatinine)
  if (data.creatinine > 5.0) score += 4;
  else if (data.creatinine > 3.5) score += 3;
  else if (data.creatinine > 2.0) score += 2;
  else if (data.creatinine > 1.2) score += 1;

  return score;
};

export const calculateQSOFA = (data: any) => {
  let score = 0;
  if (data.rr >= 22) score += 1;
  if (data.gcs < 15) score += 1;
  // Using MAP < 65 as a proxy for Systolic BP < 100 if SBP not available
  if (data.map < 65) score += 1; 
  return score;
};

export const calculateAPACHEII = (data: any) => {
  // Simplified APACHE II calculation for demo
  let score = 0;
  if (data.temp > 39 || data.temp < 36) score += 2;
  if (data.map < 70) score += 2;
  if (data.hr > 110) score += 2;
  if (data.rr > 25) score += 1;
  if (data.age > 65) score += 5;
  else if (data.age > 45) score += 2;
  if (data.wbc > 15 || data.wbc < 3) score += 2;
  if (data.creatinine > 1.5) score += 2;
  
  return score + (15 - (data.gcs || 15));
};

export const calculateRISC = (data: any) => {
  // Custom RISC (Rapid Intervention Sepsis Cascades) Score
  let score = 0;
  if (data.lactate > 4.0) score += 4;
  else if (data.lactate > 2.0) score += 2;
  
  if (data.shock === 'Yes') score += 5;
  if (data.icu_stay > 5) score += 3;
  if (data.origin === 'Nosocomial') score += 2;
  if (data.comorbidities && data.comorbidities.length > 1) score += 2;
  
  return score;
};
