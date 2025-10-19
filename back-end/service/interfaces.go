package service

import (
	"context"
	"zaman/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DBService interface {
	GetFlower(ctx context.Context, id primitive.ObjectID) (*model.Flower, error)
	UpdateFlower(ctx context.Context, filter bson.M, update bson.M) error
}

type GptServiceI interface {
	GetAnswer(ctx context.Context, message string, id primitive.ObjectID) (string, error)
}
