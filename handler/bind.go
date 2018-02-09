package handler

import (
	"encoding/json"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/beekit/utils/enum"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/user/oauth2"
	"github.com/labstack/echo"
	"net/http"
	"net/url"
	"time"
)

func GetMPSessionId(c echo.Context) error {
	mpSessionId := c.Get(MPSessionId)
	if mpSessionId == nil {
		return utils.ErrorNull(c, "获取授权失败")
	}
	//存储cookie
	mpSessionIdStr := convert.ToString(mpSessionId)
	c.SetCookie(&http.Cookie{Name: MPSessionId, Path: "/", Domain: ".9ee3.com", Value: url.QueryEscape(mpSessionIdStr), Expires: time.Now().Add(time.Hour * 24 * 7)})
	backUrl := c.FormValue("backUrl")
	return utils.Redirect(c, backUrl)
}

func TestCookie(c echo.Context) error {
	c.SetCookie(&http.Cookie{Name: MPSessionId, Path: "/", Domain: ".9ee3.com", Value: url.QueryEscape("中山"), Expires: time.Now().Add(time.Hour * 24 * 7)})
	return utils.ResultString(c, "cookie测试")
}

//#绑定帐号
func BindWeechatAccount(c echo.Context) error {
	oauth := c.Get("OauthUserInfo")
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
	var u *oauth2.UserInfo
	err := json.Unmarshal(bytes, &u)
	if err != nil {
		global.Log.Error(err.Error())
		return utils.Alert(c, "获取用户微信授权失败.")
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
		m["id"] = utils.ID()
		m["nickname"] = u.Nickname
		m["photo"] = u.HeadImageURL
		m["openid"] = u.OpenId
		m["unionID"] = u.UnionId
		m["type"] = enum.WECHAT
		m["ct_time"] = utils.CurrentTime()
		m["ut_time"] = m["ct_time"]
		m["ip"] = utils.GetIp()
		m["account_id"] = account.ID
		_, err = global.DB.InsertMap("account_auths", m)
	} else {
		sql := "UPDATE account_auths SET nickname=?,photo=?,openid=?,unionID=?,ut_time=?,ip=? WHERE account_id=?"
		_, err = global.DB.Update(sql, u.Nickname, u.HeadImageURL, u.OpenId, u.UnionId, utils.CurrentTime(), utils.GetIp(), account.ID)
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
		_, err = global.DB.Update(sql, u.Nickname, u.HeadImageURL, sex, account.ID)
		//}
	}
	//return utils.SuccessNullMsg(c, u)
	return utils.Alert(c, "绑定成功,请刷新当前页面")
}

func getWechatUserInfo(c echo.Context) error {
	oauth := c.Get("OauthUserInfo")
	bytes := convert.ToInterfaceByte(oauth)
	var u *oauth2.UserInfo
	err := json.Unmarshal(bytes, &u)
	if err != nil {
		global.Log.Error(err.Error())
		return utils.Alert(c, "获取用户微信授权失败.")
	}
	if u != nil {
		return utils.SuccessNullMsg(c, u)
	}
	return utils.ErrorNull(c, "获取微信用户信息成功")
}
