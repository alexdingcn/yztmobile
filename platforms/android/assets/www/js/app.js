/**
 * App通用方法 
 * @author hxbnzy
 * @time 2017/7/26
 **/
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

/** 经销商tabs导航界面跳转 */
function nextResellerToPage(tabs, pages) {
	var i = 0;
	tab_len = tabs.length;
	for(; i < tab_len;) {
		(function(i) {
			tabs[i].addEventListener('click', function() {
				switch(i) {
					case 0:
						window.location.href = pages === '0' ? 'home.html?' + Math.random() : '../home/home.html?' + Math.random();
						break;
					case 1:
						window.location.href = pages === '1' ? 'goods_list.html?' + Math.random() : '../goods/goods_list.html?' + Math.random();
						break;
					case 2:
						//保存到本地
						var selectObj = {
							OrderState: '-2',
							PayState: '-1',
							ResellerID: '0',
							ResellerName: '',
							CreateDate: '-1',
							EndeDate: '-1'
						}

						sessionStorage.setItem('$reseller_selectObj', JSON.stringify(selectObj));
						window.location.href = pages === '2' ? 'order_list.html?' + Math.random() : '../order/order_list.html?' + Math.random();
						//						window.location.href = '../distributor/disserbutor_list.html?'+Math.random();
						break;
						//					case 3:
						//						window.location.href = pages === '3' ? 'funds_list.html?' + Math.random() : '../funds/funds_list.html?' + Math.random();
						//						break;
					case 3:
						window.location.href = pages === '4' ? 'personal_center.html?' + Math.random() : '../personal_center/personal_center.html?' + Math.random();
						break;
				}
			});
		})(i);
		i++
	};

}

/** 核心企业tabs导航界面跳转 */
function nextCompToPage(tabs, pages) {
	var i = 0;
	tab_len = tabs.length;
	for(; i < tab_len;) {
		(function(i) {
			tabs[i].addEventListener('click', function() {
				switch(i) {
					case 0:
						window.location.href = pages === '0' ? 'home.html?' + Math.random() : '../home/home.html?' + Math.random();
						break;
					case 1:
						//						window.location.href = '../order/order_list.html?'+Math.random();
						window.location.href = pages === '1' ? 'order_list.html?' + Math.random() : '../order/order_list.html?' + Math.random();
						break;
					case 2:
						window.location.href = pages === '2' ? 'disserbutor_list.html?' + Math.random() : '../distributor/disserbutor_list.html?' + Math.random();
						//						window.location.href = '../distributor/disserbutor_list.html?'+Math.random();
						break;
					case 3:
						window.location.href = pages === '3' ? 'goods_list.html?' + Math.random() : '../goods/goods_list.html?' + Math.random();
						break;
					case 4:
						window.location.href = pages === '4' ? 'news_list.html?' + Math.random() : '../news/news_list.html?' + Math.random();
						break;
				}
			});
		})(i);
		i++
	};

}

/** list search conditions */
function getSearch_cond() {
	var searchCond = new Object();
	searchCond.CriticalOrderID = '-1'; //当前列表最临界点订单ID（唯一）（客户端无数据传-1）
	searchCond.GetType = '1'; //获取临界点往上数据：0 获取临界点往下数据：1
	searchCond.Rows = '10'; //每次申请条数	
	searchCond.SortType = '0'; //排序类型（0：默认 1：日期xxxx-xx-xx 2：价格）
	searchCond.Sort = '0'; //(0：顺序 1：倒序)
	return searchCond;
}

