const COUNTRY_ABBREVIATIONS: { [key: string]: string } = {
  'United States': 'USA',
  'United Kingdom': 'UK',
  'United Arab Emirates': 'UAE',
  'Russian Federation': 'Russia',
  'Dominican Republic': 'Dom. Rep.',
  'Czech Republic': 'Czechia',
  'South Africa': 'S. Africa',
  'New Zealand': 'NZ',
  'Netherlands': 'NL',
  'Switzerland': 'CH',
  'Australia': 'AUS',
  'Argentina': 'ARG',
  'Singapore': 'SG'
};

export const formatCountry = (country: string): string => {
  if (!country) return '';
  
  // Check predefined abbreviations first
  if (COUNTRY_ABBREVIATIONS[country]) {
    return COUNTRY_ABBREVIATIONS[country];
  }
  
  // If country name is longer than 12 characters and not in abbreviations
  if (country.length > 12) {
    return country.split(' ').map(word => word[0]).join('.');
  }
  
  return country;
};

export const formatLocation = (city?: string, country?: string): string => {
  if (!city && !country) return '';
  if (!city) return formatCountry(country!);
  if (!country) return city;
  
  return `${city}, ${formatCountry(country)}`;
}; 