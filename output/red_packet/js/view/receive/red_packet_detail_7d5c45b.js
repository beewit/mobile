new Vue({el:"#app",data:{nav:{lhref:null,title:"工蜂引流 - 发红包啦！"},id:null,qrcode:null,redPacket:{send_photo:config.defaultPhoto,send_name:"工蜂引流",blessings:"祝大家新年快乐"},card:{name:"工蜂引流APP",contact:"自动抢占流量入口，1天可达10万人。",tel:null,address:"官网：www.9ee3.com"}},mounted:function(){this.id=common.getQueryString("id"),this.nav.lhref="/red_packet/pages/receive/red_packet.html?id="+this.id,this.getRedPacket(),this.receiveRedPacket()},methods:{getRedPacket:function(){var e=this.id,t=this;common.ajax({url:config.redPacketUrl,data:{id:e},success:function(e){200==e.ret&&("已支付"==e.data.pay_state?(e.data.send_photo=config.getFilePath(e.data.send_photo),t.redPacket=e.data,t.card=e.data.card,t.nav.title=e.data.send_name+" - 发红包啦！"):(util.toastError("无效红包"),setTimeout(function(){wx.switchTab({url:"/red_packet/pages/user/home/index"})},1e3)))}})},receiveRedPacket:function(){var e=this;common.ajax({succTip:!1,url:config.receiveRedPacketUrl,data:{id:e.id},success:function(t){e.qrcode=config.getFilePath(t.data.qrcode)}})}}});