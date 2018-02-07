var loadPage;
new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/home.html',
			title: '发出的现金券'
		},
		Where: "",
		SumNum: 0,
		UseNum: 0,
		List: {
			PageIndex: 0,
			Data: null
		}
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
		navChange: function (type) {
			this.Where = type;
			loadPage.unlock();
			this.getList(1, null);
		},
		tapOpenDesc: function (index) {
			Vue.set(this.List.Data[index], 'showDesc', !this.List.Data[index].showDesc)
		},
		useCouponNum: function () {
			var that = this;
			app.request({
				errTip: false,
				succTip: false,
				loadTip: false,
				url: config.useCouponNumUrl,
				success: function (res) {
					that.setData({
						UseNum: res.data
					})
				}
			});
		},
		deleteCoupon: function (id, index) {
			var that = this;
			layer.confirm('是否确定删除现金券？', {
				title: '温馨提示',
				icon: 0
			}, function () {
				common.ajax({
					url: config.deleteCouponUrl,
					data: {
						id: id
					},
					success: function (res) {
						that.List.Data[index].status = '已删除';
					}
				});
			})
		},
		getList: function (pageIndex, backFunc) {
			var that = this;
			common.ajax({
				url: config.getCouponListUrl,
				data: {
					pageIndex: pageIndex,
					t: that.Where
				},
				success: function (res) {
					for (var d in res.data.Data) {
						res.data.Data[d].money = res.data.Data[d].money.replace(".00", "")
						if (res.data.Data[d].expire_time) {
							res.data.Data[d].expire_time = res.data.Data[d].expire_time.replace(" 00:00:00", "")
						} else {
							res.data.couponMaps[d].expire_time = "不限"
						}
					}
					if (pageIndex == 1) {
						that.List = res.data;
					} else {
						that.List.Data.reverse();
						for (var d in that.List.Data) {
							res.data.Data.push(that.List.Data[d]);
						}
						res.data.Data.reverse();
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
			});
		}
	}
});