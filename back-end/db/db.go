package db

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DB struct {
	mongoClient *mongo.Client
	database    *mongo.Database

	flowers *mongo.Collection
}

func Create(cfg Config) (*DB, error) {
	mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI(cfg.Url))
	if err != nil {
		log.Fatalf("connection error: %v", err)
		return nil, err
	}

	db := &DB{
		mongoClient: mongoClient,
		database:    mongoClient.Database(cfg.Db),
	}
	db.flowers = db.database.Collection("flowers")

	return db, nil
}

func (db *DB) Disconnect(ctx context.Context) {
	db.mongoClient.Disconnect(ctx)
}
