/**
 *  核心企业首页
 * 	@author hxbnzy
 *  @time 2017/07/24
 */
var GetOrderPromptState = false;
var GetCompyBriefingState = false;
var GetCompanyState = false;
var usersObj;
var OpenID = '';
var isWxLogin = false;
$(function() {
	FastClick.attach(document.body);
	if(is_weixin()) {
		OpenID = localStorage.getItem('$wx_openid') || "";
		if(OpenID !== false) {
			isWxLogin = true;
		}
	} else {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	}
	var roleDetail = localStorage.getItem('$login_role') || "";
	var usersList = JSON.parse(localStorage.getItem('$usersList') || "");
	if (roleDetail === null || roleDetail === '') {
		window.location.href = '../login/login.html';
		return;
	}
	usersObj = JSON.parse(roleDetail);
	initData(usersObj); //初始化数据

	document.getElementById('comp_title').innerHTML = usersObj.CompName;
	//添加 本月 半年 全年标签点击事件
	var oi = document.getElementById('wrap').getElementsByTagName("i");
	for(var i = 0; i < oi.length; i++) {
		(function(i) {
			oi[i].addEventListener('click', function() {
				if(i !== 0) {
					//删除默认cur选中样式
					oi[0].className = oi[0].className.replace('cur', '');
				}
				GetCompanySta(i, usersObj);
			});
		})(i);
	}

	var tabs = $('#tabs a');
	nextCompToPage(tabs, '0');
	//	var i = 0;len = tabs.length;
	//	for(;i<len;){
	//		(function(i){
	//			tabs[i].addEventListener('click',function(){
	//				switch(i){
	//					case 0:
	//						window.location.href = 'home.html?'+Math.random();
	//					break;
	//					case 1:
	//						window.location.href = '../order/order_list.html?'+Math.random();
	//					break;
	//					case 2:
	//						window.location.href = '../distributor/disserbutor_list.html?'+Math.random();
	//					break;
	//					case 3:
	//						window.location.href = '../goods/goods_list.html?'+Math.random();
	//					break;
	//					case 4:
	//						window.location.href = '../news/news_list.html?'+Math.random();
	//					break;
	//				}
	//			});
	//		})(i);
	//		i++;
	//	}

	$('#setting').on('click', function() {
		if(validatingRoles()) {
			weui.actionSheet([{
				label: '个人中心',
				onClick: function() {
					setTimeout(function() {
						window.location.href = '../personal_center/account_settings.html?' + Math.random();
					}, '300');

				}
			}, {
				label: '切换代理商',
				onClick: function() {
					var login_role = null;
					$.each(usersList, function(index, value) {
						if(value.CType === 2) {
							login_role = value;
							return false
						}
					});
					//将登陆角色保存到本地
					localStorage.setItem('$login_role', JSON.stringify(login_role));
					window.location.href = '../../reseller_pages/home/home.html?' + Math.random();
					//					showRoleList(usersList);
				}
			}, {
				label: '退出账号',
				onClick: function() {
					if(isWxLogin) {
						//清空openid
						var EditOpenID = JSON.stringify({
							OpenID: '',
							CompUserID: usersObj.CompUserID,
						});

						post('EditOpenID', EditOpenID, function(response) {

						});

					} else {
						//					if(isDebug) {
						//
						//					} else {
						//						deleteAlias(function(response) {
						//							if(response.Result === "T") {
						//								console.log(response.Description.alias);
						//							} else {
						//								//							//极光推送别名设置失败
						//								//							//目前不知道改做什么操作 😢
						//								console.log(response.Description.code);
						//								//							weui.topTips('推送注销失败', {
						//								//								duration: 3000,
						//								//								className: "custom-classname",
						//								//								callback: function() {
						//								//									console.log('close');
						//								//								}
						//								//							});
						//								return;
						//							}
						//						});
						//					}

					}

					setTimeout(function() {

						localStorage.setItem('$usersList', '[]');
						localStorage.setItem('$login_role', ''); //清空本地保存信息

						window.location.href = '../login/login.html?' + Math.random();
					}, '1000')

				}
			}], [{
				label: '取消',
				onClick: function() {

				}
			}], {
				className: "custom-classname"
			});
		} else {
			weui.actionSheet([{
				label: '个人中心',
				onClick: function() {
					setTimeout(function() {
						window.location.href = '../personal_center/account_settings.html?' + Math.random();
					}, '300');

				}
			}, {
				label: '退出账号',
				onClick: function() {
					if(isWxLogin) {
						//清空openid
						var EditOpenID = JSON.stringify({
							OpenID: '',
							CompUserID: usersObj.CompUserID,
						});

						post('EditOpenID', EditOpenID, function(response) {

						});

					} else {
						//					if(isDebug) {
						//
						//					} else {
						//						deleteAlias(function(response) {
						//							if(response.Result === "T") {
						//								console.log(response.Description.alias);
						//							} else {
						//								//							//极光推送别名设置失败
						//								//							//目前不知道改做什么操作 😢
						//								console.log(response.Description.code);
						//								//							weui.topTips('推送注销失败', {
						//								//								duration: 3000,
						//								//								className: "custom-classname",
						//								//								callback: function() {
						//								//									console.log('close');
						//								//								}
						//								//							});
						//								return;
						//							}
						//						});
						//					}
					}
					setTimeout(function() {
						localStorage.setItem('$usersList', '[]');
						localStorage.setItem('$login_role', ''); //清空本地保存信息
						window.location.href = '../login/login.html?' + Math.random();
					}, '1000')

				}
			}], [{
				label: '取消',
				onClick: function() {

				}
			}], {
				className: "custom-classname"
			});
		}

	});
});

