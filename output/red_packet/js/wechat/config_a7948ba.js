var wechatSDK={init:!1,initConfig:function(e,o,n){this.setConfig(e,o,n)},setConfig:function(e,o,n){common.ajax({succTip:!1,url:config.wechatJsSDKConfigUrl,data:{url:location.href},success:function(a){wx.config({debug:!1,appId:a.data.appId,timestamp:a.data.timestamp,nonceStr:a.data.noncestr,signature:a.data.signature,jsApiList:e}),wx.ready(function(){console.log("ready ok "),o&&o()}),wx.error(function(e){console.log("error: "+e),n&&n(e)})}})},chooseImage:function(e,o,n){var a=this;wx.chooseImage({count:e?e:1,sizeType:["compressed"],sourceType:["album","camera"],success:function(e){var c=e.localIds;console.log(e);for(var t=0;t<c.length;t++)a.wxuploadImage(c[t],o,n)},fail:function(e){console.log(e),n&&n("chooseImage error："+e)}})},wxuploadImage:function(e,o,n){var a=this;wx.uploadImage({localId:e,isShowProgressTips:1,success:function(e){var c=e.serverId;a.downloadMedia(c,o,n)},fail:function(e){console.log(e),n&&n("wxuploadImage error："+e)}})},downloadMedia:function(e,o,n){common.ajax({succTip:!1,url:config.wechatMediaDownloadUrl,data:{mediaId:e,dir:"red_packet/wechat"},success:function(e){console.log(e),o&&o(e)},fail:function(e){console.log(e),n&&n("downloadMedia error："+e)}})},paymentRedPacket:function(e,o){var n=this;common.ajax({url:config.payUrl,data:{id:e,type:"微信H5"},success:function(e){n.requestPayment(e,null,o)},error:function(){layer.msg("支付失败",{icon:0})}})},paymentFunc:function(e,o,n){var a=this;common.ajax({url:config.payFuncCreateOrderUrl,data:{body:"开通红包裂变企业版",subject:"开通红包裂变企业版",fcId:o,funcId:e,pt:"微信H5"},success:function(e){a.requestPayment(e,"/red_packet/pages/user/open/func.html",n)},error:function(){layer.msg("支付失败",{icon:0}),"function"==typeof n&&n(!1)}})},paymentOrder:function(e,o){var n=this;common.ajax({url:config.payFuncOrderUrl,data:{body:"开通红包裂变企业版",subject:"开通红包裂变企业版",orderId:e},success:function(e){n.requestPayment(e,"/red_packet/pages/user/open/func.html",o)},error:function(){layer.msg("支付失败",{icon:0}),"function"==typeof o&&o(!1)}})},requestPayment:function(e,o,n){var a=this;wx.chooseWXPay({timestamp:e.data.timeStamp,nonceStr:e.data.noncestr,"package":e.data.package,signType:"MD5",paySign:e.data.sign,success:function(c){console.log("chooseWXPay success："+c),layer.msg("正在检查支付..",{icon:6,time:-1}),a.checkPayment(e.data.tradeNo,o,n)},fail:function(e){alert(JSON.stringify(e)),console.log("chooseWXPay error："+e),layer.msg("支付失败",{icon:0}),"function"==typeof n&&n(!1)}})},checkPayment:function(e,o,n){try{var a=this;common.ajax({loadTip:!1,errTip:!1,url:config.payCheckUrl,data:{tradeNo:e},success:function(c){try{200==c.ret?(layer.closeAll(),"function"==typeof n&&n(!0),o&&(location.href=o)):setTimeout(function(){a.checkPayment(e,o)},1e3)}catch(t){alert(JSON.stringify(t))}},error:function(n){alert(JSON.stringify(n));try{setTimeout(function(){a.checkPayment(e,o)},1e3)}catch(c){alert(JSON.stringify(c))}}})}catch(c){alert(JSON.stringify(c))}}};