package api

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"zaman/model"
)

func (api *Api) PostFlower(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	var flower model.Flower
	err = json.Unmarshal(bodyBytes, &flower)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	flower.Chat = make([]model.Message, 0)

	ctx := context.Background()

	flowerID, err := api.db.CreateFlower(ctx, &flower)
	flower.ID = flowerID
	if err != nil {
		http.Error(w, "failed to create flower", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(flower)
}
