package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	Role    string `bson:"role" json:"role"`
	Content string `bson:"content" json:"content"`
}

type Flower struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name          string             `bson:"name" json:"name"`
	Description   string             `bson:"description" json:"description"`
	CurrentAmount int64              `bson:"currentAmount" json:"currentAmount"`
	TargetAmount  int64              `bson:"targetAmount" bson:"targetAmount"`
	Chat          []Message          `bson:"chat" json:"chat"`
}
