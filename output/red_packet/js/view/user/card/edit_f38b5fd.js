new Vue({el:"#app",data:{nav:{lhref:"/red_packet/pages/user/card/index.html",title:"编辑广告模板"},isLoginAccount:!1,model:{},expireComponyFunc:!0},methods:{submit:function(){var e=this;app.request({url:config.addRedPacketCardUrl,data:e.model,success:function(){location.href="/red_packet/pages/user/card/index.html"}})}}});