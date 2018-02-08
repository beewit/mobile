new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/home.html',
			title: '工蜂引流 - 领取现金红包'
		},
		id: null,
		shareNum: 0,
		fileHost: config.fileHost,
		recredPacketNum: 0,
		recredCouponNum: 0,
		couponList: [],
		redPacketList: [],
		redPacket: {
			send_photo: config.defaultPhoto,
			send_name: "工蜂引流",
			blessings: "祝大家新年快乐",
		},
		sendPhotoImg: null,
		loadEnd: false,
		openShareTip: false
	},
	mounted: function () {
		var that = this;
		this.id = common.getQueryString("id");
		this.getRedPacket();

		wechatSDK.initConfig(['chooseImage', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo'], function () {
			that.initShare();
		});
	},
	methods: {
		initShare: function () {
			var that = this;
			if (!that.loadEnd) {
				setTimeout(function () {
					that.initShare();
				}, 100);
			}
			wechatSDK.initShare(
				that.redPacket.send_name + "，发现金红包啦！",
				location.href,
				fileDoMain + that.sendPhotoImg,
				that.redPacket.blessings,
				function () {
					that.openShareTip = false;
					that.addShare();
				},
				function () {},
				function (e) {
					alert(JSON.stringify(e));
				});
		},
		receiveCoupon: function () {
			var that = this;
			if (!that.redPacket) {
				return
			}
			if (that.redPacket.review_status != "审核通过") {
				layer.alert('红包未通过审核无法领取', {
					icon: 0,
					title: '温馨提示'
				})
				return;
			}
			if (that.shareNum <= 0) {
				that.openShareTip = true;
				/* layer.alert('你还没有分享红包哦，点击下面的去分享！', {
					icon: 0,
					title: '温馨提示'
				}) */
				return;
			}
			location.href = '/red_packet/pages/receive/coupon.html?id=' + that.redPacket.id;
		},
		receiveRedPacketTap: function () {
			var that = this;
			if (!that.redPacket) {
				return
			}
			if (that.redPacket.review_status != "审核通过") {
				layer.alert('红包未通过审核无法领取', {
					icon: 0,
					title: '温馨提示'
				})
				return;
			}
			if (that.shareNum <= 0) {
				that.openShareTip = true;
				/* layer.alert('你还没有分享红包哦，点击下面的去分享！', {
					icon: 0,
					title: '温馨提示'
				}) */
				return;
			}
			that.receiveRedPacket();
		},
		closeShare: function () {
			this.openShareTip = false;
		},
		receiveRedPacket: function () {
			var that = this;
			common.ajax({
				succTip: false,
				url: config.receiveRedPacketUrl,
				data: {
					id: that.id
				},
				success: function () {
					location.href = '/red_packet/pages/receive/red_packet_detail.html?id=' + that.redPacket.id;
				}
			})
		},
		getRedPacket: function () {
			var that = this;
			//加载当前页的红包数据
			common.ajax({
				url: config.redPacketReceiveRecordUrl,
				data: {
					id: that.id
				},
				success: function (res) {
					if (res.ret == 200) {
						if (res.data.redPacket.pay_state == "已支付") {
							that.loadEnd = true;
							that.sendPhotoImg = res.data.redPacket.send_photo;
							res.data.redPacket.send_photo = config.getFilePath(res.data.redPacket.send_photo);
							that.recredCouponNum = res.data.couponList.length;
							that.recredPacketNum = res.data.redPacketList.length;
							that.couponList = res.data.couponList;
							that.redPacketList = res.data.redPacketList;
							that.redPacket = res.data.redPacket;

							that.getShareNum();
							that.addRedPacketAccessLog();
						} else {
							location.href = "/red_packet/pages/user/home.html";
						}
					}
				}
			})
		},
		addShare: function () {
			var that = this;
			if (!that.redPacket) {
				layer.alert('未获取到红包信息', {
					icon: 0,
					title: '温馨提示'
				})
				return
			}
			common.ajax({
				url: config.shareRedPacketUrl,
				data: {
					id: that.redPacket.id
				},
				success: function () {
					that.shareNum = 1
				}
			});
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
				}
			});
		},
		addRedPacketAccessLog: function () {
			var that = this;
			if (!that.redPacket) {
				return
			}
			var that = this;
			common.ajax({
				errTip: false,
				succTip: false,
				loadTip: false,
				url: config.addRedPacketAccessLogUrl,
				data: {
					id: that.redPacket.id
				},
				success: function (res) {}
			});
		}
	}
});