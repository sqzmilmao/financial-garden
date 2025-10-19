import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { RootState } from "../store";
import type { RequestStatus } from "../types";

interface FlowerDetails {
  id: string;
  name: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  category?: string;
  goalProgress: number;
  chat: { role: string; content: string }[];
}

interface FlowerDetailsState {
  byId: Record<string, FlowerDetails | undefined>;
  statusById: Record<string, RequestStatus>;
  errorById: Record<string, string | null>;
}

const initialState: FlowerDetailsState = {
  byId: {},
  statusById: {},
  errorById: {},
};

// ========================
// FETCH FLOWER BY ID
// ========================
export const fetchFlowerById = createAsyncThunk<
  { id: string; details: FlowerDetails },
  { id: string; force?: boolean },
  { state: RootState; rejectValue: string }
>("flowerDetails/fetchById", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await apiFetch(`/api/flower/show?id=${id}`);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to fetch flower with id ${id}`);
    }

    const data = await response.json();

    // 🧩 Нормализация данных
    const current = data.currentAmount ?? data.CurrentAmount ?? 0;
    const target = data.targetAmount ?? data.TargetAmount ?? 1;
    const goalProgress = target > 0 ? current / target : 0;

    const details: FlowerDetails = {
      id: data.id ?? id,
      name: data.name ?? "Unknown",
      description: data.description ?? "",
      currentAmount: current,
      targetAmount: target,
      category: data.category ?? "unknown",
      goalProgress,
      chat: Array.isArray(data.chat) ? data.chat : [],
    };

    return { id, details };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error fetching flower";
    return rejectWithValue(message);
  }
});

// ========================
// SLICE
// ========================
const flowerDetailsSlice = createSlice({
  name: "flowerDetails",
  initialState,
  reducers: {
    clearFlowerDetails(state, action: PayloadAction<string | undefined>) {
      const id = action.payload;
      if (id) {
        delete state.byId[id];
        delete state.statusById[id];
        delete state.errorById[id];
      } else {
        state.byId = {};
        state.statusById = {};
        state.errorById = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlowerById.pending, (state, action) => {
        const id = action.meta.arg.id;
        state.statusById[id] = "loading";
        state.errorById[id] = null;
      })
      .addCase(fetchFlowerById.fulfilled, (state, action) => {
        const { id, details } = action.payload;
        state.byId[id] = details;
        state.statusById[id] = "succeeded";
        state.errorById[id] = null;
      })
      .addCase(fetchFlowerById.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.statusById[id] = "failed";
        state.errorById[id] = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { clearFlowerDetails } = flowerDetailsSlice.actions;
export const flowerDetailsReducer = flowerDetailsSlice.reducer;

// ========================
// SELECTORS
// ========================
export const selectFlowerDetails = (state: RootState, id: string) => state.flowerDetails.byId[id];
export const selectFlowerDetailsStatus = (state: RootState, id: string) =>
  state.flowerDetails.statusById[id] ?? "idle";
export const selectFlowerDetailsError = (state: RootState, id: string) =>
  state.flowerDetails.errorById[id] ?? null;
