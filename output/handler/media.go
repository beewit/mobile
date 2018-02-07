package handler

import (
	"fmt"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/mobile/global"
	"github.com/labstack/echo"
)

func DownloadMedia(c echo.Context) error {
	mediaId := c.FormValue("mediaId")
	if mediaId == "" {
		return utils.ErrorNull(c, "操作失败")
	}
	dir := c.FormValue("dir")
	return downloadMediaId(c, dir, mediaId)
}

func downloadMediaId(c echo.Context, dir, mediaId string) error {
	fileName := utils.ID()
	filePath := fmt.Sprintf("%s%s/%s/%d.jpg", global.FileConf.Path, dir, utils.CurrentDateByPlace("/"), fileName)
	written, err := global.MediaClient.DownloadMedia(mediaId, filePath)
	if err != nil {
		global.Log.Error("下载临时二维码失败，ERROR：", err.Error())
		return utils.ErrorNull(c, "操作失败")
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
