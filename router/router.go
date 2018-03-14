package router

import (
	"fmt"

	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/mobile/global"
	"github.com/beewit/mobile/handler"
	"github.com/beewit/wechat/mp"
	"github.com/beewit/wechat/mp/message/request"
	//"github.com/beewit/wechat/util"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func Start() {
	/*aesKey, err := util.AESKeyDecode("38VL2RYTRbuh2t0bGDsJj6XNBDXYhYUz4bLRJVne8iY")
	if err != nil {
		panic(err)
	}*/
	messageServeMux := mp.NewMessageServeMux()
	messageServeMux.MessageHandleFunc(request.MsgTypeText, handler.TextMessageHandler)
	messageServeMux.EventHandleFunc(request.EventTypeSubscribe, handler.SubscribeHandler)
	messageServeMux.EventHandleFunc(request.EventTypeScan, handler.ScanHandler)
	// 下面函数的几个参数设置成你自己的参数: oriId, token, appId
	mpServer := mp.NewDefaultServer(global.WechatConf.OriId, "9ee3ew5w4QGY0aAXr6nF", global.WechatConf.AppID, nil, messageServeMux)
	mpServerFrontend := mp.NewServerFrontend(mpServer, mp.ErrorHandlerFunc(handler.ErrorHandler), nil)

	fmt.Printf("手机站点启动..")

	e := echo.New()
	e.Use(middleware.Gzip())
	e.Use(middleware.Recover())

	e.Static("/app", "app")
	e.Static("/red_packet", "red_packet")
	e.File("/", "app/page/index.html")
	e.File("/.well-known/pki-validation/fileauth.txt", "fileauth.txt")
	//微信域名接口校验文件
	e.File("MP_verify_3Z6AKFClzM8nQt3q.txt", "app/page/MP_verify_3Z6AKFClzM8nQt3q.txt")
	e.GET("/account/wechatBind", handler.BindWeechatAccount, handler.Filter, handler.WechatFilter)
	e.GET("/wechat/server", mpServerFrontend.ServeHTTP)
	e.POST("/wechat/server", mpServerFrontend.ServeHTTP)
	//临时二维码
	e.POST("/account/create/temporary/qrcode", handler.CreateTemporarySceneStrQrCode)
	//永久二维码
	//e.POST("/account/create/permanent/qrcode", handler.CreatePermanentQRCode)
	//创建微信公众号菜单
	e.GET("/menu/create", handler.CreateMenu)

	e.POST("/wechat/jssdk/config", handler.GetJSSDKConfig)
	e.POST("/wechat/media/download", handler.DownloadMedia)
	e.GET("/wechat/oauth/get", handler.GetMPSessionId, handler.WechatFilter)
	e.GET("/test/cookie", handler.TestCookie)

	e.GET("/menu/help", func(c echo.Context) error {
		return utils.Redirect(c,"https://mp.weixin.qq.com/mp/homepage?__biz=MzU0NDI2NjgyMA==&hid=3&sn=c411aa55c4c766ab9e474338f66a4f8d#wechat_redirect")
	})

	utils.Open(global.Host)

	port := ":" + convert.ToString(global.Port)
	e.Logger.Fatal(e.Start(port))
}
