new Vue({el:"#app",data:{nav:{lhref:"/red_packet/pages/user/home.html",title:"工蜂引流 - 领取现金红包"},id:null,shareNum:0,fileHost:config.fileHost,recredPacketNum:0,recredCouponNum:0,couponList:[],redPacketList:[],redPacket:{send_photo:config.defaultPhoto,send_name:"工蜂引流",blessings:"祝大家新年快乐"},sendPhotoImg:null,loadEnd:!1,openShareTip:!1},mounted:function(){var e=this;this.id=common.getQueryString("id"),this.getRedPacket(),wechatSDK.initConfig(["chooseImage","onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareWeibo"],function(){e.initShare()})},methods:{initShare:function(){var e=this;e.loadEnd||setTimeout(function(){e.initShare()},100),wechatSDK.initShare(e.redPacket.send_name+"，发现金红包啦！",location.href,fileDoMain+e.sendPhotoImg,e.redPacket.blessings,function(){e.addShare()},function(){},function(e){alert(JSON.stringify(e))})},receiveCoupon:function(){var e=this;if(e.redPacket)return"审核通过"!=e.redPacket.review_status?void layer.alert("红包未通过审核无法领取",{icon:0,title:"温馨提示"}):e.shareNum<=0?(e.openShareTip=!0,void layer.alert("你还没有分享红包哦，点击下面的去分享！",{icon:0,title:"温馨提示"})):void(location.href="/red_packet/pages/receive/coupon.html?id="+e.redPacket.id)},receiveRedPacketTap:function(){var e=this;if(e.redPacket)return"审核通过"!=e.redPacket.review_status?void layer.alert("红包未通过审核无法领取",{icon:0,title:"温馨提示"}):e.shareNum<=0?(e.openShareTip=!0,void layer.alert("你还没有分享红包哦，点击下面的去分享！",{icon:0,title:"温馨提示"})):void e.receiveRedPacket()},receiveRedPacket:function(){var e=this;common.ajax({succTip:!1,url:config.receiveRedPacketUrl,data:{id:e.id},success:function(){location.href="/red_packet/pages/receive/red_packet_detail.html?id="+e.redPacket.id}})},getRedPacket:function(){var e=this;common.ajax({url:config.redPacketReceiveRecordUrl,data:{id:e.id},success:function(t){200==t.ret&&("已支付"==t.data.redPacket.pay_state?(e.loadEnd=!0,e.sendPhotoImg=t.data.redPacket.send_photo,t.data.redPacket.send_photo=config.getFilePath(t.data.redPacket.send_photo),e.recredCouponNum=t.data.couponList.length,e.recredPacketNum=t.data.redPacketList.length,e.couponList=t.data.couponList,e.redPacketList=t.data.redPacketList,e.redPacket=t.data.redPacket,e.getShareNum(),e.addRedPacketAccessLog()):location.href="/red_packet/pages/user/home.html")}})},addShare:function(){var e=this;return e.redPacket?void common.ajax({url:config.shareRedPacketUrl,data:{id:e.redPacket.id},success:function(){e.shareNum=1}}):void layer.alert("未获取到红包信息",{icon:0,title:"温馨提示"})},getShareNum:function(){var e=this;if(e.redPacket){var e=this;common.ajax({url:config.shareRedPacketNumUrl,data:{id:e.redPacket.id},success:function(t){e.shareNum=t.data}})}},addRedPacketAccessLog:function(){var e=this;if(e.redPacket){var e=this;common.ajax({errTip:!1,succTip:!1,loadTip:!1,url:config.addRedPacketAccessLogUrl,data:{id:e.redPacket.id},success:function(){}})}}}});