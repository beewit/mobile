var loadPage;new Vue({el:"#app",data:{nav:{lhref:null,title:"领取现金券"},id:null,List:{PageIndex:0,Data:{}},Count:0,receiveCouponIds:[]},mounted:function(){wechatSDK.initConfig(["hideAllNonBaseMenuItem"],function(){wx.hideAllNonBaseMenuItem()});var e=this;e.id=common.getQueryString("id"),e.nav.lhref="/red_packet/pages/receive/red_packet.html?id="+this.id;var a=Cookies.get("receiveCouponIds");a&&(e.receiveCouponIds=JSON.parse(a)),e.getRedPacket()},methods:{getRedPacket:function(){var e=this;common.ajax({url:config.redPacketUrl,data:{id:e.id},success:function(a){if(a.data.couponMaps){for(var o in a.data.couponMaps)if(e.data.receiveCouponIds.indexOf(a.data.couponMaps[o].id)>-1&&(a.data.couponMaps[o].receiveStatus="已领取"),a.data.couponMaps[o].money=a.data.couponMaps[o].money.replace(".00",""),a.data.couponMaps[o].expire_time){a.data.couponMaps[o].expire_time=a.data.couponMaps[o].expire_time.replace(" 00:00:00","");var t=new Date(a.data.couponMaps[o].expire_time.replace(/\-/g,"/")),i=new Date(util.formatDate(new Date,"yyyy-MM-dd").replace(/\-/g,"/"));i>t&&(a.data.couponMaps[o].expire=!0)}else a.data.couponMaps[o].expire_time="不限";e.List=a.data.couponMaps,e.Count=a.data.couponMaps.length}else e.Count=0}})},receive:function(e){var a=this;app.request({url:config.receiveCouponUrl,data:{id:e},success:function(){a.receiveCouponIds.push(e),Cookies.set("receiveCouponIds",a.receiveCouponIds),a.List[index].receiveStatus="已领取"},error:function(o){o.data&&o.data.msg.indexOf("已领取")>-1&&(a.receiveCouponIds.push(e),Cookies.set("receiveCouponIds",a.receiveCouponIds),a.data.List[index].receiveStatus="已领取")}})}}});