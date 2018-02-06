window.onload = function() {
	var calendar = new datePicker();
	calendar.init({
		'trigger': '#expireTime',
		/*按钮选择器，用于触发弹出插件*/
		'type': 'date',
		/*模式：date日期；datetime日期时间；time时间；ym年月；*/
		'minDate': new Date((new Date()).getTime() + 24 * 60 * 60 * 1000).format("yyyy-MM-dd"),
		/*最小日期*/
		'maxDate': new Date((new Date()).getTime() + 5 * 365 * 24 * 60 * 60 * 1000).format("yyyy-MM-dd"),
		/*最大日期*/
		'onSubmit': function() { /*确认时触发事件*/
			var theSelectData = calendar.value;
		},
		'onClose': function() { /*取消时触发事件*/ }
	});
};
new Vue({
	el: '#app',
	data: {
		nav: {
			back: "false",
			title: "发红包" 
		},
		model: {
			sendName: "张三",
			sendPhoto: null,
		},
		photoImage: null,
		isLoginAccount: true,
		expireComponyFunc: true,
		Loading: false,
	},
	methods: { 
		submit: function() {
			console.log(this.model);
			var that = this;
			common.ajax({
				url: config.addCouponUrl,
				data: that.model,
				success: function(res) {
					localStorage.setItem("sendCouponName", that.model.sendName)
					localStorage.setItem("sendCouponPhoto", that.model.sendName)
					//存储土豪、头像缓存
					wx.setStorageSync("sendRedPacketName", e.detail.value.sendName);
					wx.setStorageSync("sendRedPacketPhoto", e.detail.value.sendPhoto);
					app.paymentRedPacket(res.data,
						function(flog) {
							that.setData({
								Loading: false
							})
							if(flog) {
								util.toastErrorWin("红包正在审核中，请耐心等待审核结果！可在“我的->发出的红包”中查看审核结果")
							}
						});
					that.formReset();
				}
			})
		}
	}
});