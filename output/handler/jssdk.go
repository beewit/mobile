package handler

import (
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/jssdk"
	"github.com/beewit/wechat/util"
	"github.com/labstack/echo"
	"time"
)

func GetJSSDKConfig(c echo.Context) error {
	noncestr := util.GenerateNonceStr()
	timestamp := time.Now().Unix()
	url := c.FormValue("url")
	ticket, err := global.TicketServer.Ticket()
	if err != nil {
		global.Log.Error("获取jssdk ticket失败,error:%s", err.Error())
		return utils.ErrorNull(c, "获取jssdk ticket失败")
	}
	sign := jssdk.WXConfigSign(ticket, noncestr, convert.ToString(timestamp), url)
	return utils.Success(c, "获取jssdk config成功", map[string]interface{}{
		"noncestr":  noncestr,
		"timestamp": timestamp,
		"signature": sign,
		"appId":     global.WechatConf.AppID,
	})
}
