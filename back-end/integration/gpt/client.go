package gpt

import (
	"net/http"
)

type GptClient struct {
	client  *http.Client
	baseURL string
	token   string
}

func NewGptClient(
	client *http.Client,
	baseURL string,
	token string,
) *GptClient {
	return &GptClient{
		client:  client,
		baseURL: baseURL,
		token:   token,
	}
}
