package api

type Api struct {
	db  DBService
	gpt GptService
}

func NewApi(
	db DBService,
	gpt GptService,
) *Api {
	return &Api{
		db:  db,
		gpt: gpt,
	}
}
