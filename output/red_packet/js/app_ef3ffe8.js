// 注册顶部
/** data:{
 * 	nav: {
 *			back: "false",
 *			title: "发红包",
 *			rtext: ""
 *		}
 * }
 * <vheader v-bind:nav='nav' v-on:click='backClick' v-on:rclick='rightClick'></vheader>
 */
Vue.component('vheader', {
	props: ['nav', 'lclick', 'rclick'],
	template: '<div class="header"><a v-bind:href="nav.lhref" v-if="nav.back!=\'false\'" v-on:click="backClick" class="icon iconfont icon-zuojiantou-01 back"></a>' +
		'<h1 class="nav-title">{{ nav.title }}</h1><a v-bind:href="nav.rhref" v-if="nav.rhref!=null || nav.ricon!=null ||  nav.rtext!=null" class="icon iconfont right" ' +
		' :class="nav.ricon" v-on:click="rightClick"><span>{{nav.rtext}}</span></a></div>',
	methods: {
		backClick: function () {
			this.$emit('lclick')
		},
		rightClick: function () {
			this.$emit('rclick')
		}
	}
});
// 注册底部导航
Vue.component('vnav', {
	template: '<div class="nav">' +
		'<a href="/red_packet/pages/user/send/red_packet.html" v-bind:class="{active:location.pathname.toLowerCase()==\'/red_packet/pages/user/send/red_packet.html\'}"><i class="icon iconfont icon-hongbao"></i><span>发红包</span></a>' +
		'<a href="/red_packet/pages/user/send/coupon.html" v-bind:class="{active:location.pathname.toLowerCase()==\'/red_packet/pages/user/send/coupon.html\'}"><i class="icon iconfont icon-31hongbao"></i><span>发现金券</span></a>' +
		'<a  href="/red_packet/pages/user/home.html" v-bind:class="{active:location.pathname.toLowerCase()==\'/red_packet/pages/user/home.html\'}"><i class="icon iconfont icon-wode-copy"></i><span>我的</span></a></div>'
});
// 注册底部标语
Vue.component('vfooter', {
	template: '<div class="footer">工蜂智能实验室（9EE3.COM）提供技术支持</div>'
});
// 分页标记
Vue.component('vpage', {
	props: ['data'],
	template: '<div>' +
		'<div class="loading2" v-if="data.PageIndex < data.PageNumber">' +
		'  <img src="/red_packet/img/icon/loading.gif"></img> 正在载入更多...' +
		'</div>' +
		'<div class="loading2 complete" v-if="data.PageIndex>=data.PageNumber && data.Data.length>0">已加载全部</div>' +
		'<div class="loading2 complete" v-if="data.Count==0">暂无数据</div>' +
		'</div>'
});
var fileDoMain = "https://file.9ee3.com/";
var ssoHost = "/sso"; //"https://sso.9ee3.com";
var hiveHost = "/hive"; //"https://hive.9ee3.com";
var fileHost = "/file/"; //"https://file.9ee3.com/";
var payHost = "/pay"; //"https://pay.9ee3.com";

var config = {
	defaultPhoto: "/red_packet/img/icon/spread.png",
	// 下面的地址配合云端 Server 工作
	ssoHost,
	fileHost,
	//[sso] 用code换取openId
	loginAccountUrl: `${ssoHost}/union/mp/app/login`,
	checkTokenUrl: `${ssoHost}/pass/checkToken`,
	checkSessionUrl: `${ssoHost}/union/mp/app/check/session`,
	saveUserInfoUrl: `${ssoHost}/union/mp/app/userinfo/save`,
	imgCodeUrl: `${ssoHost}/img/code`,
	sendSmsCodeUrl: `${ssoHost}/pass/regSendSms`,
	bindAccountUrl: `${ssoHost}/union/mp/app/bind`,
	CheckRegMobileUrl: `${ssoHost}/pass/checkRegMobile`,
	logOutUrl: `${ssoHost}/pass/deleteToken`,
	// 发送红包
	sendRedPacketUrl: `${hiveHost}/account/send/redpacket`,
	redPacketUrl: `${hiveHost}/account/redpacket`,
	getSendRedPacketListUrl: `${hiveHost}/account/send/redpacket/list`,
	redPacketReceiveRecordUrl: `${hiveHost}/account/redpacket/receive/coupon/record`,
	addRedPacketAccessLogUrl: `${hiveHost}/account/redpacket/access/log/add`,
	getRedPacketAccessLogNumUrl: `${hiveHost}/account/redpacket/access/log/num`,
	//领取红包记录
	receiveRedPacketUrl: `${hiveHost}/account/redpacket/receive`,
	// 分享红包
	shareRedPacketUrl: `${hiveHost}/account/share/redpacket`,
	shareRedPacketNumUrl: `${hiveHost}/account/share/redpacket/num`,
	//优惠券
	getCouponListUrl: `${hiveHost}/account/coupon/list`,
	//优惠券详情
	getCouponUrl: `${hiveHost}/account/coupon/get`,
	//添加优惠券
	addCouponUrl: `${hiveHost}/account/coupon/add`,
	//领取优惠券
	receiveCouponUrl: `${hiveHost}/account/receive/coupon`,
	//领取优惠券列表
	getReceiveCouponListUrl: `${hiveHost}/account/receive/coupon/list`,
	//使用的优惠券
	useCouponUrl: `${hiveHost}/account/coupon/use`,
	//优惠券二维码
	couponQrCodeUrl: `${hiveHost}/account/receive/coupon/qrcode`,
	//使用优惠券二维码
	useCouponQrCodeUrl: `${hiveHost}/account/coupon/use`,
	//优惠券使用次数
	useCouponNumUrl: `${hiveHost}/account/coupon/use/num`,
	//删除优惠券
	deleteCouponUrl: `${hiveHost}/account/coupon/delete`,
	//发送红包总金额
	sendRedPacketSumPriceUrl: `${hiveHost}/account/send/redpacket/sumprice`,
	//开通功能信息
	getEffectiveFuncByIdUrl: `${hiveHost}/func/account/funcId`,
	//提交企业认证
	submitAccountCompanyAuthUrl: `${hiveHost}/account/commpany/auth/submit`,
	//获取企业认证
	getAccountCompanyAuthUrl: `${hiveHost}/account/commpany/auth/get`,

	//添加红包卡片
	addRedPacketCardUrl: `${hiveHost}/account/redpacket/card/add`,
	//删除红包卡片
	deleteRedPacketCardUrl: `${hiveHost}/account/redpacket/card/del`,
	//获取红包卡片信息
	getRedPacketCardByIDUrl: `${hiveHost}/account/redpacket/card/get`,
	//获取红包卡片列表
	getRedPacketCardListUrl: `${hiveHost}/account/redpacket/card/list`,
	getRedPacketCardDefUrl: `${hiveHost}/account/redpacket/card/def`,
	// 上传文件接口
	uploadFileUrl: `${fileHost}upload`,
	//支付接口
	payUrl: `${payHost}/order/mini/app/redpacket/pay`,
	payCheckUrl: `${payHost}/order/query`,
	getFuncTypeUrl: `${payHost}/type`,
	payFuncOrderUrl: `${payHost}/order/app/order/pay`,
	payFuncCreateOrderUrl: `${payHost}/order/app/create`,
	wechatJsSDKConfigUrl: `/wechat/jssdk/config`,
	wechatMediaDownloadUrl: `/wechat/media/download`,
	// 下载示例图片接口
	downloadExampleUrl: `${fileHost}`,
	getFilePath: function (path) {
		return config.fileHost + path.replace("files/", "")
	}
};