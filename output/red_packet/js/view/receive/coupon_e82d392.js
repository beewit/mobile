var loadPage;new Vue({el:"#app",data:{nav:{lhref:null,title:"领取现金券"},id:null,List:{PageIndex:0,Data:{}},receiveCouponIds:[]},mounted:function(){$(document).bind("contextmenu",function(){return!1}),$(document).bind("selectstart",function(){return!1}),$("body").attr("oncontextmenu","return false").attr("onselectstart","return false");var e=this;e.id=common.getQueryString("id"),e.nav.lhref="/red_packet/pages/receive/red_packet.html?id="+this.id;var a=Cookies.get("receiveCouponIds");a&&(e.receiveCouponIds=JSON.parse(a)),e.getRedPacket()},methods:{getRedPacket:function(){var e=this;common.ajax({url:config.redPacketUrl,data:{id:e.id},success:function(a){for(var t in a.data.couponMaps)if(e.data.receiveCouponIds.indexOf(a.data.couponMaps[t].id)>-1&&(a.data.couponMaps[t].receiveStatus="已领取"),a.data.couponMaps[t].money=a.data.couponMaps[t].money.replace(".00",""),a.data.couponMaps[t].expire_time){a.data.couponMaps[t].expire_time=a.data.couponMaps[t].expire_time.replace(" 00:00:00","");var o=new Date(a.data.couponMaps[t].expire_time.replace(/\-/g,"/")),n=new Date(util.formatDate(new Date,"yyyy-MM-dd").replace(/\-/g,"/"));n>o&&(a.data.couponMaps[t].expire=!0)}else a.data.couponMaps[t].expire_time="不限";e.List=a.data.couponMaps}})},receive:function(e){var a=this;app.request({url:config.receiveCouponUrl,data:{id:e},success:function(){a.receiveCouponIds.push(e),Cookies.set("receiveCouponIds",a.receiveCouponIds),a.List[index].receiveStatus="已领取"},error:function(t){t.data&&t.data.msg.indexOf("已领取")>-1&&(a.receiveCouponIds.push(e),Cookies.set("receiveCouponIds",a.receiveCouponIds),a.data.List[index].receiveStatus="已领取")}})}}});