/** 初始化时间选择器 */
function selectDate(isBind) {

	// 初始化时间
	var now = new Date();
	var nowYear = now.getFullYear();
	var nowMonth = now.getMonth() + 1;
	var nowDate = now.getDate();
	showDateDom.attr('data-year', nowYear);
	showDateDom.attr('data-month', nowMonth);
	showDateDom.attr('data-date', nowDate);
	// 数据初始化
	function formatYear(nowYear) {
		var arr = [];
		for(var i = nowYear - 5; i <= nowYear + 5; i++) {
			arr.push({
				id: i + '',
				//              value: i + '年'
				value: i + ''
			});
		}
		return arr;
	}

	function formatMonth() {
		var arr = [];
		for(var i = 1; i <= 12; i++) {
			arr.push({
				id: i + '',
				//              value: i + '月'
				value: i + ''
			});
		}
		return arr;
	}

	function formatDate(count) {
		var arr = [];
		for(var i = 1; i <= count; i++) {
			arr.push({
				id: i + '',
				//              value: i + '日'
				value: i + ''
			});
		}
		return arr;
	}
	yearData = function(callback) {
		setTimeout(function() {
			callback(formatYear(nowYear))
		}, 1000)
	}
	monthData = function(year, callback) {
		setTimeout(function() {
			callback(formatMonth());
		}, 1000);
	};
	dateData = function(year, month, callback) {
		setTimeout(function() {
			if(/^1|3|5|7|8|10|12$/.test(month)) {
				callback(formatDate(31));
			} else if(/^4|6|9|11$/.test(month)) {
				callback(formatDate(30));
			} else if(/^2$/.test(month)) {
				if(year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
					callback(formatDate(29));
				} else {
					callback(formatDate(28));
				}
			} else {
				throw new Error('month is illegal');
			}
		}, 1000);

	};

}

/**
 * Merger list 'a' or 'b'
 * No repeating
 * @author hxbnzy
 * @time 2017/8/15
 */
function mergerArrayList(a, b) {
	var i = 0;
	len = b.length;
	for(; i < len;) {
		a.push(b[i]);
		i++;
	}
	return a;
}

function StringBuffer() {
	this.__strings__ = [];
};
StringBuffer.prototype.Append = function(str) {
	this.__strings__.push(str);
	return this;
};
/** 格式化字符串 */
StringBuffer.prototype.AppendFormat = function(str) {
	for(var i = 1; i < arguments.length; i++) {
		var parent = "\\{" + (i - 1) + "\\}";
		var reg = new RegExp(parent, "g")
		str = str.replace(reg, arguments[i]);
	}

	this.__strings__.push(str);
	return this;
}
StringBuffer.prototype.ToString = function() {
	return this.__strings__.join('');
};
StringBuffer.prototype.clear = function() {
	this.__strings__ = [];
}
StringBuffer.prototype.size = function() {
	return this.__strings__.length;
}

/** type */
function getDate(type) {
	var myDate = new Date();
	switch(type) {
		case '0':
			return myDate.getFullYear() + '-' + myDate.getMonth() + '-' + myDate.getDate();
			break;
	}
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for(var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable) {
			return pair[1];
		}
	}
	return(false);
}
/** 验证是否微信打开 */
function is_weixin() {
	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
}

/** 版本号 */
function getVersion() {
	return '20170911';
}

/**
 * 商品属性规格特殊字符处理
 * @param {Object} str 特殊字符
 */
function replaceValueInfo(str) {
	var str = str.replace("²", "&#178;");
	return str;
}

function initJPush(callback) {

}

/**初始化JPush*/
var onDeviceReady = function() {
	initiateUI();
};

var getRegistrationID = function() {
	window.JPush.getRegistrationID(onGetRegistrationID);
};

var onGetRegistrationID = function(data) {
	try {
		console.log("JPushPlugin:registrationID is " + data);

		if(data.length == 0) {
			var t1 = window.setTimeout(getRegistrationID, 1000);
		}
	} catch(exception) {
		console.log(exception);
	}
};

var initiateUI = function() {
	try {
		window.JPush.init();

		getRegistrationID()
		console.log(device.platform);
		if(device.platform != "Android") {
			window.JPush.setDebugModeFromIos();
			window.JPush.setApplicationIconBadgeNumber(0);
		} else {
			window.JPush.setDebugMode(true);
			window.JPush.setStatisticsOpen(true);
		}

	} catch(exception) {
		console.log(exception);
	}
};

