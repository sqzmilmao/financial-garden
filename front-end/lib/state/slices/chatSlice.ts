import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { RootState } from "../store";
import type { ChatMessage, RequestStatus } from "../types";

interface ChatState {
  messagesByFlowerId: Record<string, ChatMessage[]>;
  statusByFlowerId: Record<string, RequestStatus>;
  errorByFlowerId: Record<string, string | null>;
}

const initialState: ChatState = {
  messagesByFlowerId: {},
  statusByFlowerId: {},
  errorByFlowerId: {},
};

interface SendMessageArgs {
  flowerId: string;
  userMessage: string;
}

// === Загрузка истории чата ===
export const fetchChatHistory = createAsyncThunk<
  { flowerId: string; messages: ChatMessage[] },
  string,
  { rejectValue: string }
>("chat/fetchHistory", async (flowerId, { rejectWithValue }) => {
  try {
    const response = await apiFetch(`/api/flower/show?id=${flowerId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch chat history for flower ${flowerId}: ${response.status}`);
    }

    const data = await response.json();
    const messages: ChatMessage[] = Array.isArray(data.chat)
      ? data.chat.map((m: any, i: number) => ({
          id: `${flowerId}-msg-${i}`,
          role: m.role,
          content: m.content,
        }))
      : [];

    return { flowerId, messages };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error fetching chat history";
    return rejectWithValue(message);
  }
});

// === Отправка сообщения ===
export const sendMessage = createAsyncThunk<
  { flowerId: string; messages: ChatMessage[] },
  SendMessageArgs,
  { state: RootState; rejectValue: { message: string } }
>("chat/sendMessage", async ({ flowerId, userMessage }, { rejectWithValue }) => {
  try {
    const response = await apiFetch(`/api/message?id=${flowerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "user",
        content: userMessage.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message for flower ${flowerId}: ${response.status}`);
    }

    // ✅ Универсальный парсинг (работает и для JSON, и для обычного текста)
    let textResponse: string;
    try {
      const data = await response.json();
      textResponse =
        typeof data === "string"
          ? data
          : data.content || JSON.stringify(data, null, 2);
    } catch {
      textResponse = await response.text();
    }

    // === Формируем ответ ассистента ===
    const assistantMessage: ChatMessage = {
      id: `${flowerId}-msg-${Date.now()}`,
      role: "assistant",
      content: textResponse.trim(),
    };

    return { flowerId, messages: [assistantMessage] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error sending message";
    return rejectWithValue({ message });
  }
});

// === Slice ===
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChat(state, action: { payload?: string }) {
      const id = action.payload;
      if (id) {
        delete state.messagesByFlowerId[id];
        delete state.statusByFlowerId[id];
        delete state.errorByFlowerId[id];
      } else {
        state.messagesByFlowerId = {};
        state.statusByFlowerId = {};
        state.errorByFlowerId = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // === FETCH CHAT ===
      .addCase(fetchChatHistory.pending, (state, action) => {
        const flowerId = action.meta.arg;
        state.statusByFlowerId[flowerId] = "loading";
        state.errorByFlowerId[flowerId] = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { flowerId, messages } = action.payload;
        state.messagesByFlowerId[flowerId] = messages;
        state.statusByFlowerId[flowerId] = "succeeded";
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        const flowerId = action.meta.arg;
        state.statusByFlowerId[flowerId] = "failed";
        state.errorByFlowerId[flowerId] = action.payload ?? action.error.message ?? null;
      })

      // === SEND MESSAGE ===
      .addCase(sendMessage.pending, (state, action) => {
        const { flowerId, userMessage } = action.meta.arg;
        const requestId = action.meta.requestId;

        // Оптимистическое добавление пользовательского сообщения
        const optimisticMessage: ChatMessage = {
          id: requestId,
          role: "user",
          content: userMessage,
        };

        if (!state.messagesByFlowerId[flowerId]) {
          state.messagesByFlowerId[flowerId] = [];
        }
        state.messagesByFlowerId[flowerId].push(optimisticMessage);
        state.statusByFlowerId[flowerId] = "loading";
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const { flowerId, messages } = action.payload;

        // Добавляем ответ ассистента, не стирая предыдущие сообщения
        const existing = state.messagesByFlowerId[flowerId] || [];
        state.messagesByFlowerId[flowerId] = [...existing, ...messages];
        state.statusByFlowerId[flowerId] = "succeeded";
      })

      .addCase(sendMessage.rejected, (state, action) => {
        const { flowerId } = action.meta.arg;
        const requestId = action.meta.requestId;
        const messages = state.messagesByFlowerId[flowerId];
        if (messages) {
          // Убираем оптимистическое сообщение, если ошибка
          state.messagesByFlowerId[flowerId] = messages.filter((m) => m.id !== requestId);
        }
        state.statusByFlowerId[flowerId] = "failed";
        state.errorByFlowerId[flowerId] = action.payload?.message ?? action.error.message ?? null;
      });
  },
});

// === Экспорты ===
export const { resetChat } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;

export const selectChatMessages = (state: RootState, flowerId: string) =>
  state.chat.messagesByFlowerId[flowerId] ?? [];

export const selectChatStatus = (state: RootState, flowerId: string): RequestStatus =>
  state.chat.statusByFlowerId[flowerId] ?? "idle";

export const selectChatError = (state: RootState, flowerId: string) =>
  state.chat.errorByFlowerId[flowerId] ?? null;
