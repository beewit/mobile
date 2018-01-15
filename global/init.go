package global

import (
	"encoding/json"
	"fmt"
	"github.com/astaxie/beego/logs"
	"github.com/beewit/beekit/conf"
	"github.com/beewit/beekit/log"
	"github.com/beewit/beekit/mysql"
	"github.com/beewit/beekit/redis"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/wechat/mp"
	"github.com/beewit/wechat/mp/account"
	"strings"
)

var (
	CFG               conf.Config
	DB                *mysql.SqlConnPool
	RD                *redis.RedisConnPool
	Log               *logs.BeeLogger
	IP                string
	Port              string
	Host              string
	WechatConf        *wechatConf
	WechatMiniAppConf *wechatMiniAppConf
	FileConf          *fileConf
	AccessTokenServer *mp.DefaultAccessTokenServer
	MPClient          *mp.Client
	AccClient         *account.Client
)

func init() {
	CFG = conf.New("config.json")
	DB = mysql.DB
	RD = redis.Cache
	Log = log.Logger
	IP = convert.ToString(CFG.Get("server.ip"))
	Port = convert.ToString(CFG.Get("server.port"))
	Host = fmt.Sprintf("http://%v:%v", IP, Port)
	WechatConf = &wechatConf{
		OriId:     convert.ToString(CFG.Get("wechat.oriId")),
		AppID:     convert.ToString(CFG.Get("wechat.appId")),
		AppSecret: convert.ToString(CFG.Get("wechat.appSecret")),
		MchID:     convert.ToString(CFG.Get("wechat.mchID")),
		APIKey:    convert.ToString(CFG.Get("wechat.apiKey")),
	}

	WechatMiniAppConf = &wechatMiniAppConf{
		AppID:     convert.ToString(CFG.Get("wechat_mini_app.appId")),
		AppSecret: convert.ToString(CFG.Get("wechat_mini_app.appSecret")),
	}

	FileConf = &fileConf{
		Path:   convert.ToString(CFG.Get("files.path")),
		DoMain: convert.ToString(CFG.Get("files.doMain")),
	}
	AccessTokenServer = mp.NewDefaultAccessTokenServer(WechatConf.AppID, WechatConf.AppSecret, nil)
	MPClient = mp.NewClient(AccessTokenServer, nil)
	AccClient = account.NewClient(AccessTokenServer, nil)
}

type Account struct {
	ID       int64  `json:"id"`
	Nickname string `json:"nickname"`
	Photo    string `json:"photo"`
	Mobile   string `json:"mobile"`
	Status   string `json:"status"`
}

func ToByteAccount(b []byte) *Account {
	var rp = new(Account)
	err := json.Unmarshal(b[:], &rp)
	if err != nil {
		Log.Error(err.Error())
		return nil
	}
	return rp
}

func ToMapAccount(m map[string]interface{}) *Account {
	b := convert.ToMapByte(m)
	if b == nil {
		return nil
	}
	return ToByteAccount(b)
}

func ToInterfaceAccount(m interface{}) *Account {
	b := convert.ToInterfaceByte(m)
	if b == nil {
		return nil
	}
	return ToByteAccount(b)
}

type wechatConf struct {
	OriId          string
	AppID          string
	MchID          string
	AppSecret      string
	APIKey         string
	EncodingAESKey string
}

type wechatMiniAppConf struct {
	AppID     string
	AppSecret string
}

type fileConf struct {
	Path   string
	DoMain string
}

func GetSavePath(path string) string {
	return strings.Replace(path, "/home/zxb/file/", "", -1)
}

func GetUrlByFilePath(path string) string {
	return FileConf.DoMain + GetSavePath(path)
}
