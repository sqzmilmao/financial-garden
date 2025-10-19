package api

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"zaman/model"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (api *Api) PostMessage(w http.ResponseWriter, r *http.Request) {
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

	var message model.Message
	err = json.Unmarshal(bodyBytes, &message)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid id parameter", http.StatusBadRequest)
		return
	}

	answer, err := api.gpt.GetAnswer(ctx, message.Content, oid)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(answer)
}
