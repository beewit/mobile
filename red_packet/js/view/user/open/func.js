var wecatInit = false;
new Vue({
	el: '#app',
	data: {
		nav: {
			lhref: '/red_packet/pages/user/home.html',
			title: '开通企业版'
		},
		isLoginAccount: false,
		List: null,
		Func: null,
		Charge: null,
		SelectIndex: 0,
		SumPrice: 0.00,
		PayBtnDisabled: true,
		Loading: false,
		FuncId: 10,
		ExpireTime: null,
		GetFuncFlog: true,
		Expire: null
	},
	mounted: function () {
		var that = this;
		wechatSDK.initConfig(['chooseWXPay'], function () {
			wecatInit = true;
		});
		this.getFuncType();
		common.getToken(function (flog, userinfo) {
			if (!flog) {
				that.isLoginAccount = false;
			} else {
				that.isLoginAccount = true;				
				that.getEffectiveFuncById();
			}
		})
	},
	methods: {
		getFuncType: function () {
			var that = this;
			common.ajax({
				url: config.getFuncTypeUrl,
				data: {
					fid: that.FuncId,
					type: 1
				},
				success: function (res) {
					var list = [];
					var charge = res.data.funcCharge;
					var sumPrice = 0.00;
					if (charge) {
						for (var index in charge) {
							charge[index].sumPrice = parseFloat(res.data.func[0].price) * charge[index].days;
							list.push(charge[index]);
							if (charge[index].default == '是') {
								sumPrice = charge[index].sumPrice;
								if (charge[index].discount > 0) {
									sumPrice = sumPrice * charge[index].discount;
									charge[index].discountTip = "限时" + parseInt(charge[index].discount * 10) + "折"
								}
							}
						}

						that.Charge = charge;
						that.List = list;
						that.Func = res.data.func;
						that.SumPrice = sumPrice;
						that.PayBtnDisabled = false;
					}
				}
			})
		},
		selectFuncChargeTap: function (index, sumPrice) {
			if (this.Charge[index].discount > 0) {
				sumPrice = sumPrice * this.Charge[index].discount;
			}
			this.SelectIndex = index;
			this.SumPrice = sumPrice;
		},
		paymentFuncTap: function (e) {
			var that = this;
			wechatSDK.paymentFunc(that.FuncId, that.List[that.SelectIndex].id,
				function (status) {
					if (status) {
						that.getEffectiveFuncById();
					}
				})
		},
		getEffectiveFuncById: function () {
			var that = this;
			common.getEffectiveFuncById(common.redPacketFuncId, function (res) {
				that.Expire = common.getRedPacketFuncExpireTime()
				if (!that.Expire) {
					that.ExpireTime = common.formatDate(new Date(res.data.expiration_time.replace(/\-/g, "\/")), "yyyy-MM-dd");
				}
			})
		}
	}
})