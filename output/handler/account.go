package handler

import "github.com/beewit/mobile/global"

func GetWechatUserInfo(unionId string) map[string]interface{} {
	rows, err := global.DB.Query("SELECT * FROM wx_account WHERE union_id=? LIMIT 1", unionId)
	if err != nil {
		global.Log.Error("GetWechatUserInfo sql error:%s", err.Error())
		return nil
	}
	if len(rows) == 1 {
		return rows[0]
	}
	return nil
}
