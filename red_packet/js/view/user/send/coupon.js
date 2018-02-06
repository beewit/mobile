var wecatInit = false;
window.onload = function () {
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
		'onSubmit': function () { /*确认时触发事件*/
			var theSelectData = calendar.value;
		},
		'onClose': function () { /*取消时触发事件*/ }
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
			name: null,
			photo: config.defaultPhoto,
		},
		photoImage: null,
		isLoginAccount: true,
		expireComponyFunc: true,
		Loading: false,
	},
	mounted: function () {
		var that = this;
		wechatSDK.initConfig(['chooseImage', 'uploadImage', 'previewImage'], function () {
			wecatInit = true;
		});
		common.getToken(function (flog) {
			if (!flog) {
				that.isLoginAccount = false;
			}
		})
	},
	methods: {
		chooseImage: function (event) {
			var that = this;
			if (wecatInit) {
				wechatSDK.chooseImage(1, function (res) {
					that.model.photo = res.data.path;
					that.photoImage = res.data.url;
				}, function (err) {
					layer.msg("上传失败", {
						icon: 0
					});
				});
				return;
			}
			layer.msg("刷新页面重试");
		},
		submit: function () {
			console.log(this.model);
			var that = this;
			common.ajax({
				url: config.addCouponUrl,
				data: that.model,
				success: function (res) {
					Cookies.set("sendCouponName", that.model.sendName, {
						expires: 30
					});
					Cookies.set("sendCouponPhoto", that.model.sendPhoto, {
						expires: 30
					});
					location.href = location.href;
				}
			})
		}
	}
});