package handler

import (
	"github.com/labstack/echo"
	"github.com/beewit/beekit/utils"
)

//#绑定帐号

func BindAccount(c echo.Context) error {
	return utils.SuccessNull(c, "绑定成功")
}