/** 
 * 初始化数据
 */
function initData(usersObj) {

	//获取核心企业未处理订单数
	var OrderPrompt = JSON.stringify({
		UserID: usersObj.UserID,
		ResellerID: '',
		CompanyID: usersObj.CompID
	});

	post('GetOrderPrompt', OrderPrompt, function(response) {
		GetCompanyState = true;
		controlProgressBar();
		if(response.Result === "T") {
			initOrderPrompt(response);

		} else {
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					
				}
			});
		}
	});

	//获取核心企业简报
	var bCompyBriefing = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID,
	});

	post('GetCompyBriefing', bCompyBriefing, function(response) {
		GetCompyBriefingState = true;
		controlProgressBar();
		if(response.Result === "T") {
			setBCompyBriefing(response);
		} else {
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
				}
			});
		}
	});

	GetCompanySta('0', usersObj);

}

/**
 * 获取核心企业图标统计
 */
function GetCompanySta(type, usersObj) {
	GetOrderPromptState = false;
	controlProgressBar();
	//获取核心企业图标统计
	var CompySta = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID,
		DataType: type //0本月 1半年 2一年
	});

	post('GetCompanySta', CompySta, function(response) {
		GetOrderPromptState = true;
		controlProgressBar();
		if(response.Result === "T") {
			setLineChart(response.XList, response.XValueList);

		} else {
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					
				}
			});
		}
	});
}

/**
 * 控制页面网络请求加载进度条
 */
function controlProgressBar() {
	if(GetOrderPromptState === true && GetCompyBriefingState === true && GetCompanyState === true) {
		$('#progressBar').hide();
	} else {
		$('#progressBar').show();
	}

}

/**
 * 设置核心企业未处理订单数
 */
function initOrderPrompt(OrderPrompt) {
	document.getElementById('orderAudit').innerHTML = OrderPrompt.OrderAudit + '笔';
	document.getElementById('orderSend').innerHTML = OrderPrompt.OrderSend + '笔';
	//	document.getElementById('orderReturnAudit').innerHTML = OrderPrompt.OrderReturnAudit + '笔';
	//	document.getElementById('resellerAudit').innerHTML = OrderPrompt.ResellerAudit + '笔';
}
/**
 * 设置核心企业简报
 */
function setBCompyBriefing(BriefingObj) {
	var BriefingList = BriefingObj.BriefingList;
	for(var i = 0; i < BriefingList.length; i++) {
		if(BriefingList[i].Type === "0") { //订单
			document.getElementById('order_DayNumb').innerHTML = BriefingList[i].DayNumb + '笔';
			document.getElementById('order_WeekNumb').innerHTML = BriefingList[i].WeekNumb + '笔';
			document.getElementById('order_MonthNumb').innerHTML = BriefingList[i].MonthNumb + '笔';

			document.getElementById('order_DayMoney').innerHTML = '¥' + BriefingList[i].DayMoney;
			document.getElementById('order_WeekMoney').innerHTML = '¥' + BriefingList[i].WeekMoney;
			document.getElementById('order_MonthMoney').innerHTML = '¥' + BriefingList[i].MonthMoney;
			
		} else if(BriefingList[i].Type === "1") {//退货单


		} else if(BriefingList[i].Type === "2") {//收款

			document.getElementById('retrun_DayNumb').innerHTML = BriefingList[i].DayNumb + '笔';
			document.getElementById('retrun_WeekNumb').innerHTML = BriefingList[i].WeekNumb + '笔';
			document.getElementById('retrun_MonthNumb').innerHTML = BriefingList[i].MonthNumb + '笔';

			document.getElementById('retrun_DayMoney').innerHTML = '¥' + BriefingList[i].DayMoney;
			document.getElementById('retrun_WeekMoney').innerHTML = '¥' + BriefingList[i].WeekMoney;
			document.getElementById('retrun_MonthMoney').innerHTML = '¥' + BriefingList[i].MonthMoney;

//			document.getElementById('receive_DayNumb').innerHTML = BriefingList[i].DayNumb + '笔';
//			document.getElementById('receive_WeekNumb').innerHTML = BriefingList[i].WeekNumb + '笔';
//			document.getElementById('receive_MonthNumb').innerHTML = BriefingList[i].MonthNumb + '笔';
//
//			document.getElementById('receive_DayMoney').innerHTML = '¥' + BriefingList[i].DayMoney;
//			document.getElementById('receive_WeekMoney').innerHTML = '¥' + BriefingList[i].WeekMoney;
//			document.getElementById('receive_MonthMoney').innerHTML = '¥' + BriefingList[i].MonthMoney;

		}
	}
	//		var type0 = BriefingList[0];

	//		document.getElementById('order_DayNumb').innerHTML = ;
}

