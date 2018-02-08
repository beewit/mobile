var wecatInit = false;
new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/home.html',
			title: '企业认证'
		},
		isLoginAccount: false,
		pageLoadFlog: false,
		Data: {},
		businessLicenceImage: null,
		idCardJustImage: null,
		idCardBackImage: null,
		btnText: "提交企业认证",
		expireComponyFunc: true
	},
	mounted: function () {
		var that = this;
		wechatSDK.initConfig(['chooseImage', 'uploadImage', 'previewImage', 'chooseWXPay'], function () {
			wecatInit = true;
		});
		common.getToken(function (flog, userinfo) {
			if (!flog) {
				that.isLoginAccount = false;
			} else {
				that.isLoginAccount = true;
				common.getEffectiveFuncById(common.redPacketFuncId, function (res) {
					that.expireComponyFunc = common.getRedPacketFuncExpireTime()
				})
				that.getAuth();
			}
		})
	},
	methods: {
		submit: function () {
			var that = this;
			common.ajax({
				url: config.submitAccountCompanyAuthUrl,
				data: that.Data,
				success: function (res) {
					location.href = location.href;
				}
			})
		},
		chooseImage: function (t) {
			var that = this;
			if (wecatInit) {
				wechatSDK.chooseImage(1, function (res) {
					switch (t) {
						case "businessLicence":
							that.Data.business_licence = res.data.path;
							that.businessLicenceImage = res.data.url;
							break
						case "idCardJust":
							that.Data.id_card_just = res.data.path;
							that.idCardJustImage = res.data.url;
							break
						case "idCardBack":
							that.Data.id_card_back = res.data.path;
							that.idCardBackImage = res.data.url;
							break
					}
				}, function (err) {
					layer.msg("上传失败", {
						icon: 0
					});
				});
				return;
			}
			layer.msg("刷新页面重试");
		},
		getAuth: function () {
			var that = this;
			common.ajax({
				url: config.getAccountCompanyAuthUrl,
				success: function (res) {
					if (res.data) {
						that.Data = res.data;
						that.btnText = res.data.status == "审核未通过" ? "重新提交企业认证" : res.data.status;
						that.businessLicenceImage = config.getFilePath(res.data.business_licence);
						that.idCardJustImage = config.getFilePath(res.data.id_card_just);
						that.idCardBackImage = config.getFilePath(res.data.id_card_back);
					}
				}
			})
		}
	}
});