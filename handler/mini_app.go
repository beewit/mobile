package handler

import (
	"github.com/beewit/beekit/utils"
	"github.com/labstack/echo"
)

func getToken(c echo.Context) error {
	return utils.SuccessNull(c, "")
}
