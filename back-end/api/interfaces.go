package api

import (
	"context"
	"zaman/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DBService interface {
	CreateFlower(ctx context.Context, flower *model.Flower) (primitive.ObjectID, error)
	GetFlowers(ctx context.Context) ([]model.Flower, error)
	GetFlower(ctx context.Context, id primitive.ObjectID) (*model.Flower, error)
	UpdateFlower(ctx context.Context, filter bson.M, update bson.M) error
}

type GptService interface {
	GetAnswer(ctx context.Context, message string, id primitive.ObjectID) (string, error)
}
