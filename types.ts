export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'rating' | 'dimension' | 'range';
export type ComparisonRule = 'higher_is_better' | 'lower_is_better' | 'equal' | 'none';

export interface ComparisonField {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  order: number;
  is_highlightable: boolean;
  highlight_color?: string; // Hex code
  highlight_icon?: string; // Icon name
  comparison_rule: ComparisonRule;
  options?: string[]; // For select type
}

export interface TVModel {
  id: string;
  brand: string;
  name: string;
  slug: string;
  images: string[];
  description?: string;
  specs: Record<string, any>; // Keyed by ComparisonField.id
}

export interface AppData {
  fields: ComparisonField[];
  models: TVModel[];
}

export type ViewMode = 'home' | 'compare' | 'admin';

// AI Response Types
export interface AIComparisonResult {
  summary: string;
  verdict: string;
}