// Valida CUI Guatemala: 13 dígitos; depto 01..22; municipio válido por depto.
const muniByDept: Record<string, number> = {
  '01': 17,
  '02': 8,
  '03': 16,
  '04': 16,
  '05': 13,
  '06': 14,
  '07': 19,
  '08': 8,
  '09': 24,
  '10': 21,
  '11': 9,
  '12': 30,
  '13': 32,
  '14': 21,
  '15': 8,
  '16': 17,
  '17': 14,
  '18': 5,
  '19': 11,
  '20': 11,
  '21': 7,
  '22': 17,
};
export function validateCui(cui: unknown) {
  const clean = String(cui ?? '').replace(/\D/g, '');
  if (!/^\d{13}$/.test(clean)) return { valid: false, reason: 'El CUI debe tener 13 dígitos.' };
  const dept = clean.slice(9, 11);
  const muni = clean.slice(11, 13);
  const maxMuni = muniByDept[dept];
  if (!maxMuni) return { valid: false, reason: 'Departamento inválido.' };
  const muniNum = Number(muni);
  if (muniNum < 1 || muniNum > maxMuni)
    return { valid: false, reason: 'Municipio inválido para el departamento.' };
  return { valid: true };
}

// Enmascara un CUI dejando visibles los últimos 4 dígitos.
// Ej: 1234567890101 -> ***-***-***-0101 o *********-0101 (según formato simple).
export function maskCui(cui: unknown, pretty: boolean = true): string {
  const clean = String(cui ?? '').replace(/\D/g, '');
  if (!clean) return '';
  const last4 = clean.slice(-4);
  if (pretty) {
    // Formato en bloques de 3-3-3-4 con guiones
    return `***-***-***-${last4}`;
  }
  // Formato continuo con asteriscos y últimos 4
  return `${'*'.repeat(Math.max(0, clean.length - 4))}${last4}`;
}
