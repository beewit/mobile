var wecatInit=!1;new Vue({el:"#app",data:{nav:{lhref:"/red_packet/pages/user/home.html",title:"开通企业版"},isLoginAccount:!1,List:null,Func:null,Charge:null,SelectIndex:0,SumPrice:0,PayBtnDisabled:!0,Loading:!1,FuncId:10,ExpireTime:null,GetFuncFlog:!0,Expire:null},mounted:function(){var e=this;wechatSDK.initConfig(["chooseWXPay"],function(){wecatInit=!0}),this.getFuncType(),common.getToken(function(n){n?(e.isLoginAccount=!0,e.getEffectiveFuncById()):e.isLoginAccount=!1})},methods:{getFuncType:function(){var e=this;common.ajax({url:config.getFuncTypeUrl,data:{fid:e.FuncId,type:1},success:function(n){var t=[],c=n.data.funcCharge,i=0;if(c){for(var a in c)c[a].sumPrice=parseFloat(n.data.func[0].price)*c[a].days,t.push(c[a]),"是"==c[a].default&&(i=c[a].sumPrice,c[a].discount>0&&(i*=c[a].discount,c[a].discountTip="限时"+parseInt(10*c[a].discount)+"折"));e.Charge=c,e.List=t,e.Func=n.data.func,e.SumPrice=i,e.PayBtnDisabled=!1}}})},selectFuncChargeTap:function(e,n){this.Charge[e].discount>0&&(n*=this.Charge[e].discount),this.SelectIndex=e,this.SumPrice=n},paymentFuncTap:function(){var e=this;wechatSDK.paymentFunc(e.FuncId,e.List[e.SelectIndex].id,function(n){n&&e.getEffectiveFuncById()})},getEffectiveFuncById:function(){var e=this;common.getEffectiveFuncById(common.redPacketFuncId,function(n){e.Expire=common.getRedPacketFuncExpireTime(),e.Expire||(e.ExpireTime=common.formatDate(new Date(n.data.expiration_time.replace(/\-/g,"/")),"yyyy-MM-dd"))})}}});