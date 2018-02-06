new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/card/index.html',
			title: '编辑红包卡片'
		},
		isLoginAccount: false,
		model: {},
		expireComponyFunc: true,
	}, 
	methods: {
		submit: function(e) {
			var that = this;
			app.request({
				url: config.addRedPacketCardUrl,
				data: that.model,
				success: function(res) {
					location.href = '/red_packet/pages/user/card/index.html'
				}
			})
		}
	}
});