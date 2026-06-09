export const calculateSOFA = (data: any) => {
  let score = 0;
  const spo2 = parseFloat(data.spo2) || 0;
  const platelets = parseFloat(data.platelets) || 0;
  const map = parseFloat(data.map) || 0;
  const gcs = parseFloat(data.gcs) || 15;
  const creatinine = parseFloat(data.creatinine) || 0;

  // Respiratory (PaO2/FiO2) - Simplified for demo
  if (spo2 > 0 && spo2 < 90) score += 2;
  else if (spo2 > 0 && spo2 < 95) score += 1;

  // Coagulation (Platelets)
  if (platelets > 0 && platelets < 50) score += 3;
  else if (platelets > 0 && platelets < 100) score += 2;
  else if (platelets > 0 && platelets < 150) score += 1;

  // Liver (Bilirubin) - Assuming normal if not provided
  
  // Cardiovascular (MAP)
  if (map > 0 && map < 70) score += 1;
  // If on vasopressors, score would be higher (2-4)

  // CNS (GCS)
  if (gcs < 6) score += 4;
  else if (gcs < 10) score += 3;
  else if (gcs < 13) score += 2;
  else if (gcs < 15) score += 1;

  // Renal (Creatinine)
  if (creatinine > 5.0) score += 4;
  else if (creatinine > 3.5) score += 3;
  else if (creatinine > 2.0) score += 2;
  else if (creatinine > 1.2) score += 1;

  return score;
};

export const calculateQSOFA = (data: any) => {
  let score = 0;
  const rr = parseFloat(data.rr) || 0;
  const gcs = parseFloat(data.gcs) || 15;
  const map = parseFloat(data.map) || 0;

  if (rr >= 22) score += 1;
  if (gcs < 15) score += 1;
  // Using MAP < 65 as a proxy for Systolic BP < 100 if SBP not available
  if (map > 0 && map < 65) score += 1; 
  return score;
};

export const calculateAPACHEII = (data: any) => {
  // Simplified APACHE II calculation for demo
  let score = 0;
  const temp = parseFloat(data.temp) || 0;
  const map = parseFloat(data.map) || 0;
  const hr = parseFloat(data.hr) || 0;
  const rr = parseFloat(data.rr) || 0;
  const age = parseFloat(data.age) || 0;
  const wbc = parseFloat(data.wbc) || 0;
  const creatinine = parseFloat(data.creatinine) || 0;
  const gcs = parseFloat(data.gcs) || 15;

  if (temp > 0 && (temp > 39 || temp < 36)) score += 2;
  if (map > 0 && map < 70) score += 2;
  if (hr > 110) score += 2;
  if (rr > 25) score += 1;
  if (age > 65) score += 5;
  else if (age > 45) score += 2;
  if (wbc > 0 && (wbc > 15 || wbc < 3)) score += 2;
  if (creatinine > 1.5) score += 2;
  
  return score + (15 - gcs);
};

export const calculateRISC = (data: any) => {
  // Custom RISC (Rapid Intervention Sepsis Cascades) Score
  let score = 0;
  const lactate = parseFloat(data.lactate) || 0;
  const icu_stay = parseFloat(data.icu_stay) || 0;

  if (lactate > 4.0) score += 4;
  else if (lactate > 2.0) score += 2;
  
  if (data.shock === 'Yes') score += 5;
  if (icu_stay > 5) score += 3;
  if (data.origin === 'Nosocomial') score += 2;
  if (data.comorbidities && data.comorbidities.length > 1) score += 2;
  
  return score;
};
