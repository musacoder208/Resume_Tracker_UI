import { streamUploadResumes } from '../api/candidateStream';
import type { StreamUploadRequest } from '../api/candidateStream';
import type { CandidateTab, UploadResumesResult } from '../types/candidate.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PersistedData {
  uploadResult: UploadResumesResult;
  activeTab: CandidateTab;
  selectedJd: string;
}

export interface UploadSessionState {
  uploadResult: UploadResumesResult | null;
  isStreaming: boolean;
  hasFailed: boolean;
  activeTab: CandidateTab;
  selectedJd: string;
  streamId: number;
}

// ── Internal module-level singletons ──────────────────────────────────────────

const SESSION_STORAGE_KEY = 'candidate_upload_session';

let abortController: AbortController | null = null;
const subscribers = new Set<() => void>();

const INITIAL: UploadSessionState = {
  uploadResult: null,
  isStreaming: false,
  hasFailed: false,
  activeTab: 'success',
  selectedJd: '',
  streamId: 0,
};

function loadFromStorage(): Partial<UploadSessionState> {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw == null) return {};
    const data = JSON.parse(raw) as PersistedData;
    return {
      uploadResult: data.uploadResult,
      activeTab: data.activeTab,
      selectedJd: data.selectedJd,
    };
  } catch {
    return {};
  }
}

let state: UploadSessionState = { ...INITIAL, ...loadFromStorage() };

function saveToStorage(): void {
  if (state.uploadResult == null) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  try {
    const data: PersistedData = {
      uploadResult: state.uploadResult,
      activeTab: state.activeTab,
      selectedJd: state.selectedJd,
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or storage unavailable — ignore
  }
}

function update(partial: Partial<UploadSessionState>): void {
  state = { ...state, ...partial };
  saveToStorage();
  subscribers.forEach((fn) => { fn(); });
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getSnapshot(): UploadSessionState {
  return state;
}

export function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}

export function setActiveTab(tab: CandidateTab): void {
  update({ activeTab: tab });
}

export function setSelectedJd(jdId: string): void {
  update({ selectedJd: jdId });
}

export function clearSession(): void {
  abortController?.abort();
  abortController = null;
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  update({ ...INITIAL });
}

export function startStream(request: StreamUploadRequest): void {
  abortController?.abort();
  const controller = new AbortController();
  abortController = controller;

  update({
    uploadResult: null,
    isStreaming: true,
    hasFailed: false,
    activeTab: 'success',
    streamId: state.streamId + 1,
  });
  sessionStorage.removeItem(SESSION_STORAGE_KEY);

  let successCount = 0;
  let duplicateCount = 0;
  let incompleteCount = 0;

  void streamUploadResumes(
    request,
    (result) => {
      if (result.status === 'success') successCount++;
      else if (result.status === 'duplicate') duplicateCount++;
      else incompleteCount++;

      const prev = state.uploadResult;
      const base: UploadResumesResult = prev ?? {
        successCandidates: [],
        duplicateCandidates: [],
        incompleteCandidates: [],
        rawItems: { successExtraction: [], duplicate: [], incomplete: [] },
      };

      let next: UploadResumesResult;
      if (result.status === 'success') {
        next = {
          ...base,
          successCandidates: [...base.successCandidates, result.candidate],
          rawItems: {
            ...base.rawItems,
            successExtraction: [...base.rawItems.successExtraction, result.raw],
          },
        };
      } else if (result.status === 'duplicate') {
        next = {
          ...base,
          duplicateCandidates: [...base.duplicateCandidates, result.candidate],
          rawItems: {
            ...base.rawItems,
            duplicate: [...base.rawItems.duplicate, result.raw],
          },
        };
      } else {
        next = {
          ...base,
          incompleteCandidates: [...base.incompleteCandidates, result.candidate],
          rawItems: {
            ...base.rawItems,
            incomplete: [...base.rawItems.incomplete, result.raw],
          },
        };
      }

      update({ uploadResult: next });
    },
    controller.signal,
  ).then(() => {
    const nextTab: CandidateTab =
      successCount > 0 ? 'success' : duplicateCount > 0 ? 'duplicate' : 'incomplete';
    update({ isStreaming: false, activeTab: nextTab });
  }).catch((err: unknown) => {
    if ((err as Error).name !== 'AbortError') {
      update({ isStreaming: false, hasFailed: true });
    }
  });
}
