package router

import (
	"fmt"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/mobile/global"
	"github.com/beewit/mobile/handler"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func Start() {
	fmt.Printf("登陆授权系统启动")

	e := echo.New()
	e.Use(middleware.Gzip())
	e.Use(middleware.Recover())

	e.Static("/app", "app")
	e.File("/", "app/page/index.html")
	e.File("MP_verify_3Z6AKFClzM8nQt3q.txt", "app/page/MP_verify_3Z6AKFClzM8nQt3q.txt")

	e.GET("/account/wechatBind", handler.BindWeechatAccount, handler.Filter, handler.WechatFilter)

	utils.Open(global.Host)

	port := ":" + convert.ToString(global.Port)
	e.Logger.Fatal(e.Start(port))
}
