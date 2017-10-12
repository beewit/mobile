package handler

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"strings"

	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/beekit/utils/enum"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/oauth2"
	"github.com/beewit/wechat/util"
	"github.com/labstack/echo"
)

func readBody(c echo.Context) (map[string]string, error) {
	body, bErr := ioutil.ReadAll(c.Request().Body)
	if bErr != nil {
		global.Log.Error("读取http body失败，原因：", bErr.Error())
		return nil, bErr
	}
	defer c.Request().Body.Close()

	var bm map[string]string
	bErr = json.Unmarshal(body, &bm)
	if bErr != nil {
		global.Log.Error("解析http body失败，原因：", bErr.Error())
		return nil, bErr
	}
	return bm, bErr
}

func Filter(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		var token string
		bm, _ := readBody(c)
		if bm != nil {
			token = bm["token"]
		}
		if token == "" {
			token = c.FormValue("token")
		}
		if token == "" {
			return utils.AuthFail(c, "登陆信息token无效，请重新登陆")
		}
		accMapStr, err := global.RD.GetString(token)
		if err != nil {
			global.Log.Error(err.Error())
			return utils.AuthFail(c, "登陆信息已失效，请重新登陆")
		}
		if accMapStr == "" {
			global.Log.Error(token + "已失效")
			return utils.AuthFail(c, "登陆信息已失效，请重新登陆")
		}
		accMap := make(map[string]interface{})
		err = json.Unmarshal([]byte(accMapStr), &accMap)
		if err != nil {
			global.Log.Error(accMapStr + "，error：" + err.Error())
			return utils.AuthFail(c, "登陆信息已失效，请重新登陆")
		}
		m, err := global.DB.Query("SELECT id,nickname,photo,mobile,status FROM account WHERE id=? LIMIT 1", accMap["id"])
		if err != nil {
			return utils.AuthFail(c, "获取用户信息失败")
		}
		if convert.ToString(m[0]["status"]) != enum.NORMAL {
			return utils.AuthFail(c, "用户已被冻结")
		}
		c.Set("account", global.ToMapAccount(m[0]))
		return next(c)
	}
}

//微信检测
func WechatFilter(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ur := c.Request().URL
		global.Log.Warning(ur.Hostname())
		//scheme := "http://"
		//if c.IsTLS() {
		//	scheme = "https://"
		//}
		if util.IsWechatBrowser(c.Request().UserAgent()) {
			//进行openid判断，如果没有则获取
			AccessToken, _ := c.Cookie("oauth2")
			var at *oauth2.AccessToken
			if AccessToken == nil || AccessToken.Value == "" {
				code := c.FormValue("code")
				if code != "" {
					//获取openId
					at = oauth2.GetAccessToken(code)
				} else {
					//return utils.Redirect(c, util.GetAuthorizeCodeUrl(href))
				}
			} else {
				var at *oauth2.AccessToken
				err := json.Unmarshal([]byte(AccessToken.Value), &at)
				if err != nil {
					global.Log.Error(err.Error())
					return utils.ErrorNull(c, "AccessToken json.Unmarshal 解析失败")
				}
			}
			if at != nil {
				SetCookie(c, "oauth2", convert.ToObjStr(at), time.Duration(12)*time.Hour)
				c.Set("oauth2", at)
			} else {
				return utils.ErrorNull(c, "获取微信用户信息失败")
			}
		} else {
			return utils.ErrorNull(c, "请使用微信登录")
		}
		return next(c)
	}
}

func SetCookie(c echo.Context, name string, value interface{}, d time.Duration) {
	c.SetCookie(&http.Cookie{Name: name, Value: convert.ToObjStr(value), Expires: time.Now().Add(d)})
}

func RemoveCookie(c echo.Context, name string) {
	SetCookie(c, name, "", time.Duration(-1))
}
