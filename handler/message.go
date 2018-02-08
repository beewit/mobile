package handler

import (
	"fmt"
	"github.com/beewit/wechat/mp/message"
	"net/http"
	"strings"
	"time"

	"github.com/beewit/beekit/mysql"
	"github.com/beewit/beekit/utils"
	"github.com/beewit/beekit/utils/convert"
	"github.com/beewit/beekit/utils/enum"
	"github.com/beewit/mobile/global"
	"github.com/beewit/wechat/mp"
	"github.com/beewit/wechat/mp/message/request"
	"github.com/beewit/wechat/mp/message/response"
	"github.com/beewit/wechat/mp/mmpaymkttransfers"
	"github.com/beewit/wechat/mp/userinfo"
	"github.com/beewit/wechat/util"
)

func ErrorHandler(w http.ResponseWriter, r *http.Request, err error) {
	global.Log.Info(err.Error())
}

// 文本消息的 Handler
func TextMessageHandler(w http.ResponseWriter, r *mp.Request) {
	// 简单起见，把用户发送过来的文本原样回复过去
	start := time.Now()
	text := request.GetText(r.MixedMsg) // 可以省略, 直接从 r.MixedMsg 取值
	resp := response.NewText(text.FromUserName, text.ToUserName, text.CreateTime, text.Content)
	if text.Content == "提现老板现金红包余额不足" {
		sendTemplateMessage()
	}
	mp.WriteRawResponse(w, r, resp)
	global.Log.Info("TextMessageHandler 耗时：%v", time.Since(start))
}

// 已关注扫码事件 Handler
func ScanHandler(w http.ResponseWriter, r *mp.Request) {
	start := time.Now()
	// 简单起见，把用户发送过来的文本原样回复过去
	event := request.GetScanEvent(r.MixedMsg) // 可以省略, 直接从 r.MixedMsg 取值
	global.Log.Info("%s %s %s %s", event.FromUserName, event.ToUserName, event.EventKey, event.Event)
	tip := sendRedPacket(event.EventKey, event.FromUserName)
	resp := response.NewText(event.FromUserName, event.ToUserName, event.CreateTime, tip)
	mp.WriteRawResponse(w, r, resp)
	global.Log.Info("ScanHandler 耗时：%v", time.Since(start))
}

// 扫码关注事件 Handler
func SubscribeHandler(w http.ResponseWriter, r *mp.Request) {
	start := time.Now()
	// 简单起见，把用户发送过来的文本原样回复过去
	event := request.GetScanEvent(r.MixedMsg) // 可以省略, 直接从 r.MixedMsg 取值
	//event.FromUserName
	global.Log.Info("%s %s %s %s", event.FromUserName, event.ToUserName, event.EventKey, event.Event)
	tip := sendRedPacket(event.EventKey, event.FromUserName)
	resp := response.NewText(event.FromUserName, event.ToUserName, event.CreateTime, tip)
	mp.WriteRawResponse(w, r, resp)
	global.Log.Info("SubscribeHandler 耗时：%v", time.Since(start))
}

