package handler

import (
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp"
	"github.com/beewit/wechat/mp/message/request"
	"github.com/beewit/wechat/mp/message/response"
	"github.com/beewit/wechat/mp/mmpaymkttransfers"
	"github.com/beewit/wechat/util"
	"net/http"
)

func ErrorHandler(w http.ResponseWriter, r *http.Request, err error) {
	global.Log.Info(err.Error())
}

// 文本消息的 Handler
func TextMessageHandler(w http.ResponseWriter, r *mp.Request) {
	// 简单起见，把用户发送过来的文本原样回复过去
	text := request.GetText(r.MixedMsg) // 可以省略, 直接从 r.MixedMsg 取值
	resp := response.NewText(text.FromUserName, text.ToUserName, text.CreateTime, text.Content)
	mp.WriteRawResponse(w, r, resp)
}

// 关注事件 Handler
func SubscribeHandler(w http.ResponseWriter, r *mp.Request) {
	// 简单起见，把用户发送过来的文本原样回复过去
	event := request.GetScanEvent(r.MixedMsg) // 可以省略, 直接从 r.MixedMsg 取值
	//event.FromUserName
	global.Log.Info("%s %s %s %s", event.FromUserName, event.ToUserName, event.EventKey, event.Event)
	resp := response.NewText(event.FromUserName, event.ToUserName, event.CreateTime, "你好！欢迎关注工蜂小智")
	isSendRedPack := false
	if isSendRedPack {
		//查询红包来源，判断是否有领红包可能
		client, err := mp.NewTLSHttpClient("/home/zxb/cert/apiclient_cert.pem", "/home/zxb/cert/apiclient_key.pem")
		if err != nil {
			global.Log.Error("NewTLSHttpClient ERROR：%s", err.Error())
		} else {
			proxy := mp.NewProxy(global.WechatConf.AppID, global.WechatConf.MchID, global.WechatConf.APIKey, client)
			req := map[string]string{}
			billno := utils.ID()
			req["nonce_str"] = util.GenerateNonceStr()
			req["mch_billno"] = convert.ToString(billno)
			req["mch_id"] = global.WechatConf.MchID
			req["wxappid"] = global.WechatConf.AppID
			//商户名称
			req["send_name"] = "工蜂小智"
			req["re_openid"] = event.FromUserName
			req["total_amount"] = "100" //单位分
			//红包发放总人数
			req["total_num"] = "1"
			//红包祝福语
			req["wishing"] = "新年快乐"
			//调用接口的机器Ip地址
			req["client_ip"] = "106.14.169.82"
			//活动名称
			req["act_name"] = "迎新晚会"
			//备注
			req["remark"] = "快来参加呀！"
			/*
			发放红包使用场景，红包金额大于200时必传
				PRODUCT_1:商品促销
				PRODUCT_2:抽奖
				PRODUCT_3:虚拟物品兑奖
				PRODUCT_4:企业内部福利
				PRODUCT_5:渠道分润
				PRODUCT_6:保险回馈
				PRODUCT_7:彩票派奖
				PRODUCT_8:税务刮奖
			*/
			req["scene_id"] = "PRODUCT_1"

			req["sign"] = mp.Sign(req, global.WechatConf.APIKey, nil)

			global.Log.Info(convert.ToObjStr(req))

			packResp, err := mmpaymkttransfers.SendRedPack(proxy, req)
			if err != nil {
				global.Log.Error("发送红包失败，ERROR：%s", err.Error())
			} else {
				if packResp["result_code"] == mp.ResultCodeSuccess {
					//发送红包成功，进行扣款
					global.Log.Info("发送红包成功，进行扣款")
				} else {
					global.Log.Error("发送红包错误，错误代码：%s，错误代码描述：%s", packResp["err_code"], packResp["err_code_des"])
				}
			}
		}
	}
	mp.WriteRawResponse(w, r, resp)
}
