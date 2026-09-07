import type {
  BuildingInstance,
  FarmState,
  Incident,
  PlayerKnowledgeMap,
  ProgressionObjective,
} from '@solar-grove/game-types';
import type { ServiceManagerState } from '@solar-grove/infrastructure-model';

export const SAVE_STORAGE_KEY = 'solar_grove_savegame_v1';
export const SAVE_VERSION = 1;

export interface SavedGameV1 {
  version: number;
  savedAt: number;
  farmState: FarmState;
  buildings: BuildingInstance[];
  objectives: ProgressionObjective[];
  knowledgeMap: PlayerKnowledgeMap;
  activeIncidents: Incident[];
  serviceManagerState: ServiceManagerState;
  incidentEngineState: [string, Incident][];
  freePlayMode?: boolean;
}

export function saveGame(data: Omit<SavedGameV1, 'version' | 'savedAt'>): boolean {
  try {
    const payload: SavedGameV1 = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      ...data,
    };
    const serialized = JSON.stringify(payload);
    localStorage.setItem(SAVE_STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save Solar Grove state:', err);
    return false;
  }
}

export function loadGame(): SavedGameV1 | null {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SavedGameV1;
    if (!parsed || typeof parsed !== 'object') {
      console.warn('Corrupted save data format: not an object');
      return null;
    }

    if (parsed.version !== SAVE_VERSION) {
      console.warn(`Unsupported save version: ${parsed.version}. Expected: ${SAVE_VERSION}`);
      return null;
    }

    // Basic schema validation
    if (!parsed.farmState || !Array.isArray(parsed.buildings) || !Array.isArray(parsed.objectives)) {
      console.warn('Corrupted save structure: missing essential farm or building keys');
      return null;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse saved game data:', err);
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear save storage:', err);
  }
}

export function hasSave(): boolean {
  try {
    return Boolean(localStorage.getItem(SAVE_STORAGE_KEY));
  } catch {
    return false;
  }
}
