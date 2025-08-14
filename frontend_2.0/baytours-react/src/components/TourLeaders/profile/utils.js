// Utils compartidos del perfil de Tour Leader
export const HEADER_BG = { backgroundColor: '#C0C9EE' };

export const formatDate = (s) => {
  if (!s) return '-';
  const str = String(s);
  if (str.length >= 10 && str[4] === '-' && str[7] === '-') {
    return str.slice(8, 10) + '-' + str.slice(5, 7) + '-' + str.slice(0, 4);
  }
  const dt = new Date(str);
  if (isNaN(dt)) return str;
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Normaliza cualquier entrada (YYYY-MM-DD o DD-MM-YYYY) a YYYY-MM-DD
export const toISODate = (s) => {
  if (!s) return '';
  const str = String(s);
  if (str.length >= 10 && str[2] === '-' && str[5] === '-') {
    return `${str.slice(6, 10)}-${str.slice(3, 5)}-${str.slice(0, 2)}`;
  }
  return str.slice(0, 10);
};

// Color pastel estable por circuito
export const colorForCircuit = (name) => {
  const s = String(name || 'NA');
  let hash = 0; for (let i=0;i<s.length;i++) hash = s.charCodeAt(i) + ((hash<<5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 85%)`;
};