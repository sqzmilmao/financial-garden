package gpt

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type PromptRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Choice struct {
	Message Message `json:"message"`
}

type PromptResponse struct {
	Choices []Choice `json:"choices"`
}
