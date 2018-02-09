package handler

import (
	"encoding/json"
	"github.com/beewit/wechat/util"
	"io/ioutil"
	"strings"

	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/beekit/utils/enum"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/user/oauth2"
	"github.com/labstack/echo"
)

var (
	OauthUserInfo = "oauthUserInfo"
	MPSessionId   = "mpSessionId"
)

func readBody(c echo.Context) (map[string]string, error) {
	body, bErr := ioutil.ReadAll(c.Request().Body)
	if bErr != nil {
		global.Log.Error("读取http body失败，原因：%s", bErr.Error())
		return nil, bErr
	}
	defer c.Request().Body.Close()
	if body != nil && len(body) > 0 {
		var bm map[string]string
		bErr = json.Unmarshal(body, &bm)
		if bErr != nil {
			global.Log.Error("解析http body失败，原因：%s", bErr.Error())
			return nil, bErr
		}
		return bm, bErr
	}
	return nil, nil
}

func Filter(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		var token string
		token = c.FormValue("token")
		if token == "" {
			bm, _ := readBody(c)
			if bm != nil {
				token = bm["token"]
			}
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
			global.Log.Error(accMapStr+"，error：%s", err.Error())
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

func GetAccount(c echo.Context) (acc *global.Account, err error) {
	itf := c.Get("account")
	if itf == nil {
		err = utils.AuthFailNull(c)
		return
	}
	acc = global.ToInterfaceAccount(itf)
	if acc == nil {
		err = utils.AuthFailNull(c)
		return
	}
	return
}

//微信检测
func WechatFilter(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		r := c.Request()
		scheme := "http://"
		if c.IsTLS() {
			scheme = "https://"
		}
		href := scheme + r.Host + r.RequestURI
		if util.IsWechatBrowser(c.Request().UserAgent()) {
			mpSessionId := strings.TrimSpace(c.FormValue(MPSessionId))
			u := GetOauthUser(mpSessionId)
			if u == nil {
				oauth2Client := oauth2.Client{
					Config: global.OAuth2Config,
				}
				code := c.FormValue("code")
				if code != "" {
					mpSessionId = MPSessionId + code
					token, err := oauth2Client.Exchange(code)
					if err != nil {
						global.Log.Error("oauth2Client.Exchange error：%s", err.Error())
						return utils.ErrorNull(c, "微信授权失败")
					}
					global.Log.Info("token:%s", convert.ToString(token))
					u, err = oauth2Client.UserInfo(oauth2.Language_zh_CN)
					if err != nil {
						global.Log.Error("oauth2Client.UserInfo error：%s", err.Error())
						return utils.ErrorNull(c, "微信授权失败")
					}
					if u == nil {
						global.Log.Error("oauth2Client.UserInfo u is nil")
						return utils.ErrorNull(c, "微信授权失败")
					}
					saveWechatUser(u, c.RealIP())
					//直接登录

				} else {
					//授权失败页面
					global.Log.Info(global.OAuth2Config.GetAuthorizeCodeUrl(href))
					return utils.Redirect(c, global.OAuth2Config.GetAuthorizeCodeUrl(href))
				}
			}
			us := convert.ToObjStr(u)
			global.Log.Info("oauth userinfo：%s", us)
			//30天
			global.RD.SetAndExpire(mpSessionId, us, 30*12*60*60)
			c.Set(OauthUserInfo, u)
			c.Set(MPSessionId, mpSessionId)
		} else {
			return utils.ErrorNull(c, "请在微信中打开")
		}
		return next(c)
	}
}

func GetOauthUser(mpSessionId string) *oauth2.UserInfo {
	if mpSessionId == "" {
		return nil
	}
	us, err := global.RD.GetString(mpSessionId)
	if err != nil {
		return nil
	}
	var u *oauth2.UserInfo
	err = json.Unmarshal([]byte(us), &u)
	if err != nil {
		return nil
	}
	return u
}

func saveWechatUser(u *oauth2.UserInfo, ip string) {
	gender := "未知"
	if u.Sex == 1 {
		gender = "男"
	} else if u.Sex == 2 {
		gender = "女"
	}
	currTime := utils.CurrentTime()
	wu := GetWechatUserInfo(u.UnionId)
	if wu == nil {
		_, err := global.DB.InsertMap("wx_account", map[string]interface{}{
			"union_id":   u.UnionId,
			"open_id":    u.OpenId,
			"nickname":   u.Nickname,
			"avatar_url": u.HeadImageURL,
			"gender":     gender,
			"country":    u.Country,
			"province":   u.Province,
			"city":       u.City,
			"ct_time":    currTime,
			"ut_time":    currTime,
			"ip":         ip,
		})
		if err != nil {
			global.Log.Error("insert wx_account 微信用户信息失败，error:%s", err.Error())
		}
	} else {
		_, err := global.DB.Update("UPDATE wx_account SET nickname=?,avatar_url=?,gender=?,country=?,province=?,city=?,ut_time=?,ip=? WHERE union_id=?",
			u.Nickname, u.HeadImageURL, gender, u.Country, u.Province, u.City, currTime, ip, u.UnionId)
		if err != nil {
			global.Log.Error("update wx_account 微信用户信息失败，error:%s", err.Error())
		}
	}
	global.Log.Info("保存微信用户信息成功->%s", convert.ToString(u))
}
