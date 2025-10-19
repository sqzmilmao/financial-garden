package api

import (
	"context"
	"encoding/json"
	"net/http"
)

func (api *Api) GetFlowers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "only Get allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx := context.Background()

	flowers, err := api.db.GetFlowers(ctx)
	if err != nil {
		http.Error(w, "failed to get flowers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(flowers)
}