func sendRedPacket(eventKey, openId string) string {
	if eventKey != "" {
		sceneStr := eventKey
		if strings.Contains(sceneStr, "|红包") {
			id := strings.Replace(strings.Replace(sceneStr, "|红包", "", -1), "qrscene_", "", -1)
			if utils.IsValidNumber(id) {
				//判断该用户是否领取过此红包
				rows, err := global.DB.Query("SELECT * FROM v_account_receive_red_packet WHERE receiveId=? LIMIT 1", id)
				if err != nil {
					global.Log.Error("SELECT v_account_receive_red_packet sql error:%s", err.Error())
					return "领取红包失败"
				}

				if rows != nil && len(rows) == 1 {
					receiveRedPacket := rows[0]
					if convert.ToString(receiveRedPacket["receiveStatus"]) != enum.RED_PACKET_STATUS_NOT {
						return "红包已被领取"
					}
					redPacketId := convert.MustInt64(receiveRedPacket["id"])
					receiveRedPacketId := convert.MustInt64(receiveRedPacket["receiveId"])
					//判断红包是否领完
					money := convert.MustFloat64(receiveRedPacket["money"])
					//发送的金额
					sendMoney := convert.MustFloat64(receiveRedPacket["send_money"])
					//随机金额
					randomMoney := convert.MustFloat64(receiveRedPacket["random_money"])
					//红包总金额，随机金额，小于0不能修改，剩余金额小于1
					if money < 1 || randomMoney < 1 || money-sendMoney < 1 {
						return "红包已领完"
					}
					billno := utils.ID()
					token, err := global.AccClient.Token()
					if err != nil {
						global.Log.Error("token获取失败：%s", err.Error())
						return "获取用户验证失败"
					}
					u, err := userinfo.GetUserInfo(token, openId)
					if err != nil {
						return "获取用户验证失败"
					}
					//如果余额小于随机金额，则最大随机金额为余额
					balanceMoney := money - sendMoney
					if balanceMoney < randomMoney {
						randomMoney = balanceMoney
					}
					var receiveMoney float64
					//1元则不用随机，直接发放
					if randomMoney != 1 {
						//当红包随机金额大于5元的时候，进行降低大红包中奖几率
						if randomMoney > 5 {
							//超大红包继续放大中奖几率
							n := 1
							maxRandom := 5
							if randomMoney > 50 {
								n = 100
								maxRandom = 15
							}
							if randomMoney > 100 {
								n = 1000
								maxRandom = 45
							}
							//大红包的时候，降低中标几率，在进行随机10000，大于9000的随机数，才有几率领取大红包
							risk := 10000 * n
							r := utils.NewRandom().NumberByInt(1, risk)
							maxRisk := 9000 * n
							if r < maxRisk {
								//最高为5的随机数
								randomMoney = convert.MustFloat64(maxRandom)
							}
						}
						receiveMoney = utils.NewRandom().NumberByFloat(1.0, randomMoney)
					} else {
						receiveMoney = 1
					}
					if receiveMoney < 1 {
						global.Log.Error("发送红包金额小于1")
						return "发送红包失败，请稍后重试"
					}
					if u != nil && receiveRedPacket["wx_union_id"] == u.Unionid {
						//发放红包操作
						flog := false
						global.DB.Tx(func(tx *mysql.SqlConnTransaction) {
							x, err := tx.Update("UPDATE account_receive_red_packet SET status=?,receive_time=?,billno=?,wx_m_headimgurl=?,wx_m_country=?,wx_m_province=?,wx_m_city=?,wx_m_sex=?,wx_m_nickname=?,wx_m_open_id=?,money=? WHERE id=? AND status=?",
								enum.RED_PACKET_STATUS_ING, utils.CurrentTime(), billno, u.Headimgurl, u.Country, u.Province, u.City, u.Sex, u.Nickname, u.Openid, receiveMoney, receiveRedPacketId, enum.RED_PACKET_STATUS_NOT)
							if err != nil {
								global.Log.Error("update account_receive_red_packet  receiveMoney:%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v sql error:%s ", enum.RED_PACKET_STATUS_ING, utils.CurrentTime(), billno, u.Headimgurl, u.Country, u.Province, u.City, u.Sex, u.Nickname, u.Openid, receiveMoney, err.Error())
								panic(err)
							}
							if x <= 0 {
								global.Log.Error("修改领取红包记录失败：%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v", enum.RED_PACKET_STATUS_ING, utils.CurrentTime(), billno, u.Headimgurl, u.Country, u.Province, u.City, u.Sex, u.Nickname, u.Openid, receiveMoney)
								panic(err)
							}
							x, err = tx.Update("UPDATE account_send_red_packet SET send_money=send_money+? WHERE id=? AND status=? AND pay_state=? AND money>=send_money+?",
								receiveMoney, redPacketId, enum.NORMAL, enum.PAY_STATUS_END, receiveMoney)
							if err != nil {
								global.Log.Error("update account_send_red_packet  receiveMoney:%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v sql error:%s ", enum.RED_PACKET_STATUS_ING, utils.CurrentTime(), billno, u.Headimgurl, u.Country, u.Province, u.City, u.Sex, u.Nickname, u.Openid, receiveMoney, err.Error())
								panic(err)
							}
							if x <= 0 {
								global.Log.Error("修改发送红包已发送记录失败：%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v", enum.RED_PACKET_STATUS_ING, utils.CurrentTime(), billno, u.Headimgurl, u.Country, u.Province, u.City, u.Sex, u.Nickname, u.Openid, receiveMoney)
								panic(err)
							}
							flog = true
						}, func(err error) {
							if err != nil {
								global.Log.Error("领取红包更新失败%v", err)
								flog = false
							}
						})
						if flog {
							//发送红包
							sendFlog, errTip := sendMoneyHandle(openId, billno, convert.MustInt(receiveMoney*100), convert.ToString(receiveRedPacket["blessings"]), convert.ToString(receiveRedPacket["send_name"]), convert.ToString(receiveRedPacket["remarks"]))
							if sendFlog {
								return fmt.Sprintf("已发送红包%.2f元，请点击领取到您的零钱", receiveMoney)
							} else {
								//这里将修改发送失败记录回滚
								global.DB.Tx(func(tx *mysql.SqlConnTransaction) {
									x, err := tx.Update("UPDATE account_receive_red_packet SET status=?,fail_content=? WHERE id=?",
										enum.RED_PACKET_STATUS_FAIL, errTip, receiveRedPacketId)
									if err != nil {
										global.Log.Error("发放失败回滚 update account_receive_red_packet  receiveMoney:%v,%v,%v  sql error:%s ", enum.RED_PACKET_STATUS_FAIL, errTip, receiveRedPacketId, err.Error())
										panic(err)
									}
									if x <= 0 {
										global.Log.Error("发放失败回滚 修改领取红包记录失败：%v,%v,%v", enum.RED_PACKET_STATUS_FAIL, errTip, receiveRedPacketId)
										panic(err)
									}
									x, err = tx.Update("UPDATE account_send_red_packet SET send_money=send_money-? WHERE id=? AND status=? AND pay_state=? AND send_money-?>=0",
										receiveMoney, redPacketId, enum.NORMAL, enum.PAY_STATUS_END, receiveMoney)
									if err != nil {
										global.Log.Error("发放失败回滚 update account_send_red_packet  receiveMoney: %v,%v,%v,%v,%v  sql error:%s ", receiveMoney, redPacketId, enum.NORMAL, enum.PAY_STATUS_END, receiveMoney, err.Error())
										panic(err)
									}
									if x <= 0 {
										global.Log.Error("发放失败回滚 修改发送红包已发送记录失败：%v,%v,%v,%v,%v", receiveMoney, redPacketId, enum.NORMAL, enum.PAY_STATUS_END, receiveMoney)
										panic(err)
									}
									flog = true
								}, func(err error) {
									if err != nil {
										global.Log.Error("发放失败回滚 领取红包更新失败%v", err)
										flog = false
									}
								})
								return errTip
							}
						} else {
							//领取红包失败
							return "红包已经被领完了"
						}
					} else {
						return "该二维码不是你领的红包，请领取红包后识别红包二维码"
					}
				} else {
					return "您未领取红包，请先领取红包"
				}
			} else {
				return "领取红包的二维码错误"
			}
		}
	}
	return "你好！欢迎关注工蜂小智"
}

