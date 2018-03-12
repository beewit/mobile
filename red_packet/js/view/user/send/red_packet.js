var wecatInit = false;
new Vue({
	el: '#app',
	data: {
		on: "index",
		nav: {
			back: "false",
			title: "发红包",
			rtext: ""
		},
		index: 0,
		isLoginAccount: true,
		model: {
			sendName: null,
			sendPhoto: null, //config.defaultPhoto,
			randomMoney: 1,
			joinCouponIds: null,
			account_red_packet_card_id: null,
		},
		sendPhotoImage: null, //config.defaultPhoto,
		redPacketCardId: null,
		redPacketCardName: null,
		feeMoney: 0,
		couponList: {
			PageIndex: 0,
			Data: {}
		},
		cardList: {
			PageIndex: 0,
			Data: {}
		},
		selectCouponList: null,
		expireComponyFunc: true,
		Loading: false,
		arrayRandomMoney: [{
				id: 1,
				name: "1元"
			},
			{
				id: 3,
				name: "1~3元"
			},
			{
				id: 5,
				name: "1~5元"
			},
			{
				id: 10,
				name: "1~10元"
			},
			{
				id: 20,
				name: "1~20元"
			},
			{
				id: 30,
				name: "1~30元"
			},
			{
				id: 50,
				name: "1~50元"
			},
			{
				id: 100,
				name: "1~100元"
			},
			{
				id: 200,
				name: "1~200元"
			}
		]
	},
	mounted: function () {
		var that = this;
		that.model.sendName = Cookies.get('sendRedPacketName');
		that.model.sendPhoto = Cookies.get('sendRedPacketPhoto');
		if (!common.isEmpty(that.model.sendPhoto)) {
			that.sendPhotoImage = fileDoMain + that.model.sendPhoto;
		}
		wechatSDK.initConfig(['chooseImage', 'uploadImage', 'previewImage', 'chooseWXPay'], function () {
			wecatInit = true;
		});
		common.getToken(function (flog) {
			if (!flog) {
				that.isLoginAccount = false;
			} else {
				common.getEffectiveFuncById(common.redPacketFuncId, function () {
					that.expireComponyFunc = common.getRedPacketFuncExpireTime()
					if (!that.expireComponyFunc) {
						that.getRedPacketCardDef();
					}
				})
				that.getCouponList(1, function () {

				});
			}
		})
	},
	methods: {
		backClick: function () {
			this.on = 'index';
			this.nav.back = 'false';
			this.nav.title = '发红包';
		},
		chooseImage: function (event) {
			var that = this;
			if (wecatInit) {
				wechatSDK.chooseImage(1, function (res) {
					that.model.sendPhoto = res.data.path;
					that.sendPhotoImage = res.data.url;
				}, function (err) {
					layer.msg("上传失败", {
						icon: 0
					});
				});
				return;
			}
			layer.msg("刷新页面重试");
		},
		changeRandomMoney: function (id) {
			this.model.randomMoney = id;
			console.log(event)
		},
		tapSelectCoupon: function (index) {
			if (this.couponList.Data[index].cls) {
				Vue.set(this.couponList.Data[index], 'cls', null)
			} else {
				Vue.set(this.couponList.Data[index], 'cls', 'active')
			}
			var arr = new Array();
			for (var index in this.couponList.Data) {
				if (this.couponList.Data[index].cls) {
					arr.push(this.couponList.Data[index].id)
				}
			}
			this.model.joinCouponIds = arr.join(",");
		},
		submit: function () {
			console.log(this.model);
			var that = this;
			common.ajax({
				url: config.sendRedPacketUrl,
				data: that.model,
				success: function (res) {
					//存储土豪、头像缓存
					Cookies.set("sendRedPacketName", that.model.sendName, {
						expires: 30
					});
					Cookies.set("sendRedPacketPhoto", that.model.sendPhoto, {
						expires: 30
					});
					wechatSDK.paymentRedPacket(res.data,
						function (flog) {
							if (flog) {
								layer.msg("支付成功");
								location.href = "/red_packet/pages/receive/red_packet.html?id=" + res.data;
							}
						});
				}
			})
		},
		bindSelectCoupon: function () {
			var that = this;
			this.on = 'coupon';
			this.nav.back = true;
			this.nav.title = '选择展示现金券';

			if (this.couponList.PageIndex == 1) {
				that.couponList = {
					PageIndex: 0,
					Data: {}
				}
				setTimeout(function () {
					common.scroll("#contentCoupon", function (load, reset) {
						loadPage = load;
						that.getCouponList(1, reset);
					}, function (load, reset) {
						loadPage = load;
						that.getCouponList(that.couponList.PageIndex + 1, reset);
					});
				}, 100);
			}
		},
		bindSelectRedPacketCard: function () {
			var that = this;
			this.on = 'redpacket';
			this.nav.back = true;
			this.nav.title = '选择红包名片';
			if (this.cardList.PageIndex == 0) {
				setTimeout(function () {
					common.scroll("#contentCard", function (load, reset) {
						loadPage = load;
						that.getCardList(1, reset);
					}, function (load, reset) {
						loadPage = load;
						that.getCardList(that.cardList.PageIndex + 1, reset);
					});
				}, 100);
			}
		},
		getCouponList: function (pageIndex, backFunc) {
			var that = this;
			common.ajax({
				url: config.getCouponListUrl,
				data: {
					pageIndex: pageIndex
				},
				success: function (res) {
					if (pageIndex == 1) {
						that.couponList = res.data;
						if (res.data.Count <= 0) {
							//提示代金券编辑
							setTimeout(function () {
								layer.alert("本次发送红包是否附加现金券？", {
									title: '温馨提示',
									icon: 6,
									btn: ["立即发现金券", "不发"]
								}, function () {
									location.href = '/red_packet/pages/user/send/coupon.html';
								});
							}, 100);
						}
					} else {
						that.couponList.Data.reverse()
						for (var d in that.couponList.Data) {
							res.data.Data.push(that.couponList.Data[d])
						}
						that.couponList.Data.reverse()
						res.data.isLoadData = true;
						that.couponList = res.data;
					}
					Vue.set(that, "couponList", that.couponList);
					setTimeout(function () {
						typeof backFunc == "function" && backFunc(res);
					}, 500);
				},
				error: function () {
					setTimeout(function () {
						typeof backFunc == "function" && backFunc(null);
					}, 500);
				}
			});
		},
		getCardList: function (pageIndex, backFunc) {
			var that = this;
			common.ajax({
				url: config.getRedPacketCardListUrl,
				data: {
					pageIndex: pageIndex
				},
				success: function (res) {
					if (pageIndex == 1) {
						that.cardList = res.data;
					} else {
						that.cardList.Data.reverse()
						for (var d in that.cardList.Data) {
							res.data.Data.push(that.cardList.Data[d])
						}
						res.data.Data.reverse()

						that.cardList = res.data;
					}
					setTimeout(function () {
						typeof backFunc == "function" && backFunc(res);
					}, 500);
				},
				error: function () {
					setTimeout(function () {
						typeof backFunc == "function" && backFunc(null);
					}, 500);
				}
			})
		},
		selectCard: function (id, name) {
			var that = this;
			//that.model.redPacketCardId = id;
			that.redPacketCardName = name;
			that.model.account_red_packet_card_id = id;
			that.on = 'index';
			that.nav.back = 'false';
			that.nav.title = '发红包';
		},
		getRedPacketCardDef: function () {
			var that = this;
			if (that.expireComponyFunc || that.redPacketCardId) {
				return;
			}
			common.ajax({
				url: config.getRedPacketCardDefUrl,
				success: function (res) {
					that.model.account_red_packet_card_id = res.data.id;
					that.redPacketCardName = res.data.name;
				}
			})
		}
	}
});