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
		expireComponyFunc: true,
		statusCls: null
	},
	methods: { 
		submit: function() {
			console.log(this.model);
			var that = this;
			common.ajax({
				url: config.submitAccountCompanyAuthUrl,
				data: that.model,
				success: function(res) { 
				} 
			})
		}
	}
});