func sendMoneyHandle(fromUserName string, billno int64, money int, wishing, act_name, remark string) (bool, string) {
	//查询红包来源，判断是否有领红包可能
	client, err := mp.NewTLSHttpClient("/home/zxb/cert/apiclient_cert.pem", "/home/zxb/cert/apiclient_key.pem")
	if err != nil {
		global.Log.Error("NewTLSHttpClient ERROR：%s", err.Error())
		return false, "发放红包失败"
	} else {
		proxy := mp.NewProxy(global.WechatConf.AppID, global.WechatConf.MchID, global.WechatConf.APIKey, client)
		req := map[string]string{}
		req["nonce_str"] = util.GenerateNonceStr()
		req["mch_billno"] = convert.ToString(billno)
		req["mch_id"] = global.WechatConf.MchID
		req["wxappid"] = global.WechatConf.AppID
		//商户名称
		req["send_name"] = "工蜂小智"
		req["re_openid"] = fromUserName
		req["total_amount"] = convert.ToString(money) //单位分
		//红包发放总人数
		req["total_num"] = "1"
		//红包祝福语
		req["wishing"] = wishing
		//调用接口的机器Ip地址
		req["client_ip"] = "106.14.169.82"
		//活动名称
		req["act_name"] = act_name
		//备注
		req["remark"] = remark
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
		//req["scene_id"] = "PRODUCT_4;"

		req["sign"] = mp.Sign(req, global.WechatConf.APIKey, nil)

		global.Log.Info(convert.ToObjStr(req))

		packResp, err := mmpaymkttransfers.SendRedPack(proxy, req)
		//成功返回并没有签名
		if err != nil && !strings.Contains(err.Error(), "no sign parameter") {
			AddSysLog(fmt.Sprintf("发送红包失败，参数:%s", convert.ToString(req)), "ERROR", convert.ToString(packResp), "")
			global.Log.Error("发送红包失败，ERROR：%s", err.Error())
			return false, getErrMsg(convert.ToString(packResp["err_code"]))
		} else {
			var balanceTip string
			if packResp["return_code"] == mp.ReturnCodeSuccess {
				if packResp["result_code"] == mp.ResultCodeSuccess {
					//发送红包成功，进行扣款
					global.Log.Info("发送红包成功，进行扣款")
					AddSysLog(fmt.Sprintf("发送红包成功，参数:%s", convert.ToString(req)), "INFO", convert.ToString(packResp), "")
					return true, ""
				} else {
					global.Log.Error("发送红包失败 result_code:%s ， err_code：%s ， err_code_des：%s", packResp["result_code"], packResp["err_code"], packResp["err_code_des"])
					if packResp["err_code"] == "NOTENOUGH" {
						//余额不足
						balanceTip = "现金红包余额不足"
						//邮件等通知管理员，充值
					}
				}
			} else {
				global.Log.Error("发送红包失败 return_code:%s ， return_msg：%s", packResp["return_code"], packResp["return_msg"])
			}
			AddSysLog(fmt.Sprintf("%s - 发送红包失败，参数:%s", balanceTip, convert.ToString(req)), "ERROR", convert.ToString(packResp), "")
			return false, getErrMsg(convert.ToString(packResp["err_code"]))
		}
	}
}

