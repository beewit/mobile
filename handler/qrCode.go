package handler

import (
	"fmt"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/account"
	"github.com/labstack/echo"
)

func CreateTemporaryQRCode(c echo.Context) error {
	qrCode, err := global.AccClient.CreateTemporaryQRCode(1, account.TemporaryQRCodeExpireSecondsLimit)
	if err != nil {
		global.Log.Error("创建临时二维码失败，ERROR：", err.Error())
		return utils.ErrorNull(c, "创建临时二维码失败")
	}
	if qrCode != nil {
		fileName := utils.ID()

		//filePath := fmt.Sprintf("%s%d/%d.jpg", global.FileConf.Path, acc.ID, utils.ID())
		filePath := fmt.Sprintf("%sqrcode/%d/%d.jpg", global.FileConf.Path, 10000000000, utils.ID())
		written, err := global.AccClient.QRCodeDownload(qrCode.Ticket, filePath)
		if err != nil {
			global.Log.Error("下载临时二维码失败，ERROR：", err.Error())
			return utils.ErrorNull(c, "下载临时二维码失败")
		}
		path := global.GetSavePath(filePath)
		name := fmt.Sprintf("%d.jpg", fileName)
		//数据库记录文件路径
		go func() {
			_, err = global.DB.InsertMap("file_log", map[string]interface{}{
				"id":      utils.ID(),
				"name":    name,
				"path":    path,
				"size":    written,
				"ext":     ".jpg",
				"ct_time": utils.CurrentTime(),
				"ct_ip":   c.RealIP(),
			})
			if err != nil {
				global.Log.Error(fmt.Sprintf("保存文件日志失败，ERROR：%s", err.Error()))
			}
		}()
		return utils.SuccessNullMsg(c, map[string]interface{}{
			"id":   fileName,
			"path": path,
			"url":  global.GetUrlByFilePath(filePath),
			"name": name,
		})
	}
	return utils.ErrorNull(c, "创建临时二维码失败")
}
