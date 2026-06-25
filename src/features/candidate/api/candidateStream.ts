import { env } from '@/config/env';
import type {
  RawCandidateItem,
  RawDuplicateItem,
  SuccessCandidate,
  DuplicateCandidate,
  IncompleteCandidate,
} from '../types/candidate.types';
import { mapSuccessItem, mapDuplicateItem, mapIncompleteItem } from './candidate.mappers';

export interface StreamUploadRequest {
  positionTitle: string;
  jdId: number;
  files: File[];
}

export type StreamResult =
  | { status: 'success'; candidate: SuccessCandidate; raw: RawCandidateItem }
  | { status: 'duplicate'; candidate: DuplicateCandidate; raw: RawDuplicateItem }
  | { status: 'incomplete'; candidate: IncompleteCandidate; raw: RawCandidateItem };

export async function streamUploadResumes(
  request: StreamUploadRequest,
  onResult: (result: StreamResult) => void,
  signal?: AbortSignal,
): Promise<void> {
  const base = env.API_BASE_URL.endsWith('/') ? env.API_BASE_URL : `${env.API_BASE_URL}/`;
  const url = `${base}candidate/uploadResumesStream`;

  const formData = new FormData();
  formData.append('position_title', request.positionTitle);
  formData.append('jd_id', String(request.jdId));
  request.files.forEach((file) => { formData.append('files', file); });

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Stream upload failed: ${response.status}`);
  }

  if (response.body == null) {
    throw new Error('Response body is empty');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') return;

        try {
          const raw = JSON.parse(payload) as RawCandidateItem;
          const status = raw.status as 'success' | 'duplicate' | 'incomplete';

          if (status === 'success') {
            onResult({ status, candidate: mapSuccessItem(raw), raw });
          } else if (status === 'duplicate') {
            const dup = raw as RawDuplicateItem;
            onResult({ status, candidate: mapDuplicateItem(dup), raw: dup });
          } else {
            onResult({ status, candidate: mapIncompleteItem(raw), raw });
          }
        } catch {
          // malformed SSE line — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