/**
 * JPush 获取用户别名
 * @param {Object} CompUserID
 */
var getAlias = function(callback) {
	var obj = {
		Result: "",
		Description: ''
	};

	window.JPush.getAlias({
			sequence: 1
		},
		function(result) {
			console.log("别名获取==========成功了");
			var sequence = result.sequence
			var alias = result.alias
			obj.Result = "T";
			obj.Description = alias;
			return callback(obj);
		},
		function(error) {
			console.log("别名获取==========失败了");
			var sequence = error.sequence
			var errorCode = error.code
			obj.Result = "F";
			obj.Description = errorCode;
			return callback(obj);
		})

}

/**
 * JPush 设置用户识别别名
 * @param {Object} CompUserID
 */
var setAlias = function(userID, callback) {
	var obj = {
		Result: "",
		Description: ''
	};

	window.JPush.setAlias({
			sequence: Math.random(),
			alias: userID
		},
		function(result) {
			console.log("别名设置==========成功了");
			obj.Result = "T";
			obj.Description = result;
			return callback(obj);
		},
		function(error) {
			console.log("别名设置==========失败了");
			obj.Result = "F";
			obj.Description = error;
			return callback(obj);
		});

};

/** JPush 清空别名 */
var deleteAlias = function(callback) {
	var obj = {
		Result: "",
		Description: ''
	};
	window.JPush.deleteAlias({
			sequence: Math.random()
		},
		function(result) {
			obj.Result = "T";
			obj.Description = result;
			return callback(obj);
		},
		function(error) {
			obj.Result = "F";
			obj.Description = error;
			return callback(obj);
		});
};

/**
 * 用户点击推送
 * @param {Object} event 
 */
var onOpenNotification = function(event) {
	try {
		var pathName = window.document.location.pathname;
		var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
		var roleDetail = localStorage.getItem('$login_role') || "";
		var usersObj = JSON.parse(roleDetail);
		if(roleDetail === null || roleDetail === '')
			window.location.href = projectName + '/www/company_pages/login/login.html?t=' + Math.random()

		var type;
		var obj;
		if(device.platform == "Android") {
			type = event.extras.Type
			obj = JSON.parse(Decrypt(event.extras.Json));
			//跳转订单
			if(type === '1' || type === 1) {
				//核心企业
				if(usersObj.CType === 1) {
					//跳转页面
					window.location.href = projectName + '/www/company_pages/order/order_detail.html?random=' + Math.random() + '&id=' + obj.ReceiptNo
				} else if(usersObj.CType === 2) { //经销商
					window.location.href = projectName + '/www/reseller_pages/order/order_detail.html?random=' + Math.random() + '&id=' + obj.ReceiptNo
				} else {
					window.location.href = projectName + '/www/company_pages/login/login.html?t=' + Math.random()
				}
			} else if(type === '2' || type === 2) {
				//消息公告
				if(usersObj.CType === 1) {
					window.location.href = projectName + '/www/company_pages/news/news_info.html?random=' + Math.random() + '&id=' + obj.ID
				} else if(usersObj.CType === 2) { //经销商
					window.location.href = projectName + '/www/reseller_pages/news/news_info.html?random' + Math.random() + '&id=' + obj.ID
				} else {
					window.location.href = projectName + '/www/company_pages/login/login.html?t=' + Math.random()
				}

			}
		} else {
			//设置角标
			window.JPush.setApplicationIconBadgeNumber(0);
			type = event.Type
			obj = JSON.parse(Decrypt(event.Json));
			//跳转订单
			if(type === '1' || type === 1) {
				//核心企业
				if(usersObj.CType === 1) {
					window.location.href = cordova.file.applicationDirectory + 'www/company_pages/order/order_detail.html?random=' + Math.random() + '&id=' + obj.ReceiptNo
				} else if(usersObj.CType === 2) { //经销商
					window.location.href = cordova.file.applicationDirectory + 'www/reseller_pages/order/order_detail.html?random=' + Math.random() + 'id==' + obj.ReceiptNo
				} else {
					window.location.href = cordova.file.applicationDirectory + 'www/company_pages/login/login.html?t=' + Math.random()
				}
			} else if(type === '2' || type === 2) {
				//消息公告
				if(usersObj.CType === 1) {
					window.location.href = cordova.file.applicationDirectory + 'www/company_pages/news/news_info.html?random=' + Math.random() + '&id=' + obj.ID
				} else if(usersObj.CType === 2) { //经销商
					window.location.href = cordova.file.applicationDirectory + 'www/reseller_pages/news/news_info.html?random' + Math.random() + '&id=' + obj.ID
				} else {
					window.location.href = cordova.file.applicationDirectory + 'www/company_pages/login/login.html?t=' + Math.random()
				}
			}

		}

	} catch(exception) {
		console.log("JPushPlugin:onOpenNotification" + exception);
	}
};

