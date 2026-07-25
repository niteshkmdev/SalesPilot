export type PhoneCountry = {
  iso2: string;
  name: string;
  dialCode: string;
};

/** Default country for new phone inputs. */
export const DEFAULT_PHONE_COUNTRY = "IN";

/**
 * Curated list of common countries. India is first (default).
 * Dial codes without leading "+".
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso2: "IN", name: "India", dialCode: "91" },
  { iso2: "US", name: "United States", dialCode: "1" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso2: "AU", name: "Australia", dialCode: "61" },
  { iso2: "BD", name: "Bangladesh", dialCode: "880" },
  { iso2: "CA", name: "Canada", dialCode: "1" },
  { iso2: "CN", name: "China", dialCode: "86" },
  { iso2: "DE", name: "Germany", dialCode: "49" },
  { iso2: "FR", name: "France", dialCode: "33" },
  { iso2: "ID", name: "Indonesia", dialCode: "62" },
  { iso2: "JP", name: "Japan", dialCode: "81" },
  { iso2: "LK", name: "Sri Lanka", dialCode: "94" },
  { iso2: "MY", name: "Malaysia", dialCode: "60" },
  { iso2: "NP", name: "Nepal", dialCode: "977" },
  { iso2: "NL", name: "Netherlands", dialCode: "31" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64" },
  { iso2: "PK", name: "Pakistan", dialCode: "92" },
  { iso2: "PH", name: "Philippines", dialCode: "63" },
  { iso2: "QA", name: "Qatar", dialCode: "974" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso2: "SG", name: "Singapore", dialCode: "65" },
  { iso2: "ZA", name: "South Africa", dialCode: "27" },
  { iso2: "KR", name: "South Korea", dialCode: "82" },
  { iso2: "ES", name: "Spain", dialCode: "34" },
  { iso2: "SE", name: "Sweden", dialCode: "46" },
  { iso2: "CH", name: "Switzerland", dialCode: "41" },
  { iso2: "TH", name: "Thailand", dialCode: "66" },
  { iso2: "TR", name: "Turkey", dialCode: "90" },
  { iso2: "VN", name: "Vietnam", dialCode: "84" },
];

export function getPhoneCountry(iso2: string): PhoneCountry {
  const found = PHONE_COUNTRIES.find((c) => c.iso2 === iso2);
  if (found) return found;
  return (
    PHONE_COUNTRIES.find((c) => c.iso2 === DEFAULT_PHONE_COUNTRY) ??
    PHONE_COUNTRIES[0]
  );
}

/**
 * Filter countries by name, ISO2, or dial code (with or without +).
 */
export function filterPhoneCountries(
  query: string,
  countries: PhoneCountry[] = PHONE_COUNTRIES,
): PhoneCountry[] {
  const q = query.trim().toLowerCase().replace(/^\+/, "");
  if (!q) return countries;

  return countries.filter((country) => {
    const name = country.name.toLowerCase();
    const iso = country.iso2.toLowerCase();
    const dial = country.dialCode.toLowerCase();
    return (
      name.includes(q) ||
      iso.includes(q) ||
      dial.includes(q) ||
      `+${dial}`.includes(query.trim().toLowerCase())
    );
  });
}
