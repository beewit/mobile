new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/card/index.html',
			title: '编辑广告模板'
		},
		isLoginAccount: false,
		model: {},
		expireComponyFunc: true,
	}, 
	mounted: function () {
		var that = this; 
		common.getToken(function (flog, userinfo) {
			if (!flog) {
				that.isLoginAccount = false;
			} else {
				that.isLoginAccount = true;
				common.getEffectiveFuncById(common.redPacketFuncId, function (res) {
					that.expireComponyFunc = common.getRedPacketFuncExpireTime() 
				})
			}
		})
	},
	methods: {
		submit: function(e) {
			var that = this;
            common.ajax({
				url: config.addRedPacketCardUrl,
				data: that.model,
				success: function(res) {
					location.href = '/red_packet/pages/user/card/index.html'
				}
			})
		}
	}
});