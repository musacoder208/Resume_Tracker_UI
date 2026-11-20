import { baseApi } from '@/services/baseApi';
import type {
  ChatSession,
  ChatMessage,
  ChatResponse,
  ChatAskParams,
  ChatReplyParams,
} from '../types/chatAssistant.types';
import {
  mapChatSessionsResponse,
  mapChatMessagesResponse,
  mapChatCallResponse,
} from './chatAssistant.mappers';

// ask / reply wait for Python (it saves the message itself). Never retried — a retry
// would send the question twice. The timeout is a little above the backend's
// Python timeout so the backend's own error arrives first.
const PYTHON_CALL_OPTIONS = { skipRetry: true, timeout: 130_000 } as const;

export const chatAssistantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Left-side chat list, newest first
    getChatSessions: builder.query<ChatSession[], void>({
      query: () => ({
        url: 'chat/sessions',
        method: 'GET',
      }),
      transformResponse: mapChatSessionsResponse,
      providesTags: ['ChatSessions'],
    }),

    // History of one chat, as saved by Python
    getChatMessages: builder.query<ChatMessage[], string>({
      query: (sessionId) => ({
        url: `chat/sessions/${encodeURIComponent(sessionId)}/messages`,
        method: 'GET',
      }),
      transformResponse: mapChatMessagesResponse,
      providesTags: (_result, _error, sessionId) => [{ type: 'ChatMessages', id: sessionId }],
    }),

    // New question — sessionId null for the first question of a chat
    askChatQuestion: builder.mutation<ChatResponse, ChatAskParams>({
      query: ({ sessionId, question }) => ({
        url: 'chat/ask',
        method: 'POST',
        body: { session_id: sessionId, question },
      }),
      extraOptions: PYTHON_CALL_OPTIONS,
      transformResponse: mapChatCallResponse,
      invalidatesTags: ['ChatSessions'],
    }),

    // Answer to a confirm / select / clarify card
    replyToChatQuestion: builder.mutation<ChatResponse, ChatReplyParams>({
      query: ({ sessionId, questionId, newGeneratedQuestion, selected, text }) => ({
        url: 'chat/reply',
        method: 'POST',
        body: {
          session_id: sessionId,
          question_id: questionId,
          new_generated_question: newGeneratedQuestion,
          selected,
          text,
        },
      }),
      extraOptions: PYTHON_CALL_OPTIONS,
      transformResponse: mapChatCallResponse,
      invalidatesTags: ['ChatSessions'],
    }),
  }),
});

export const {
  useGetChatSessionsQuery,
  useGetChatMessagesQuery,
  useAskChatQuestionMutation,
  useReplyToChatQuestionMutation,
} = chatAssistantApi;
