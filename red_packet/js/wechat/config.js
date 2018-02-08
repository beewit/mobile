//1、引入js文件 http://res.wx.qq.com/open/red_packet/js/jweixin-1.2.0.js
var wechatSDK = {
	init: false,
	initConfig: function (jsApiList, succ, err) {
		this.setConfig(jsApiList, succ, err)
	},
	setConfig: function (jsApiList, succ, err) {
		//ajax请求获取config参数
		common.ajax({
			succTip: false,
			url: config.wechatJsSDKConfigUrl,
			data: {
				url: location.href
			},
			success: function (res) {
				wx.config({
					debug: false,
					appId: res.data.appId,
					timestamp: res.data.timestamp,
					nonceStr: res.data.noncestr,
					signature: res.data.signature,
					jsApiList: jsApiList
				});

				wx.ready(function () {
					console.log("ready ok ");
					if (succ) {
						succ();
					}
				});

				wx.error(function (res) {
					console.log("error: " + res);
					if (err) {
						err(res);
					}
				});
			}
		})
	},
	chooseImage: function (num, succ, err) {
		var that = this;
		wx.chooseImage({
			count: num ? num : 1, // 默认9
			sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片 
				console.log(res);
				for (var i = 0; i < localIds.length; i++) {
					that.wxuploadImage(localIds[i], succ, err);
				}
			},
			fail: function (error) {
				console.log(error)
				if (err) {
					err("chooseImage error：" + error);
				}
			}
		});
		return;
	},
	wxuploadImage: function (localId, succ, err) {
		var that = this;
		wx.uploadImage({
			localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得  
			isShowProgressTips: 1, // 默认为1，显示进度提示  
			success: function (res) {
				var mediaId = res.serverId; // 返回图片的服务器端ID  
				that.downloadMedia(mediaId, succ, err);
			},
			fail: function (error) {
				console.log(error)
				if (err) {
					err("wxuploadImage error：" + error);
				}
			}

		});
	},
	downloadMedia: function (mediaId, succ, err) {
		var that = this;
		common.ajax({
			succTip: false,
			url: config.wechatMediaDownloadUrl,
			data: {
				mediaId: mediaId,
				dir: "red_packet/wechat",
			},
			success: function (res) {
				console.log(res)
				if (succ) {
					succ(res);
				}
			},
			fail: function (error) {
				console.log(error)
				if (err) {
					err("downloadMedia error：" + error);
				}
			}
		});
	},
	paymentRedPacket: function (id, backFunc) {
		var that = this;
		common.ajax({
			url: config.payUrl,
			data: {
				"id": id,
				"type": "微信H5",
			},
			success: function (res) {
				//that.requestPayment(res, '/pages/receive/index?id=' + id, backFunc)
				that.requestPayment(res, null, backFunc)
			},
			error: function () {
				layer.msg("支付失败", {
					icon: 0
				});
			}
		})
	},
	paymentFunc: function (funcId, fcId, backFunc) {
		var that = this;
		common.ajax({
			url: config.payFuncCreateOrderUrl,
			data: {
				"body": "开通红包裂变企业版",
				"subject": "开通红包裂变企业版",
				"fcId": fcId,
				"funcId": funcId,
				"pt": "微信H5",
			},
			success: function (res) {
				//'/pages/user/open/func'
				that.requestPayment(res, '/red_packet/pages/user/open/func.html', backFunc)
			},
			error: function () {
				layer.msg("支付失败", {
					icon: 0
				});
				typeof backFunc == "function" && backFunc(false)
			}
		})
	},
	paymentOrder: function (orderId, backFunc) {
		var that = this;
		common.ajax({
			url: config.payFuncOrderUrl,
			data: {
				"body": "开通红包裂变企业版",
				"subject": "开通红包裂变企业版",
				"orderId": orderId,
			},
			success: function (res) {
				that.requestPayment(res, '/red_packet/pages/user/open/func.html', backFunc)
			},
			error: function () {
				layer.msg("支付失败", {
					icon: 0
				});
				typeof backFunc == "function" && backFunc(false)
			}
		})
	},
	requestPayment: function (res, url, backFunc) {
		var that = this;
		wx.chooseWXPay({
			timestamp: res.data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
			nonceStr: res.data.noncestr, // 支付签名随机串，不长于 32 位
			package: res.data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
			signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
			paySign: res.data.sign, // 支付签名
			success: function (e) {
				// 支付成功后的回调函数
				console.log("chooseWXPay success：" + e)
				//检查支付状态 
				layer.msg('正在检查支付..', {
					icon: 6,
					time: -1
				});
				that.checkPayment(res.data.tradeNo, url, backFunc)
			},
			fail: function (res) {
				alert(JSON.stringify(res));
				console.log("chooseWXPay error：" + res)
				layer.msg("支付失败", {
					icon: 0
				});
				typeof backFunc == "function" && backFunc(false)
			}
		});
	},
	checkPayment: function (tradeNo, url, backFunc) {
		try {
			var that = this;
			common.ajax({
				loadTip: false,
				errTip: false,
				url: config.payCheckUrl,
				data: {
					"tradeNo": tradeNo
				},
				success: function (res) {
					try {
						if (res.ret == 200) {
							layer.closeAll();
							typeof backFunc == "function" && backFunc(true)
							if (url) {
								location.href = url;
							}
						} else {
							setTimeout(function () {
								that.checkPayment(tradeNo, url)
							}, 1000)
						}
					} catch (e) {
						alert(JSON.stringify(e));
					}
				},
				error: function (res) {
					alert(JSON.stringify(res));
					try {
						setTimeout(function () {
							that.checkPayment(tradeNo, url)
						}, 1000)
					} catch (e) {
						alert(JSON.stringify(e));
					}
				}
			})
		} catch (e) {
			alert(JSON.stringify(e));
		}
	},
	previewImage: function (current, urls) {
		wx.previewImage({
			current: current, // 当前显示图片的http链接
			urls: urls // 需要预览的图片http链接列表
		});
	},
	scanQRCode: function (resFunc) {
		wx.scanQRCode({
			needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
			success: function (res) {
				var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
				resFunc(result);
			},
			fail: function (e) {
				layer.msg("扫码失败", {
					icon: 0
				});
			}
		});
	},
	initShare: function (title, link, imgUrl, desc, succFunc, canFunc, errFunc) {
		wx.onMenuShareTimeline({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			success: function (e) {
				if (succFunc) {
					succFunc(e);
				}
			},
			cancel: function (e) {
				if (canFunc) {
					canFunc(e);
				}
			},
			fail: function (e) {
				if (errFunc) {
					errFunc(e);
				}
			}
		});
		wx.onMenuShareAppMessage({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			success: function (e) {
				if (succFunc) {
					succFunc(e);
				}
			},
			cancel: function (e) {
				if (canFunc) {
					canFunc(e);
				}
			},
			fail: function (e) {
				if (errFunc) {
					errFunc(e);
				}
			}
		});
		wx.onMenuShareQQ({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			success: function (e) {
				if (succFunc) {
					succFunc(e);
				}
			},
			cancel: function (e) {
				if (canFunc) {
					canFunc(e);
				}
			},
			fail: function (e) {
				if (errFunc) {
					errFunc(e);
				}
			}
		});
		wx.onMenuShareQZone({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			success: function (e) {
				if (succFunc) {
					succFunc(e);
				}
			},
			cancel: function (e) {
				if (canFunc) {
					canFunc(e);
				}
			},
			fail: function (e) {
				if (errFunc) {
					errFunc(e);
				}
			}
		});
	}
};