/**
 * 设置折线图
 * @param XList
 * @param XValueList
 */
function setLineChart(XList, XValueList) {
	var myChart = echarts.init(document.getElementById('linechart'));

	option = {
		backgroundColor: 'transparent',

		title: {
			show: false,
			left: 'center'
		},
		noDataLoadingOption: {
			text: '暂无数据',
			effect: 'bubble',
			effectOption: {
				effect: {
					n: 0
				}
			}
		},

		xAxis: {
			type: 'category',
			splitLine: {
				show: false
			},
			data: XList,
			axisLine: {
				lineStyle: {
					color: '#eee'
				}
			},
			axisTick: {
				show: false,
			}
		},
		grid: {
			top: '6%',
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		yAxis: {
			type: 'value',
			axisLine: {
				show: false,
				lineStyle: {
					color: '#eee'
				}
			},
			axisTick: {
				show: false,
			},
			nameTextStyle: {
				fontSize: 5,
			}

		},
		series: [{
				type: 'line',
				data: XValueList,
				itemStyle: {
					normal: {
						borderColor: '#008be3',
						borderWidth: 1,
						lineStyle: {
							color: '#eee'
						}
					}
				}
			},

		]
	};

	myChart.setOption(option);
}

/**
 * 展示角色列表
 */
function showRoleList(userList) {
	var login_role = null;
	$.each(userList, function(index, value) {
		if(value.CType === 2) {
			login_role = value;
			return false
		}
	});
	setTimeout(function() {
		weui.actionSheet([{
			label: '代理商',
			onClick: function() {
				setTimeout(function() {
					//将登陆角色保存到本地
					localStorage.setItem('$login_role', JSON.stringify(login_role));
					window.location.href = '../../reseller_pages/home/home.html?' + Math.random();
				}, '1000');
			}
		}], [{
			label: '取消',
			onClick: function() {

			}
		}]);
	}, '1000');

	//	var roleList = new Array();
	//	var i = 0;
	//	len = userList.length;
	//
	//	var actionList = new Array();;
	//	for(; i < len;) {
	//		(function(i) {
	//			action = {
	//				label: userList[i].CType === 1 ? userList[i].CompName + ' - 核心企业' : userList[i].CompName + ' - 经销商  ',
	//				onClick: function() {
	//					selectCallback(i, userList);
	//				}
	//			}
	//
	//		})(i);
	//		actionList.push(action);
	//		i++;
	//	}
	//
	//	setTimeout(function() {
	//		weui.actionSheet(
	//			actionList, [{
	//				label: '取消',
	//				onClick: function() {
	//
	//				}
	//			}]
	//		);
	//	}, 600);

}

function selectCallback(position, userList) {
	if(isWxLogin) {
		var OpenID = localStorage.getItem('$wx_openid') || "";
		var EditOpenID = JSON.stringify({
			OpenID: OpenID,
			CompUserID: userList[position].CompUserID,
		});
		post('EditOpenID', EditOpenID, function(response) {

		});
	} else {
		//		//重置JPush 别名
		//		setAlias(md5(userList[position].CompUserID), function(response) {
		//			if(response.Result === "T") {
		//				console.log(response.Description.alias);
		//			} else {
		//				weui.topTips('推送设置失败,请稍后重试', {
		//					duration: 3000,
		//					className: "custom-classname",
		//					callback: function() {
		//						console.log('close');
		//					}
		//				});
		//
		//				return;
		//				//				console.log(response.Description.code);
		//			}
		//		});
		//		if(isDebug) {
		//
		//		} else {
		//			//重置JPush 别名
		//			setAlias(md5(userList[position].CompUserID), function(response) {
		//				if(response.Result === "T") {
		//					console.log(response.Description.alias);
		//				} else {
		//					weui.topTips('推送设置失败,请稍后重试', {
		//						duration: 3000,
		//						className: "custom-classname",
		//						callback: function() {
		//							console.log('close');
		//						}
		//					});
		//
		//					return;
		//					//				console.log(response.Description.code);
		//				}
		//			});
		//		}

	}

	setTimeout(function() {
		//将登陆角色保存到本地
		localStorage.setItem('$login_role', JSON.stringify(userList[position]));
		if(userList[position].CType === 1) {
			window.location.href = '../home/home.html?' + Math.random();
		} else if(userList[position].CType === 2) {
			window.location.href = '../../reseller_pages/home/home.html?' + Math.random();
		} else {

		}
	}, '1000');

}