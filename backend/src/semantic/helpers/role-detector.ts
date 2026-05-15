import { SemanticRole } from '../../common/interfaces/semantic-role.interface';

// Regex patterns matched against lowercase column name
const ROLE_PATTERNS: Array<{ role: SemanticRole; pattern: RegExp }> = [
  { role: 'date', pattern: /date|time|period|month|year|day|week|quarter/ },
  {
    role: 'revenue',
    pattern: /revenue|sales|amount|income|turnover|gross|price/,
  },
  { role: 'profit', pattern: /profit|margin|net|ebit|ebitda/ },
  {
    role: 'discount',
    pattern: /discount|promo|rebate|reduction|avg.*discount|discount.*avg/,
  },
  {
    role: 'region',
    pattern: /region|country|city|area|zone|location|territory|market/,
  },
  { role: 'product', pattern: /product|item|sku|category|goods|service/ },
  { role: 'customer', pattern: /customer|client|buyer|account|user/ },
  {
    role: 'quantity',
    pattern: /qty|quantity|units|count|volume|pieces|orders/,
  },
  { role: 'plan', pattern: /plan|budget|target|forecast|expected|planned/ },
  { role: 'identifier', pattern: /id$|^id|code|number|num|key|uuid/ },
];

// Check if a value looks like a date string
function isDateLike(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const hasDateSeparator = /\d{2,4}[-/]\d{1,2}/.test(value);
  const parsesAsDate = !isNaN(Date.parse(value));
  return hasDateSeparator && parsesAsDate;
}

// Step 1: detect role by column name using regex patterns
function detectRoleByName(colName: string): SemanticRole {
  const lowerName = colName.toLowerCase().trim();

  for (const entry of ROLE_PATTERNS) {
    if (entry.pattern.test(lowerName)) {
      return entry.role;
    }
  }

  return 'unknown';
}

// Step 2: detect role by looking at actual cell values
// Only used when name-based detection returns 'unknown'
function detectRoleByValues(values: unknown[]): SemanticRole {
  const nonEmpty = values.filter(function (v) {
    return v !== null && v !== '' && v !== undefined;
  });

  if (nonEmpty.length === 0) {
    return 'unknown';
  }

  // If most values look like date strings — it is a date column
  const dateLikeCount = nonEmpty.filter(isDateLike).length;
  const dateLikeRatio = dateLikeCount / nonEmpty.length;
  if (dateLikeRatio > 0.7) {
    return 'date';
  }

  // Discount detection is unreliable by values alone (0-100 range
  // overlaps with age, score, quantity etc.) so we skip it here
  // and rely only on column name patterns above

  return 'unknown';
}

// Main function — tries name first, falls back to values
export function detectSemanticRole(
  colName: string,
  values: unknown[],
): SemanticRole {
  const roleByName = detectRoleByName(colName);

  if (roleByName !== 'unknown') {
    return roleByName;
  }

  return detectRoleByValues(values);
}
