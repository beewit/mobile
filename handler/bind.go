package handler

import (
	"encoding/json"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/beekit/utils/enum"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/core"
	"github.com/beewit/wechat/mp/oauth2"
	"github.com/beewit/wechat/mp/userinfo"
	"github.com/labstack/echo"
)

//#绑定帐号

func BindWeechatAccount(c echo.Context) error {
	oauth := c.Get("oauth2")
	acc := c.Get("account")
	if acc == nil {
		return utils.Alert(c, "获取登录账号失败")
	}
	account := global.ToInterfaceAccount(acc)
	if account == nil {
		return utils.AuthFailNull(c)
	}
	if oauth == nil {
		return utils.Alert(c, "获取用户微信授权失败")
	}
	bytes := convert.ToInterfaceByte(oauth)
	var at *oauth2.AccessToken
	err := json.Unmarshal(bytes, &at)
	if err != nil {
		global.Log.Error(err.Error())
		return utils.Alert(c, "获取用户微信授权失败.")
	}
	accessToken, err := core.AccessToken.GetAccessToken()
	if err != nil {
		global.Log.Error(err.Error())
		return utils.Alert(c, "基础AccessToken获取失败.")
	}
	u, err := userinfo.GetUserInfo(accessToken, at.OpenId)
	if err != nil {
		global.Log.Error(err.Error())
		return utils.Alert(c, "获取用户微信信息失败")
	}
	if u == nil {
		return utils.Alert(c, "获取用户微信信息失败.")
	}
	maps, err := global.DB.Query("SELECT * FROM account_auths WHERE account_id=? AND type=? LIMIT 1", account.ID, enum.WECHAT)
	if err != nil {
		global.Log.Error(err.Error())
		return utils.Alert(c, "查询用户三方平台关联信息失败")
	}
	if len(maps) != 1 {
		m := map[string]interface{}{}
		iw, _ := utils.NewIdWorker(1)
		id, idErr := iw.NextId()
		if idErr != nil {
			return utils.Alert(c, "ID生成器发生错误")
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
		_, err = global.DB.InsertMap("account_auths", m)
	} else {
		sql := "UPDATE account_auths SET nickname=?,photo=?,openid=?,unionID=?,ut_time=?,ip=? WHERE account_id=?"
		_, err = global.DB.Update(sql, u.Nickname, u.Headimgurl, u.Openid, u.Unionid, utils.CurrentTime(), utils.GetIp(), account.ID)
	}
	if err != nil {
		global.Log.Error(err.Error())
		//return utils.ErrorNull(c, "微信绑定结果失败")
		return utils.Alert(c, "微信绑定结果失败")
	} else {
		//if convert.ToString(account.Nickname) == "" || convert.ToString(account.Photo) == "" {
		sql := "UPDATE account SET nickname=?,photo=?,gender=? WHERE id=?"
		var sex string
		if u.Sex == 1 {
			sex = "男"
		} else if u.Sex == 2 {
			sex = "女"
		} else {
			sex = "未知"
		}
		_, err = global.DB.Update(sql, u.Nickname, u.Headimgurl, sex, account.ID)
		//}
	}
	//return utils.SuccessNullMsg(c, u)
	return utils.Alert(c, "绑定成功,右键请刷新当前页面")
}

func getWechatUserInfo(c echo.Context) error {
	oauth := c.Get("oauth2")
	if oauth != nil {
		at := oauth.(*oauth2.AccessToken)
		if at != nil {
			u, err := userinfo.GetUserInfo(at.AccessToken, at.OpenId)
			if err != nil {
				global.Log.Error(err.Error())
				return utils.Alert(c, "获取用户微信信息失败")
			}
			if u != nil {
				return utils.SuccessNullMsg(c, u)
			}
		}
	}
	return utils.ErrorNull(c, "获取微信用户信息成功")
}
