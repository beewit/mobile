//分页下拉上拉对象
var loadPage;
new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/home.html',
			title: '广告模板'
		},
		isLoginAccount: false,
		List: {
			PageIndex: 0,
			Data: null
		},
		parType: null,
		expireComponyFunc: true,
	},
	mounted: function () {
		var that = this;
		common.getToken(function (flog, userinfo) {
			if (!flog) {
				that.isLoginAccount = false;
			} else {
				that.isLoginAccount = true;
				that.List.PageIndex = 0;
				common.scroll("#content", function (load, reset) {
					loadPage = load;
					that.getList(1, reset);
				}, function (load, reset) {
					loadPage = load;
					that.getList(that.List.PageIndex + 1, reset);
				});
			}
		})
	},
	methods: {
		getList: function (pageIndex, backFunc) {
			var that = this;
			common.ajax({
				url: config.getRedPacketCardListUrl,
				data: {
					pageIndex: pageIndex
				},
				success: function (res) {
					if (pageIndex == 1) {
						that.List = res.data;
					} else {
						that.List.Data.reverse()
						for (var d in that.List.Data) {
							res.data.Data.push(that.List.Data[d])
						}
						res.data.Data.reverse()

						that.List = res.data;
					}
					setTimeout(function () {
						typeof backFunc == "function" && backFunc(res);
					}, 500);
				},
				error: function () {
					setTimeout(function () {
						typeof backFunc == "function" && backFunc(null);
					}, 500);
				}
			})
		}
	}
});