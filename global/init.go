package global

import (
	"fmt"
	"github.com/astaxie/beego/logs"
	"github.com/beewit/beekit/conf"
	"github.com/beewit/beekit/log"
	"github.com/beewit/beekit/mysql"
	"github.com/beewit/beekit/redis"
	"github.com/beewit/beekit/utils/convert"
	"encoding/json"
)

var (
	CFG  conf.Config
	DB   *mysql.SqlConnPool
	RD   *redis.RedisConnPool
	Log  *logs.BeeLogger
	IP   string
	Port string
	Host string
)

func init() {
	CFG = conf.New("config.json")
	DB = mysql.DB
	RD = redis.Cache
	Log = log.Logger
	IP = convert.ToString(CFG.Get("server.ip"))
	Port = convert.ToString(CFG.Get("server.port"))
	Host = fmt.Sprintf("http://%v:%v", IP, Port)
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
