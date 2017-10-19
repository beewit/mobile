package main_test

import (
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/wechat/mp/oauth2"
	"testing"
)

func TestRedisList(t *testing.T) {
	at := oauth2.AccessToken{}
	at.AccessToken = "123"
	at.ExpiresIn = 7200
	at.OpenId = "481312312312313"
	println(convert.ToObjStr(at))
}
