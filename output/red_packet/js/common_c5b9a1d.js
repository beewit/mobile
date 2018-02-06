var common = {
	token: null,
	mpSessionId: null,
	redPacketFuncId: 10,
	loader: '<div id="loader-wrapper" v-cloak>' +
		'<div id="loader"></div>' +
		'<div class="loader-section section-left"></div>' +
		'<div class="loader-section section-right"></div>' +
		'<div class="load_title">loading<br>' +
		'<span><div>工蜂引流自动抢占流量入口</div><div>一天可达十万人</div></span>' +
		'</div>' +
		'</div>',
	ajax: function (options) {
		var that = this;
		var defaults = {
			loadTip: true,
			errTip: true,
			succTip: true,
			method: "POST",
			dataType: "json",
			url: null,
			data: {},
			responseType: "text",
			success: null,
			error: null,
			complete: null,
		};
		var opt = $.extend(defaults, options);
		var header = {};
		var data = opt.data;
		data.token = that.token;
		data.mpSessionId = that.mpSessionId;
		var succFunc = opt.success;
		var errorFunc = opt.error;
		var compcFunc = opt.complete;
		if (opt.loadTip) {
			setTimeout(function () {
				layer.msg('加载中..', {
					icon: 6,
					time: -1
				});
			}, 10);
		}
		$.ajax({
			url: opt.url,
			method: opt.method,
			data: data,
			success: function (res) {
				layer.closeAll();
				var result = res;
				if (result.ret == 200) {
					if (opt.succTip) {
						if (!that.isEmpty(result.msg) && result.msg.indexOf("获取数据成功") < 0) {
							layer.msg(result.msg);
						}
					}
					typeof succFunc == "function" && succFunc(result)
				} else if (result.ret == 404) {
					//空数据，不做处理
					typeof succFunc == "function" && succFunc(result)
				} else if (result.ret == 401) {
					Cookies.remove("mpSessionId");
					Cookies.remove("token");
					layer.msg("登录失效，刷新重试", {
						icon: 0
					});
				} else if (result.ret == 400) {
					if (opt.errTip) {
						if (!that.isEmpty(result.msg)) {
							layer.alert(result.msg, {
								icon: 0
							});
						}
					}
					typeof errorFunc == "function" && errorFunc(res)
				} else {
					if (!that.isEmpty(result.msg)) {
						layer.alert(result.msg, {
							icon: 0
						});
					}
					typeof errorFunc == "function" && errorFunc(res)
				}
			},
			error: function (res) {
				layer.closeAll();
				if (opt.errTip) {
					layer.msg("网络异常，请稍后重试", {
						icon: 0
					});
				}
				console.log('app request fail:', res)
				typeof errorFunc == "function" && errorFunc(res)
			},
			complete: function (res) {
				typeof compcFunc == "function" && compcFunc(res)
			}
		})
	},
	getToken: function (retFunc) {
		var that = this;
		if (that.isEmpty(that.mpSessionId)) {
			setTimeout(function () {
				that.getToken(retFunc);
			}, 1000);
			return;
		}
		var token = Cookies.get("token")
		var userinfo = Cookies.get("userinfo")
		if (that.isEmpty(token)) {
			that.ajax({
				loadTip: false,
				succTip: false,
				url: config.loginAccountUrl,
				data: {
					actionSource: "WECHAT_MINI_H5"
				},
				success: function (res) {
					console.log('loginAccountUrl:', res)
					that.token = res.data.token;
					that.userinfo = res.data.userinfo;
					Cookies.set("token", that.token, {
						expires: 6
					});
					Cookies.set("userinfo", that.userinfo, {
						expires: 6
					});
					typeof retFunc == "function" && retFunc(res.data.token, res.data.userinfo);
				},
				error: function (res) {
					//获取token失败
					console.log('loginAccountUrl error:', res)
					typeof retFunc == "function" && retFunc(false);
				}
			})
		} else {
			that.token = token;
			typeof retFunc == "function" && retFunc(token, that.isEmpty(userinfo) ? null : JSON.parse(Cookies.get('userinfo')));
		}
	},
	getEffectiveFuncById: function (funcId, backFunc, errFunc) {
		var that = this;
		if (that.isEmpty(that.token)) {
			setTimeout(function () {
				that.getEffectiveFuncById(funcId, backFunc, errFunc);
			}, 1000);
			return;
		}
		that.ajax({
			loadTip: false,
			errTip: false,
			succTip: false,
			url: config.getEffectiveFuncByIdUrl,
			data: {
				funcId: funcId
			},
			success: function (res) {
				//记录到期时间  
				if (res.ret == 404) {
					Cookies.remove("redPacketFuncExpireTime")
				} else {
					Cookies.set("redPacketFuncExpireTime", res.data.expiration_time, {
						expires: 7
					})
				}
				typeof backFunc == "function" && backFunc(res)
			},
			error: function (res) {
				console.log(res)
				typeof errFunc == "function" && errFunc(false)
			},
		})
	},
	getRedPacketFuncExpireTime: function () {
		var that = this;
		var redPacketFuncExpireTime = Cookies.get("redPacketFuncExpireTime");
		if (redPacketFuncExpireTime) {
			var expireTime = new Date(redPacketFuncExpireTime);
			var now = new Date();
			if (now <= expireTime) {
				//企业版未过期，不提示服务费
				return false;
			}
		}
		return true;
	},
	isEmpty: function (str) {
		return str == undefined || str == null || str == "";
	},
	isWeiXin: function () {
		var ua = window.navigator.userAgent.toLowerCase();
		console.log(ua); //mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)version/9.0 mobile/13b143 safari/601.1
		if (ua.match(/MicroMessenger/i) == 'micromessenger') {
			return true;
		} else {
			return false;
		}
	},
	getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); // 匹配目标参数
		var result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
		if (result != null) {
			return decodeURIComponent(result[2]);
		} else {
			return null;
		}
	},
	loadScript: function (url, callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		if (typeof (callback) != "undefined") {
			if (script.readyState) {
				script.onreadystatechange = function () {
					if (script.readyState == "loaded" || script.readyState == "complete") {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else {
				script.onload = function () {
					callback();
				};
			}
		};
		script.src = url;
		document.body.appendChild(script);
	},
	scroll: function (id, loadUpFn, loadDownFn) {
		this.loadScript("/red_packet/js/dropload.min.js", function () {
			$(id).dropload({
				scrollArea: window,
				loadUpFn: function (load) {
					typeof loadUpFn == "function" && loadUpFn(load, function (res) {
						console.log("resetload")
						load.resetload();
						load.unlock(); // 解锁定   
					})
				},
				loadDownFn: function (load) {
					typeof loadDownFn == "function" && loadDownFn(load, function (res) {
						console.log("resetload")
						if (!res || res.data.PageNumber <= res.data.PageIndex) {
							load.lock(); // 锁定   
							load.noData(); // 无数据  
						}
						load.resetload();
					})
				}
			});
		});
	},
	delCookies: function () {
		var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
		if (keys) {
			for (var i = keys.length; i--;)
				Cookies.remove(keys[i])
		}
	},
	init: function () {
		var that = this;
		//读取cookie判断
		that.mpSessionId = Cookies.get("mpSessionId")
		var isWeiXinBow = that.isWeiXin();
		if (that.isEmpty(that.mpSessionId) && isWeiXinBow) {
			location.href = "/wechat/oauth/get?backUrl=" + encodeURIComponent(location.href)
			return;
		}
		if (!isWeiXinBow) {
			alert("请更换微信使用工蜂引流红包裂变");
		}
	}
};
Date.prototype.format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};
/**
 * Basic Usage
Create a cookie, valid across the entire site:

Cookies.set('name', 'value');
Create a cookie that expires 7 days from now, valid across the entire site:

Cookies.set('name', 'value', { expires: 7 });
Create an expiring cookie, valid to the path of the current page:

Cookies.set('name', 'value', { expires: 7, path: '' });
Read cookie:

Cookies.get('name'); // => 'value'
Cookies.get('nothing'); // => undefined
Read all visible cookies:

Cookies.get(); // => { name: 'value' }
Delete cookie:

Cookies.remove('name');
Delete a cookie valid to the path of the current page:

Cookies.set('name', 'value', { path: '' });
Cookies.remove('name'); // fail!
Cookies.remove('name', { path: '' }); // removed!
 * Minified by jsDelivr using UglifyJS v3.1.10.
 * Original file: /npm/js-cookie@2.2.0/src/js.cookie.js
 * 
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
! function (e) {
	var n = !1;
	if ("function" == typeof define && define.amd && (define(e), n = !0), "object" == typeof exports && (module.exports = e(), n = !0), !n) {
		var o = window.Cookies,
			t = window.Cookies = e();
		t.noConflict = function () {
			return window.Cookies = o, t
		}
	}
}(function () {
	function e() {
		for (var e = 0, n = {}; e < arguments.length; e++) {
			var o = arguments[e];
			for (var t in o) n[t] = o[t]
		}
		return n
	}

	function n(o) {
		function t(n, r, i) {
			var c;
			if ("undefined" != typeof document) {
				if (arguments.length > 1) {
					if ("number" == typeof (i = e({
							path: "/"
						}, t.defaults, i)).expires) {
						var a = new Date;
						a.setMilliseconds(a.getMilliseconds() + 864e5 * i.expires), i.expires = a
					}
					i.expires = i.expires ? i.expires.toUTCString() : "";
					try {
						c = JSON.stringify(r), /^[\{\[]/.test(c) && (r = c)
					} catch (e) {}
					r = o.write ? o.write(r, n) : encodeURIComponent(String(r)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent), n = (n = (n = encodeURIComponent(String(n))).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)).replace(/[\(\)]/g, escape);
					var s = "";
					for (var f in i) i[f] && (s += "; " + f, !0 !== i[f] && (s += "=" + i[f]));
					return document.cookie = n + "=" + r + s
				}
				n || (c = {});
				for (var p = document.cookie ? document.cookie.split("; ") : [], d = /(%[0-9A-Z]{2})+/g, u = 0; u < p.length; u++) {
					var l = p[u].split("="),
						C = l.slice(1).join("=");
					this.json || '"' !== C.charAt(0) || (C = C.slice(1, -1));
					try {
						var g = l[0].replace(d, decodeURIComponent);
						if (C = o.read ? o.read(C, g) : o(C, g) || C.replace(d, decodeURIComponent), this.json) try {
							C = JSON.parse(C)
						} catch (e) {}
						if (n === g) {
							c = C;
							break
						}
						n || (c[g] = C)
					} catch (e) {}
				}
				return c
			}
		}
		return t.set = t, t.get = function (e) {
			return t.call(t, e)
		}, t.getJSON = function () {
			return t.apply({
				json: !0
			}, [].slice.call(arguments))
		}, t.defaults = {}, t.remove = function (n, o) {
			t(n, "", e(o, {
				expires: -1
			}))
		}, t.withConverter = n, t
	}
	return n(function () {})
});
//# sourceMappingURL=/sm/f6937b1819ab68f00d8b787ead6c16bfb67977e0c408909621a3b2ff82dbad4a.map

var initLoad = true;
try {
	initLoad = InitLoad
} catch (e) {
	initLoad = true;
}
if (initLoad) {
	common.init();
}