new Vue({
	el: '#app',
	data: {
		nav: {
			back: "false",
			title: "我的"
		},
		Account: {
			nickname:'工蜂引流[未登录]',
			photo:config.defaultPhoto
		}, 
		isLoginAccount: true,
		expireComponyFunc: true,
		Loading: false,
	},
	mounted: function () {
		var that = this;
		common.getToken(function (flog, userinfo) {
			if (!flog) {
				that.isLoginAccount = false;
			} else {
				that.Account = userinfo;
				that.isLoginAccount = true;
				common.getEffectiveFuncById(common.redPacketFuncId, function () {
					that.expireComponyFunc = common.getRedPacketFuncExpireTime()
				})
			}
		})
	},
	methods: {
		logOut: function () {
			common.delCookies();
			layer.msg("清除缓存成功", {
				icon: 1
			}, function () {
				location.href = location.href;
			});
		}
	}
})