var onReceiveNotification = function(event) {
	try {
		var alertContent;
		if(device.platform == "Android") {
			alertContent = event.alert;
		} else {
			alertContent = event.aps.alert;
		}
	} catch(exception) {
		console.log(exception)
	}
};

var onReceiveMessage = function(event) {
	try {
		var message;
		if(device.platform == "Android") {
			message = event.message;
		} else {
			message = event.content;
		}
	} catch(exception) {
		console.log("JPushPlugin:onReceiveMessage-->" + exception);
	}
};

/**
 * 字符串解密 
 * @param {Object} data
 */
function Decrypt(data) {
	var key = CryptoJS.enc.Utf8.parse("HaiYuSoftOrder18");
	var iv = CryptoJS.enc.Utf8.parse("1hj^5B6k7o8v&*fR'");
	var decrypted = CryptoJS.AES.decrypt(
		data,
		key, {
			iv: iv,
			padding: CryptoJS.pad.Pkcs7
		});
	return decrypted.toString(CryptoJS.enc.Utf8);
}

/** 开启调试 */
//var isDebug = function(){
//	return false;
//}

function isDebug() {
	return true;
}

/** 跳转登陆界面 */
function JumpLoginPage() {
	var wxCode = localStorage.getItem('wxCode');
	var wx_oa = localStorage.getItem('wx_oa');
	if(wxCode !== null && wxCode !== '') {
		window.location.href = '../company_pages/login/login.html?t=' + Math.random() + '&wx_oa=' + wx_oa + '&wxCode=' + wxCode;
	} else {
		window.location.href = '../company_pages/login/login.html?t=' + Math.random() + '&wx_oa=' + wx_oa + '&wxCode=' + wxCode;
	}
}

/**
 * 字符串截取省略
 * @param {Object} str 截取的字符串
 * @param {Object} len 截取长度
 * @param {Object} flow 多余部分显示的符号
 */
function substringOmit(str, len, flow) {
	if(!str) return '';
	str = str.toString();
	var newStr = "",
		strLength = str.replace(/[^\x00-\xff]/g, "**").length,
		flow = typeof(flow) == 'undefined' ? '...' : flow;
	if(strLength <= len + (strLength % 2 == 0 ? 2 : 1)) return str;
	for(var i = 0, newLength = 0, singleChar; i < strLength; i++) {
		singleChar = str.charAt(i).toString();
		if(singleChar.match(/[^\x00-\xff]/g) != null) newLength += 2;
		else newLength++;

		if(newLength > len) break;
		newStr += singleChar;
	}
	if(strLength > len) newStr = $.trim(newStr) + flow;
	return newStr;
}

/**
 * 验证当前账号是否存在多角色用户
 */
var validatingRoles = function() {
	var usersList = JSON.parse(localStorage.getItem('$usersList'));
	var isValidatingRoles = false;
	var userType = null;
	$.each(usersList, function(index, value) {
		if(userType === null) {
			userType = value.CType
		}
		if(userType !== value.CType) {
			isValidatingRoles = true;
		}
	});
	return isValidatingRoles;
};