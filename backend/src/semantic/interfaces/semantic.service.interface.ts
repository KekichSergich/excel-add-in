import { SemanticProfile, SheetInput } from './semantic-profile.interface';

export interface ISemanticService {
  buildProfile(sheets: SheetInput[]): SemanticProfile;
}

// Injection token — used instead of the class name when injecting
export const SEMANTIC_SERVICE = 'SEMANTIC_SERVICE';
