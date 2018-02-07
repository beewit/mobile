var loadPage;
new Vue({
    el: '#app',
    data: {
        nav: {
            lhref: null,
            title: '领取现金券'
        },
        id: null,
        List: {
            PageIndex: 0,
            Data: {}
        },
        Count: 0,
        receiveCouponIds: []
    },
    mounted: function () {
        wechatSDK.initConfig(['hideAllNonBaseMenuItem'], function () {
            wx.hideAllNonBaseMenuItem();
        });
        var that = this;
        that.id = common.getQueryString("id");
        that.nav.lhref = '/red_packet/pages/receive/red_packet.html?id=' + this.id;
        var rcIds = Cookies.get('receiveCouponIds');
        if (rcIds) {
            that.receiveCouponIds = JSON.parse(rcIds);
        }
        that.getRedPacket();
    },
    methods: {
        getRedPacket: function () {
            var that = this;
            common.ajax({
                url: config.redPacketUrl,
                data: {
                    id: that.id
                },
                success: function (res) {
                    if (res.data.couponMaps) {
                        for (var d in res.data.couponMaps) {
                            if (that.data.receiveCouponIds.indexOf(res.data.couponMaps[d].id) > -1) {
                                res.data.couponMaps[d].receiveStatus = "已领取";
                            }
                            res.data.couponMaps[d].money = res.data.couponMaps[d].money.replace(".00", "")
                            if (res.data.couponMaps[d].expire_time) {
                                res.data.couponMaps[d].expire_time = res.data.couponMaps[d].expire_time.replace(" 00:00:00", "")
                                //判断是否到期
                                var expireTime = new Date(res.data.couponMaps[d].expire_time.replace(/\-/g, "\/"));
                                var now = new Date(util.formatDate(new Date(), "yyyy-MM-dd").replace(/\-/g, "\/"));
                                if (now > expireTime) {
                                    res.data.couponMaps[d].expire = true;
                                }
                            } else {
                                res.data.couponMaps[d].expire_time = "不限"
                            }
                        }
                        that.List = res.data.couponMaps;
                        that.Count = res.data.couponMaps.length;
                    } else {
                        that.Count = 0;
                    }
                }
            })
        },
        receive: function (id) {
            var that = this;
            app.request({
                url: config.receiveCouponUrl,
                data: {
                    id: id
                },
                success: function () {
                    that.receiveCouponIds.push(id)
                    Cookies.set('receiveCouponIds', that.receiveCouponIds);
                    that.List[index].receiveStatus = "已领取";
                },
                error: function (res) {
                    if (res.data && res.data.msg.indexOf('已领取') > -1) {
                        that.receiveCouponIds.push(id);
                        Cookies.set('receiveCouponIds', that.receiveCouponIds);
                        that.data.List[index].receiveStatus = "已领取";
                    }
                }
            });
        }
    }
});