package db

import (
	"context"
	"zaman/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (db *DB) CreateFlower(ctx context.Context, flower *model.Flower) (primitive.ObjectID, error) {
	res, err := db.flowers.InsertOne(ctx, flower)
	return res.InsertedID.(primitive.ObjectID), err
}

func (db *DB) GetFlowers(ctx context.Context) ([]model.Flower, error) {
	filter := bson.M{}
	cursor, err := db.flowers.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var flowers []model.Flower
	if err = cursor.All(ctx, &flowers); err != nil {
		return nil, err
	}
	return flowers, nil
}

func (db *DB) GetFlower(ctx context.Context, id primitive.ObjectID) (*model.Flower, error) {
	filter := bson.M{"_id": id}
	var flower model.Flower
	if err := db.flowers.FindOne(ctx, filter).Decode(&flower); err != nil {
		return nil, err
	}
	return &flower, nil
}

func (db *DB) UpdateFlower(ctx context.Context, filter bson.M, update bson.M) error {
	_, err := db.flowers.UpdateOne(ctx, filter, update)
	return err
}
