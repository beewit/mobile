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
		model: {
			mobile: null
		},
		isLoginAccount: false,
		code: null,
		mobile: null,
		mobileCode: "获取验证码",
		mobileCodeBtn: true,
		ImgCodeUrl: config.imgCodeUrl
	},
	mounted: function () {
		var that = this;
		common.getToken(function (flog, userinfo) {
			if (!flog) {
				that.isLoginAccount = false;
			} else {
				that.Account = userinfo;
				that.isLoginAccount = true;
			}
		})
	},
	methods: {
		tapImgCode: function () {
			var imgCodeUrl = config.imgCodeUrl + "?i=" + Date.parse(new Date());
			this.ImgCodeUrl = imgCodeUrl;
		},
		submit: function (e) {
			var that = this;
			common.ajax({
				url: config.bindAccountUrl,
				data: that.model,
				success: function () {
					location.href = location.href;
				}
			});
		},
		sendSMSCode: function (e) {
			var that = this;
			var mobile = that.model.mobile;
			var code = that.model.code
			if (mobile.length != 11 || isNaN(mobile)) {
				layer.msg("请输入有效的手机号码", {
					icon: 0
				});
				return
			}
			if (common.isEmpty(code)) {
				layer.msg("请输入图形验证码", {
					icon: 0
				});
				return
			}
			that.mobileCodeBtn = true;
			that.mobileCode = "发送中..";
			common.ajax({
				url: config.sendSmsCodeUrl,
				data: {
					mobile: mobile,
					code: code
				},
				success: function () {
					//发送成功，倒计时！  
					that.countdown(60);
				},
				error: function () {
					//发送失败，启用
					that.mobileCodeBtn = false;
					that.mobileCode = "获取验证码";
				}
			});
		},
		countdown: function (sendTime) {
			var that = this;
			if (sendTime <= 0) {
				that.mobileCode = "获取验证码";
				that.mobileCodeBtn = false;
			} else {
				that.mobileCode = sendTime + "s后重新获取";
				sendTime--;
				setTimeout(function () {
					that.countdown(sendTime)
				}, 1000)
			}
		},
		mobileInput: function () {
			var that = this;
			var mobile = that.model.mobile;
			if (mobile && mobile.length == 11) {
				that.mobile = mobile;
				var code = that.model.code;
				if (!common.isEmpty(code) && code.length == 4) {
					that.mobileCodeBtn = false;
				}
				that.checkMobile(mobile)
			} else {
				that.mobile = mobile;
				that.mobileCodeBtn = true;
				that.inputPwd = false;
			}
		},
		imgCodeInput: function () {
			var that = this;
			var mobile = that.model.mobile;
			var code = that.model.code;
			if (mobile && mobile.length == 11 && !common.isEmpty(code) && code.length == 4) {
				that.mobileCodeBtn = false;
			} else {
				that.mobileCodeBtn = true;
			}
		},
		checkMobile: function (mobile) {
			var that = this;
			common.ajax({
				loadTip: false,
				succTip: false,
				errTip: false,
				url: config.CheckRegMobileUrl,
				data: {
					mobile: mobile
				},
				success: function () {
					that.inputPwd = true;
				},
				fail: function () {
					that.inputPwd = false;
				}
			})
		}
	}
});