func getErrMsg(errCode string) string {
	switch errCode {
	case "NO_AUTH":
		return "您的账号异常，已被微信拦截"
	case "SENDNUM_LIMIT":
		return "您今日领取红包个数超过限制"
	case "MONEY_LIMIT":
		return "超出红包金额发放限制"
	case "FREQ_LIMIT":
		return "超过频率限制,请稍后再试"
	case "NOTENOUGH":
		//通知平台商户余额不足，请充值
		sendTemplateMessage()
	}
	return "发放红包失败"
}

func sendTemplateMessage() {
	go func() {
		var tm message.TemplateMessage
		tm.ToUser = "oRDhB0y0UAAnyebgBgaDSQkivZjk"
		tm.TemplateId = "Wb1J0vXwsOL_ROnGxXkm0BtIzNwbXsdsf5tB9sD1DS4"
		tm.Data = map[string]interface{}{
			"first":    "亲爱的老板，现金红包的账户余额不足，希望您尽快充值!",
			"keyword1": map[string]string{"value": "微信商户平台账号"},
			"keyword2": map[string]string{"value": "我不知道"},
			"remark":   "工蜂引流 - 红包助手",
		}
		token, err := global.AccClient.Token()
		if err != nil {
			global.Log.Error("token获取失败：%s", err.Error())
			return
		}
		msgId, err := message.Send(tm, token)
		if err != nil {
			println("error:", err.Error())
		} else {
			println(msgId)
		}
	}()
}

func AddSysLog(title, t, content, ip string) {
	go global.DB.InsertMap("system_logs", map[string]interface{}{
		"id":      utils.ID(),
		"title":   title,
		"type":    t,
		"content": content,
		"ct_time": utils.CurrentTime(),
		"ct_ip":   ip,
	})
}
