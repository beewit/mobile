package main_test

import (
	"testing"

	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp"
	"github.com/beewit/wechat/mp/account"
	"github.com/beewit/wechat/mp/oauth2"
)

func TestRedisList(t *testing.T) {
	at := oauth2.AccessToken{}
	at.AccessToken = "123"
	at.ExpiresIn = 7200
	at.OpenId = "481312312312313"
	println(convert.ToObjStr(at))
}

func TestTLS(t *testing.T) {
	m := map[string]string{}
	m["a"] = "1"
	m["a"] = "1"
	m["b"] = "1"
	m["c"] = "1"
	println(convert.ToObjStr(m))
}

func TestQrCode(t *testing.T) {
	var AccessTokenServer = mp.NewDefaultAccessTokenServer(global.WechatConf.AppID, global.WechatConf.AppSecret, nil)
	client := account.NewClient(AccessTokenServer, nil)
	qrcode, err := client.CreateTemporaryQRCode(1, account.TemporaryQRCodeExpireSecondsLimit)
	if err != nil {
		println(err.Error())
	}
	if qrcode != nil {
		client.QRCodeDownload(qrcode.Ticket, "1.jpg")
	}
}

func TestCode(t *testing.T) {
	println(convert.ToString(convert.MustInt("1234567000")))
	println(uint32(convert.MustInt("1234567000")))
}

func TestDBQrcode(t *testing.T) {
	id, err := addQrCode("临时", "123456", "红包")
	if err != nil {
		println(err.Error())
	}
	println(id)

}

func addQrCode(t, objId, objType string) (id int64, err error) {
	id, err = global.DB.InsertMap("qrcode", map[string]interface{}{
		"type":     t,
		"obj_id":   objId,
		"obj_type": objType,
		"ct_time":  utils.CurrentTime(),
	})
	return
}

func TestDateStr(t *testing.T) {
	println(utils.CurrentDateByPlace("/"))
}
