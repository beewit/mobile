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
		}
	},
	mounted: function() {
		this.id = common.getQueryString("id");
		this.getRedPacket();
	},
	methods: {
		receiveCoupon: function() {
			if(!this.data.redPacket) {
				return
			}
			if(this.data.redPacket.review_status != "审核通过") {
				wx.showModal({
					title: '提示',
					showCancel: false,
					content: '红包未通过审核无法领取',
					success: function(res) {

					}
				})
			}
			if(this.data.shareNum <= 0) {
				wx.showModal({
					title: '提示',
					showCancel: false,
					content: '你还没有分享红包哦，点击下面的去分享！',
					success: function(res) {
						if(res.confirm) {
							console.log('用户点击确定')
						}
					}
				})
				return
			}
			if(app.globalData.userInfo) {
				wx.navigateTo({
					url: '/red_packet/pages/receive/coupon?id=' + this.data.redPacket.id,
				})
			} else {
				wx.openSetting({
					success: (res) => {
						if(res.authSetting['scope.userInfo']) {
							wx.navigateTo({
								url: '/red_packet/pages/receive/coupon?id=' + this.data.redPacket.id,
							})
						}
					}
				})
			}
		},
		receiveRedPacketTap: function() {
			if(!this.redPacket) {
				return
			}
			if(this.redPacket.review_status != "审核通过") {
				layer.alert('红包未通过审核无法领取', {
					icon: 1,
					title: '温馨提示'
				})
				return;
			}
			if(this.shareNum <= 0) {
				layer.alert('你还没有分享红包哦，点击下面的去分享！', {
					icon: 1,
					title: '温馨提示'
				})
				return;
			}
			var that = this;
			that.receiveRedPacket();
		},
		receiveRedPacket: function() {
			var that = this;
			common.ajax({
				succTip: false,
				url: config.receiveRedPacketUrl,
				data: {
					id: that.id
				},
				success: function() {
					location.href = '/red_packet/pages/receive/red_packet_detail.html?id=' + that.redPacket.id;
				}
			})
		},
		getRedPacket: function() {
			var that = this;
			//加载当前页的红包数据
			common.ajax({
				url: config.redPacketReceiveRecordUrl,
				data: {
					id: that.id
				},
				success: function(res) {
					if(res.ret == 200) {
						if(res.data.redPacket.pay_state == "已支付") {
							res.data.redPacket.send_photo = config.getFilePath(res.data.redPacket.send_photo);
							that.recredCouponNum = res.data.couponList.length;
							that.recredPacketNum = res.data.redPacketList.length;
							that.couponList = res.data.couponList;
							that.redPacketList = res.data.redPacketList;
							that.redPacket = res.data.redPacket;

							that.getShareNum();
							that.addRedPacketAccessLog();
						} else {
							util.toastError("无效红包")
							location.href = "/red_packet/pages/user/home.html";
						}
					}
				}
			})
		},
		addShare: function() {
			var that = this;
			if(!that.redPacket) {
				util.toastError("未获取到红包信息")
				return
			}
			common.ajax({
				url: config.shareRedPacketUrl,
				data: {
					id: that.redPacket.id
				},
				success: function() {
					that.shareNum = 1
				}
			});
		},
		getShareNum: function() {
			var that = this;
			if(!that.redPacket) {
				return
			}
			var that = this;
			common.ajax({
				url: config.shareRedPacketNumUrl,
				data: {
					id: that.redPacket.id
				},
				success: function(res) {
					that.shareNum = res.data
				}
			});
		},
		addRedPacketAccessLog: function() {
			var that = this;
			if(!that.redPacket) {
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
				success: function(res) {}
			});
		}
	}
});