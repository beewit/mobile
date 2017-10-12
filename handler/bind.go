package handler

import (
	"github.com/labstack/echo"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/wechat/mp/oauth2"
	"github.com/beewit/wechat/mp/userinfo"
	"github.com/beewit/mobile/global"
	"github.com/beewit/beekit/utils/enum"
)

//#绑定帐号

func BindWeechatAccount(c echo.Context) error {
	oauth := c.Get("oauth2")
	acc := c.Get("account")
	if acc == nil {
		return utils.ErrorNull(c, "获取账号失败")
	}
	account := acc.(global.Account)
	if oauth == nil {
		return utils.ErrorNull(c, "获取用户微信授权失败")
	}
	at := oauth.(*oauth2.AccessToken)
	if at == nil {
		return utils.ErrorNull(c, "获取用户微信授权失败.")
	}
	u := userinfo.GetUserInfo(at.AccessToken, at.OpenId)
	if u == nil {
		return utils.ErrorNull(c, "获取用户微信信息失败")
	}
	maps, err := global.DB.Query("SELECT * FROM account_auths WHERE account_id=? AND type=? LIMIT 1", account.ID, enum.WECHAT)
	if err != nil {
		global.Log.Error(err.Error())
		return utils.ErrorNull(c, "查询用户三方平台关联信息失败")
	}
	var x int64
	if len(maps) != 1 {
		m := map[string]interface{}{}
		iw, _ := utils.NewIdWorker(1)
		id, idErr := iw.NextId()
		if idErr != nil {
			return utils.ErrorNull(c, "ID生成器发生错误")
		}
		m["id"] = id
		m["nickname"] = u.Nickname
		m["photo"] = u.Headimgurl
		m["openid"] = u.Openid
		m["unionID"] = u.Unionid
		m["type"] = enum.WECHAT
		m["ct_time"] = utils.CurrentTime()
		m["ut_time"] = m["ct_time"]
		m["ip"] = utils.GetIp()
		m["account_id"] = account.ID
		x, err = global.DB.InsertMap("account_auths", m)
	} else {
		sql := "UPDATE account_auths SET nickname=?,photo=?,openid=?,unionID=?,ut_time=?,ip=? WHERE account_id=?"
		x, err = global.DB.Update(sql, u.Nickname, u.Headimgurl, u.Openid, u.Unionid, utils.CurrentTime(), utils.GetIp(), account.ID)
	}
	if err != nil {
		global.Log.Error(err.Error())
		return utils.ErrorNull(c, "微信绑定结果失败")
	}
	if x > 0 {
		return utils.SuccessNullMsg(c, u)
	} else {
		return utils.SuccessNull(c, "微信绑定失败")
	}
}

func getWechatUserInfo(c echo.Context) error {
	oauth := c.Get("oauth2")
	if oauth != nil {
		at := oauth.(*oauth2.AccessToken)
		if at != nil {
			u := userinfo.GetUserInfo(at.AccessToken, at.OpenId)
			if u != nil {
				return utils.SuccessNullMsg(c, u)
			}
		}
	}
	return utils.ErrorNull(c, "获取微信用户信息成功")
}
