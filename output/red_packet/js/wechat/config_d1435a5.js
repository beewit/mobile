var wechatSDK={init:!1,initConfig:function(n,e,o){this.setConfig(n,e,o)},setConfig:function(n,e,o){common.ajax({succTip:!1,url:config.wechatJsSDKConfigUrl,data:{url:location.href},success:function(c){wx.config({debug:!1,appId:c.data.appId,timestamp:c.data.timestamp,nonceStr:c.data.noncestr,signature:c.data.signature,jsApiList:n}),wx.ready(function(){console.log("ready ok "),e&&e()}),wx.error(function(n){console.log("error: "+n),o&&o(n)})}})},chooseImage:function(n,e,o){var c=this;wx.chooseImage({count:n?n:1,sizeType:["compressed"],sourceType:["album","camera"],success:function(n){var t=n.localIds;console.log(n);for(var a=0;a<t.length;a++)c.wxuploadImage(t[a],e,o)},fail:function(n){console.log(n),o&&o("chooseImage error："+n)}})},wxuploadImage:function(n,e,o){var c=this;wx.uploadImage({localId:n,isShowProgressTips:1,success:function(n){var t=n.serverId;c.downloadMedia(t,e,o)},fail:function(n){console.log(n),o&&o("wxuploadImage error："+n)}})},downloadMedia:function(n,e,o){common.ajax({succTip:!1,url:config.wechatMediaDownloadUrl,data:{mediaId:n,dir:"red_packet/wechat"},success:function(n){console.log(n),e&&e(n)},fail:function(n){console.log(n),o&&o("downloadMedia error："+n)}})},paymentRedPacket:function(n,e){var o=this;common.ajax({url:config.payUrl,data:{id:n,type:"微信H5"},success:function(n){o.requestPayment(n,null,e)},error:function(){layer.msg("支付失败",{icon:0})}})},paymentFunc:function(n,e,o){var c=this;common.ajax({url:config.payFuncCreateOrderUrl,data:{body:"开通红包裂变企业版",subject:"开通红包裂变企业版",fcId:e,funcId:n,pt:"微信H5"},success:function(n){c.requestPayment(n,"/red_packet/pages/user/open/func.html",o)},error:function(){layer.msg("支付失败",{icon:0}),"function"==typeof o&&o(!1)}})},paymentOrder:function(n,e){var o=this;common.ajax({url:config.payFuncOrderUrl,data:{body:"开通红包裂变企业版",subject:"开通红包裂变企业版",orderId:n},success:function(n){o.requestPayment(n,"/red_packet/pages/user/open/func.html",e)},error:function(){layer.msg("支付失败",{icon:0}),"function"==typeof e&&e(!1)}})},requestPayment:function(n,e,o){var c=this;wx.chooseWXPay({timestamp:n.data.timeStamp,nonceStr:n.data.noncestr,"package":n.data.package,signType:"MD5",paySign:n.data.sign,success:function(t){console.log("chooseWXPay success："+t),layer.msg("正在检查支付..",{icon:6,time:-1}),c.checkPayment(n.data.tradeNo,e,o)},fail:function(n){alert(JSON.stringify(n)),console.log("chooseWXPay error："+n),layer.msg("支付失败",{icon:0}),"function"==typeof o&&o(!1)}})},checkPayment:function(n,e,o){try{var c=this;common.ajax({loadTip:!1,errTip:!1,url:config.payCheckUrl,data:{tradeNo:n},success:function(t){try{200==t.ret?(layer.closeAll(),"function"==typeof o&&o(!0),e&&(location.href=e)):setTimeout(function(){c.checkPayment(n,e)},1e3)}catch(a){alert(JSON.stringify(a))}},error:function(o){alert(JSON.stringify(o));try{setTimeout(function(){c.checkPayment(n,e)},1e3)}catch(t){alert(JSON.stringify(t))}}})}catch(t){alert(JSON.stringify(t))}},previewImage:function(n,e){wx.previewImage({current:n,urls:e})},scanQRCode:function(n){wx.scanQRCode({needResult:0,scanType:["qrCode","barCode"],success:function(e){console.log(e);e.resultStr;n(e.resultStr)},fail:function(){layer.msg("扫码失败",{icon:0})}})},initShare:function(n,e,o,c,t,a,i){wx.onMenuShareTimeline({title:n,link:e,imgUrl:o,desc:c,success:function(n){t&&t(n)},cancel:function(n){a&&a(n)},fail:function(n){i&&i(n)}}),wx.onMenuShareAppMessage({title:n,link:e,imgUrl:o,desc:c,success:function(n){t&&t(n)},cancel:function(n){a&&a(n)},fail:function(n){i&&i(n)}}),wx.onMenuShareQQ({title:n,link:e,imgUrl:o,desc:c,success:function(n){t&&t(n)},cancel:function(n){a&&a(n)},fail:function(n){i&&i(n)}}),wx.onMenuShareQZone({title:n,link:e,imgUrl:o,desc:c,success:function(n){t&&t(n)},cancel:function(n){a&&a(n)},fail:function(n){i&&i(n)}})}};