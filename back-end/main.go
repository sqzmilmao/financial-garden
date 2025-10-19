package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"zaman/api"
	"zaman/db"
	"zaman/integration/gpt"
	"zaman/service"

	"github.com/jub0bs/fcors"
)

type Config struct {
	mdb      db.Config
	gptToken string
}

func main() {
	ctx := context.Background()

	cfg := Config{
		mdb: db.Config{
			Url: os.Getenv("MONGODB_URI"),
			Db:  "zaman",
		},
		gptToken: os.Getenv("GPT_TOKEN"),
	}

	db, err := db.Create(cfg.mdb)
	if err != nil {
		log.Fatalf("Could not set up database: %v", err)
	}
	defer db.Disconnect(ctx)

	gptClient := gpt.NewGptClient(
		&http.Client{},
		"https://api.openai.com/v1/chat/completions",
		cfg.gptToken,
	)

	gptService := service.NewGptService(gptClient, db)

	cors, _ := fcors.AllowAccess(
		fcors.FromAnyOrigin(),
		fcors.WithMethods(
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
		),
		fcors.WithAnyRequestHeaders(),
	)

	theApi := api.NewApi(db, gptService)
	http.Handle("/api/flower", cors(http.HandlerFunc(theApi.PostFlower)))
	http.Handle("/api/flowers", cors(http.HandlerFunc(theApi.GetFlowers)))
	http.Handle("/api/flower/show", cors(http.HandlerFunc(theApi.GetFlower)))
	http.Handle("/api/message", cors(http.HandlerFunc(theApi.PostMessage)))

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Printf("error: ListenAndServe: %s", err.Error())
	}
}
