package handler

import (
	"github.com/beewit/beekit/utils"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/menu"
	"github.com/labstack/echo"
)

func CreateMenu(c echo.Context) error {
	key := c.FormValue("key")
	if key != "xFmM0WW8GBsgovH2" {
		return utils.ErrorNull(c, "密钥错误")
	}
	//u, _ := url.Parse("https://mp.weixin.qq.com/mp/homepage?__biz=MzU0NDI2NjgyMA==&hid=3&sn=c411aa55c4c766ab9e474338f66a4f8d#wechat_redirect")
	var mn menu.Menu
	mn.Buttons = make([]menu.Button, 3)
	mn.Buttons[0].SetAsViewButton("红包裂变", "http://m.9ee3.com/red_packet/pages/user/send/red_packet.html")
	mn.Buttons[1].SetAsViewButton("APP下载", "http://update.9ee3.com/download?app=spread-app")
	mn.Buttons[2].SetAsViewButton("帮助中心","http://m.9ee3.com/menu/help")
	menuClient := (*menu.Client)(global.MPClient)
	if err := menuClient.CreateMenu(mn); err != nil {
		global.Log.Error("创建微信公众号自定义菜单失败，error：%s", err.Error())
		return utils.ErrorNull(c, "创建微信公众号自定义菜单失败")
	}
	return utils.SuccessNull(c, "创建微信公众号自定义菜单成功")
}
