import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { RootState } from "../store";
import type { FlowerSummary, FlowerCategory, RequestStatus } from "../types";

// Тип ответа от бэкенда (Go может вернуть с разным регистром)
interface FlowerSummaryResponse {
  id: string;
  name: string;
  description: string;
  currentAmount?: number;
  CurrentAmount?: number;
  targetAmount?: number;
  TargetAmount?: number;
  category?: string;
}

interface FlowersState {
  items: FlowerSummary[];
  status: RequestStatus;
  error: string | null;
  lastFetched: number | null;
}

const initialState: FlowersState = {
  items: [],
  status: "idle",
  error: null,
  lastFetched: null,
};

// ========================
// FETCH ALL FLOWERS
// ========================
export const fetchFlowers = createAsyncThunk<
  FlowerSummaryResponse[],
  { force?: boolean } | undefined,
  { state: RootState; rejectValue: string }
>(
  "flowers/fetchAll",
  async (_arg, { signal, rejectWithValue }) => {
    try {
      const response = await apiFetch("/api/flowers", { signal });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to fetch flowers: ${response.status}`);
      }

      const data = (await response.json()) as FlowerSummaryResponse[];
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
      const message = error instanceof Error ? error.message : "Unknown error fetching flowers";
      return rejectWithValue(message);
    }
  },
  {
    condition: (arg, { getState }) => {
      const state = getState();
      if (arg?.force) return true;
      if (state.flowers.status === "loading") return false;
      return state.flowers.items.length === 0;
    },
  }
);

// ========================
// CREATE FLOWER
// ========================
export const createFlower = createAsyncThunk<
  FlowerSummary,
  { name: string; description: string; targetAmount: number; category: FlowerCategory },
  { rejectValue: string }
>(
  "flowers/create",
  async (body, { rejectWithValue }): Promise<FlowerSummary> => {
    try {
      const response = await apiFetch("/api/flower", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const message = await response.text();
        throw rejectWithValue(message || `Failed to create flower: ${response.status}`);
      }

      const data = (await response.json()) as FlowerSummaryResponse;

      const current = data.currentAmount ?? data.CurrentAmount ?? 0;
      const target = data.targetAmount ?? data.TargetAmount ?? 1;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        currentAmount: current,
        targetAmount: target,
        category: (data.category as FlowerCategory) ?? "travel",
        progress: target > 0 ? current / target : 0,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error creating flower";
      throw rejectWithValue(message);
    }
  }
);

// ========================
// SLICE
// ========================
const flowersSlice = createSlice({
  name: "flowers",
  initialState,
  reducers: {
    clearFlowers(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // === FETCH FLOWERS ===
      .addCase(fetchFlowers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFlowers.fulfilled, (state, action: PayloadAction<FlowerSummaryResponse[]>) => {
        state.items = action.payload.map((flower) => {
          const current = flower.currentAmount ?? flower.CurrentAmount ?? 0;
          const target = flower.targetAmount ?? flower.TargetAmount ?? 1;

          return {
            id: flower.id,
            name: flower.name,
            description: flower.description,
            currentAmount: current,
            targetAmount: target,
            category: (flower.category as FlowerCategory) ?? "travel",
            progress: target > 0 ? current / target : 0,
          };
        });
        state.status = "succeeded";
        state.lastFetched = Date.now();
      })
      .addCase(fetchFlowers.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error =
          typeof action.payload === "string" ? action.payload : action.error.message ?? null;
      })

      // === CREATE FLOWER ===
      .addCase(createFlower.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createFlower.fulfilled, (state, action: PayloadAction<FlowerSummary>) => {
        state.items.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(createFlower.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error =
          typeof action.payload === "string" ? action.payload : action.error.message ?? null;
      });
  },
});

export const { clearFlowers } = flowersSlice.actions;
export const flowersReducer = flowersSlice.reducer;

// ========================
// SELECTORS
// ========================
export const selectFlowers = (state: RootState) => state.flowers.items;
export const selectFlowersStatus = (state: RootState) => state.flowers.status;
export const selectFlowersError = (state: RootState) => state.flowers.error;
