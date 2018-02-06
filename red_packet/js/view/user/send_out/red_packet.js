var loadPage;
new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/home.html',
			title: '发出的红包'
		},
		SumPrice: 0,
		SendCount: 0,
		fileHost: null,
		InfluenceNum: 0,
		Where: "",
		SumNum: 0,
		UseNum: 0,
		List: {}
	},
	mounted: function() {
		var that = this;
		//that.getList(1, null);
		that.List.PageIndex = 0;
		common.scroll("#content", function(load, reset) {
			loadPage = load;
			that.getList(1, reset);
		}, function(load, reset) {
			loadPage = load;
			that.getList(that.List.PageIndex + 1, reset);
		});
		that.getRedPacketAccessLogNum();
		that.sendRedPacketSumPrice();
	},
	methods: {
		navChange: function(type) {
			this.Where = type;
			loadPage.unlock();
			this.getList(1, null);
		},
		getRedPacketAccessLogNum: function() {
			var that = this;
			common.ajax({
				errTip: false,
				succTip: false,
				loadTip: false,
				url: config.getRedPacketAccessLogNumUrl,
				success: function(res) {
					var influenceNum = "0";
					if(res.data >= 10000) {
						influenceNum = (res.data / 10000) + "万";
					} else {
						influenceNum = res.data;
					}
					that.InfluenceNum = influenceNum;
				}
			});
		},
		sendRedPacketSumPrice: function() {
			var that = this;
			common.ajax({
				errTip: false,
				succTip: false,
				loadTip: false,
				url: config.sendRedPacketSumPriceUrl,
				success: function(res) {
					that.SumPrice = res.data;
				}
			});
		},
		getList: function(pageIndex, backFunc) {
			var that = this;
			common.ajax({
				url: config.getSendRedPacketListUrl,
				data: {
					pageIndex: pageIndex,
					t: that.Where
				},
				success: function(res) {
					if(that.Where == "") {
						that.SendCount = res.data.Count
					}

					for(var d in res.data.Data) {
						res.data.Data[d].money = res.data.Data[d].money.replace(".00", "")
					}
					if(pageIndex == 1) {
						that.List = res.data;
					} else {
						that.List.Data.reverse();
						for(var d in that.List.Data) {
							res.data.Data.push(that.List.Data[d]);
						}
						res.data.Data.reverse();
						that.List = res.data;
					}
					setTimeout(function() {
						typeof backFunc == "function" && backFunc(res);
					}, 500);
				},
				error: function() {
					setTimeout(function() {
						typeof backFunc == "function" && backFunc(null);
					}, 500);
				}
			});
		}
	}
});