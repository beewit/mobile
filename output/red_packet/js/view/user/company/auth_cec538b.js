var wecatInit=!1;new Vue({el:"#app",data:{nav:{lhref:"/red_packet/pages/user/home.html",title:"企业认证"},isLoginAccount:!1,pageLoadFlog:!1,Data:{id_card_just:"1",id_card_back:"1",business_licence:"1"},businessLicenceImage:null,idCardJustImage:null,idCardBackImage:null,btnText:"提交企业认证",expireComponyFunc:!0},mounted:function(){var a=this;wechatSDK.initConfig(["chooseImage","uploadImage","previewImage","chooseWXPay"],function(){wecatInit=!0}),common.getToken(function(t){t?(a.isLoginAccount=!0,a.getAuth()):a.isLoginAccount=!1})},methods:{submit:function(){var a=this;common.ajax({url:config.submitAccountCompanyAuthUrl,data:a.Data,success:function(){location.href=location.href}})},chooseImage:function(a){var t=this;return wecatInit?void wechatSDK.chooseImage(1,function(e){switch(a){case"businessLicence":t.Data.business_licence=e.data.path,t.businessLicenceImage=e.data.url;break;case"idCardJust":t.Data.id_card_just=e.data.path,t.idCardJustImage=e.data.url;break;case"idCardBack":t.Data.id_card_back=e.data.path,t.idCardBackImage=e.data.url}},function(){layer.msg("上传失败",{icon:0})}):void layer.msg("刷新页面重试")},getAuth:function(){var a=this;common.ajax({url:config.getAccountCompanyAuthUrl,success:function(t){t.data&&(a.Data=t.data,a.btnText="审核未通过"==t.data.status?"重新提交企业认证":t.data.status,a.businessLicenceImage=config.getFilePath(t.data.business_licence),a.idCardJustImage=config.getFilePath(t.data.id_card_just),a.idCardBackImage=config.getFilePath(t.data.id_card_back))}})}}});