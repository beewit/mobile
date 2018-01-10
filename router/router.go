package router

import (
	"fmt"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/mobile/global"
	"github.com/beewit/mobile/handler"
	"github.com/beewit/wechat/mp"
	"github.com/beewit/wechat/mp/message/request"
	"github.com/beewit/wechat/util"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func Start() {
	aesKey, err := util.AESKeyDecode("38VL2RYTRbuh2t0bGDsJj6XNBDXYhYUz4bLRJVne8iY")
	if err != nil {
		panic(err)
	}
	messageServeMux := mp.NewMessageServeMux()
	messageServeMux.MessageHandleFunc(request.MsgTypeText, handler.TextMessageHandler)
	messageServeMux.EventHandleFunc(request.EventTypeSubscribe, handler.SubscribeHandler)
	// 下面函数的几个参数设置成你自己的参数: oriId, token, appId
	mpServer := mp.NewDefaultServer(global.WechatConf.OriId, "9ee3ew5w4QGY0aAXr6nF", global.WechatConf.AppID, aesKey, messageServeMux)
	mpServerFrontend := mp.NewServerFrontend(mpServer, mp.ErrorHandlerFunc(handler.ErrorHandler), nil)

	fmt.Printf("手机站点启动..")

	e := echo.New()
	e.Use(middleware.Gzip())
	e.Use(middleware.Recover())

	e.Static("/app", "app")
	e.File("/", "app/page/index.html")
	//微信域名接口校验文件
	e.File("MP_verify_3Z6AKFClzM8nQt3q.txt", "app/page/MP_verify_3Z6AKFClzM8nQt3q.txt")
	e.GET("/account/wechatBind", handler.BindWeechatAccount, handler.Filter, handler.WechatFilter)
	e.GET("/account/create/temporary/qrcode", handler.CreateTemporaryQRCode)
	e.GET("/wechat/server", mpServerFrontend.ServeHTTP)
	e.POST("/wechat/server", mpServerFrontend.ServeHTTP)

	utils.Open(global.Host)

	port := ":" + convert.ToString(global.Port)
	e.Logger.Fatal(e.Start(port))
}
