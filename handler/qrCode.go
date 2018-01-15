package handler

import (
	"fmt"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/beekit/utils/enum"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp/account"
	"github.com/labstack/echo"
)

func addQrCode(t, objId, objType string) (id int64, err error) {
	id, err = global.DB.InsertMap("qrcode", map[string]interface{}{
		"type":     t,
		"obj_id":   objId,
		"obj_type": objType,
		"ct_time":  utils.CurrentTime(),
	})
	return
}

func CreatePermanentQRCode(c echo.Context) error {
	objId := c.FormValue("objId")
	objType := c.FormValue("objType")
	qrCodeId, err := addQrCode(enum.QRCODE_PERMANENT, objId, objType)
	if err != nil {
		global.Log.Error("addQrCode sql error：%s", err.Error())
	}
	// 创建永久二维码
	qrCode, err := global.AccClient.CreatePermanentQRCode(uint32(convert.MustInt(qrCodeId)))
	//  SceneId: 场景值ID, 目前参数只支持1--100000
	if err != nil {
		global.Log.Error("创建永久二维码失败，ERROR：", err.Error())
		return utils.ErrorNull(c, "创建永久二维码失败")
	}
	if qrCode != nil {
		return download(c, qrCode.Ticket, qrCodeId)
	}
	return utils.ErrorNull(c, "创建永久二维码失败")
}

func CreateTemporaryQRCode(c echo.Context) error {
	objId := c.FormValue("objId")
	objType := c.FormValue("objType")
	qrCodeId, err := addQrCode(enum.QRCODE_TEMPORARY, objId, objType)
	if err != nil {
		global.Log.Error("addQrCode sql error：%s", err.Error())
	}
	qrCode, err := global.AccClient.CreateTemporaryQRCode(uint32(convert.MustInt(qrCodeId)), account.TemporaryQRCodeExpireSecondsLimit)
	if err != nil {
		global.Log.Error("创建临时二维码失败，ERROR：", err.Error())
		return utils.ErrorNull(c, "创建临时二维码失败")
	}
	if qrCode != nil {
		return download(c, qrCode.Ticket, qrCodeId)
	}
	return utils.ErrorNull(c, "创建临时二维码失败")
}

/* func CreatePermanentQRCodeWithSceneString(c echo.Context) error {
	objId := c.FormValue("objId")
	objType := c.FormValue("objType")
	qrCodeId, err := addQrCode(enum.QRCODE_PERMANENT_STR, objId, objType)
	if err != nil {
		global.Log.Error("addQrCode sql error：%s", err.Error())
	}
	qrCode, err := global.AccClient.CreatePermanentQRCodeWithSceneString(id)
	if err != nil {
		global.Log.Error("创建临时二维码失败，ERROR：", err.Error())
		return utils.ErrorNull(c, "创建临时二维码失败")
	}
	if qrCode != nil {
		return download(c, qrCode.Ticket, qrCodeId)
	}
	return utils.ErrorNull(c, "创建临时二维码失败")
} */

func download(c echo.Context, ticket string, id int64) error {
	fileName := utils.ID()
	//filePath := fmt.Sprintf("%s%d/%d.jpg", global.FileConf.Path, acc.ID, utils.ID())

	filePath := fmt.Sprintf("%sqrcode/%s/%d.jpg", global.FileConf.Path, utils.CurrentDateByPlace("/"), utils.ID())
	written, err := global.AccClient.QRCodeDownload(ticket, filePath)
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
		//更新path
		_, err = global.DB.Update("UPDATE qrcode SET path=? WHERE id=?", path, id)
		if err != nil {
			global.Log.Error(fmt.Sprintf("保存二维码存储路径记录失败，ERROR：%s", err.Error()))
		}
	}()
	return utils.SuccessNullMsg(c, map[string]interface{}{
		"id":   fileName,
		"path": path,
		"url":  global.GetUrlByFilePath(filePath),
		"name": name,
	})
}
