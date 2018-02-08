new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: null,
			title: '工蜂引流 - 发红包啦！'
		},
		id: null,
		qrcode: null,
		redPacket: {
			send_photo: config.defaultPhoto,
			send_name: "工蜂引流",
			blessings: "祝大家新年快乐",
		},
		card: {
			name: "红包裂变",
			contact: "红包裂变，1天可达10万人。",
			tel: null,
			address: "官网：www.9ee3.com",
		},
		shareNum: 0
	},
	mounted: function () {
		wechatSDK.initConfig(['hideAllNonBaseMenuItem'], function () {
			wx.hideAllNonBaseMenuItem();
		});
		this.id = common.getQueryString("id");
		this.nav.lhref = '/red_packet/pages/receive/red_packet.html?id=' + this.id;
		this.getRedPacket();
		this.receiveRedPacket();
	},
	methods: {
		getRedPacket: function () {
			var id = this.id;
			var that = this;
			//加载当前页的红包数据
			common.ajax({
				url: config.redPacketUrl,
				data: {
					id: id
				},
				success: function (res) {
					if (res.ret == 200) {
						if (res.data.pay_state == "已支付") {
							res.data.send_photo = config.getFilePath(res.data.send_photo);
							that.redPacket = res.data;
							if (res.data.card) {
								that.card = res.data.card;
							}
							that.nav.title = res.data.send_name + " - 发红包啦！"
							document.title = that.nav.title;
							that.getShareNum();
						} else {
							location.href = "/red_packet/pages/user/home.html";
						}
					}
				}
			})
		},
		receiveRedPacket: function () {
			var that = this;
			common.ajax({
				succTip: false,
				url: config.receiveRedPacketUrl,
				data: {
					id: that.id
				},
				success: function (res) {
					that.qrcode = config.getFilePath(res.data.qrcode)
				}
			})
		},
		getShareNum: function () {
			var that = this;
			if (!that.redPacket) {
				return
			}
			var that = this;
			common.ajax({
				url: config.shareRedPacketNumUrl,
				data: {
					id: that.redPacket.id
				},
				success: function (res) {
					that.shareNum = res.data
					if (that.shareNum <= 0) {
						location.href = that.nav.lhref;
					}
				}
			});
		}
	}
});