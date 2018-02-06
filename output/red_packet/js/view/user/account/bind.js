new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/home.html',
			title: '账号绑定'
		},
		loading: false,
		inputPwd: false,
		Account: {},
		model:{},
		code: null,
		mobile: null,
		mobileCode: "获取验证码",
		mobileCodeBtn: true,
		ImgCodeUrl: config.imgCodeUrl,
	},
	methods: {
		tapImgCode: function() {
			var imgCodeUrl = config.imgCodeUrl + "?miniAppSessionId=" +
				app.globalData.loginAccount.mini_app_session_id + "&i=" + Date.parse(new Date());

			console.log(imgCodeUrl)
			this.setData({
				ImgCodeUrl: imgCodeUrl
			})
		},
		submit: function(e) {
			common.ajax({
				url: config.bindAccountUrl,
				data: e.detail.value,
				success: function() {
					app.loginAll();
					setTimeout(function() {
						wx.navigateBack({
							url: "/red_packet/pages/user/home/index"
						})
					}, 1000);
				}
			});
		},
		sendSMSCode: function(e) {
			var mobile = this.data.mobile
			var code = this.data.code
			if(mobile.length != 11 || isNaN(mobile)) {
				util.toastErrorWin("请输入有效的手机号码")
				return
			}
			if(!code || isNaN(code)) {
				util.toastErrorWin("请输入图形验证码")
				return
			}
			common.ajax({
				url: config.sendSmsCodeUrl,
				data: {
					mobile: mobile,
					code: code
				}
			});
		},
		checkMobile: function(mobile) {
			var that = this;
			common.ajax({
				loadTip: false,
				succTip: false,
				errTip: false,
				url: config.CheckRegMobileUrl,
				data: {
					mobile: mobile
				},
				success: function() {
					that.setData({
						inputPwd: true
					})
				},
				fail: function() {
					that.setData({
						inputPwd: false
					})
				}
			})
		}
	}
});