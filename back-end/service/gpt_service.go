package service

import (
	"context"
	"fmt"
	"zaman/integration/gpt"
	"zaman/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GptService struct {
	db     DBService
	client *gpt.GptClient
}

func NewGptService(client *gpt.GptClient, db DBService) *GptService {
	return &GptService{
		db:     db,
		client: client,
	}
}

func (s *GptService) GetAnswer(ctx context.Context, message string, id primitive.ObjectID) (string, error) {
	flower, err := s.db.GetFlower(ctx, id)
	if err != nil {
		return "", err
	}

	messages := flower.Chat
	newMessage := model.Message{
		Role:    "user",
		Content: message,
	}

	filter := bson.M{"_id": id}

	update := bson.M{
		"$push": bson.M{
			"chat": newMessage,
		},
	}
	if err := s.db.UpdateFlower(ctx, filter, update); err != nil {
		fmt.Println(err)
		return "", nil
	}

	messages = append(messages, newMessage)

	gptMessages := make([]gpt.Message, 0, len(messages))
	for _, m := range messages {
		gptMessages = append(gptMessages, gpt.Message{
			Role:    m.Role,
			Content: m.Content,
		})
	}

	req := &gpt.PromptRequest{
		Model:    "gpt-4o-mini",
		Messages: gptMessages,
	}

	req.Messages = append(req.Messages, gpt.Message{
		Role:    "user",
		Content: "Now turn this your answer to paragraph with only letters, no new line or other such stuff. Just paragraph based answer",
	})

	resp, err := s.client.PostPrompt(ctx, req)
	promptMessage := resp.Choices[0].Message.Content

	filter = bson.M{"_id": id}

	update = bson.M{
		"$push": bson.M{
			"chat": model.Message{
				Role:    "assistant",
				Content: promptMessage,
			},
		},
	}
	if err := s.db.UpdateFlower(ctx, filter, update); err != nil {
		fmt.Println(err)
		return "", nil
	}
	return promptMessage, nil
}
