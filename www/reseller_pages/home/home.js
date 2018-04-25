var usersObj;
var getTypes = 0;
var mySwiper;
$(function() {
	$("#CriticalProductIDs").val("-1");
	FastClick.attach(document.body);
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$(window).bind("scroll", LoadData); //绑定下拉事件
	DataGoodsBind(); //初次加载(商品列表)

	var tabs = $('#tabs a');
	nextResellerToPage(tabs, '0');
	//排列方式单机事件
	$("#Array").on('click', function() {
		$('#offCanvas').offCanvas('open');
	});

	//头部搜索
	$("#selectBtn").on('click', function() {
		var text = $("#selectText").val()
		if(text != "搜索商品") {
			$("#selectTextHid").val(text)
			$("#CriticalProductIDs").val("-1")
			$("#goodsLiBig").html("")
			DataGoodsBind();
		}
	})

	//商品搜索  防止时间冒泡
	$("#selectText").on('click', function() {
		return false;
	});

	loadCompanyList();
	DataNewsBind();

	$('#newsList').click(function() {
		window.location.href = '../news/news_list.html?' + Math.random();
	});
	$('#shoppingCart').click(function() {
		window.location.href = '../goods/shopping_cart.html?' + Math.random();
	});
	$('#goodsList').click(function() {
		window.location.href = '../goods/goods_list.html?random =' + Math.random() + 't=cx';
	});
	$('#goodsCollection').click(function() {
		window.location.href = '../goods/goods_collection.html?' + Math.random();
	});
	$('#orderList').click(function() {
		window.location.href = '../order/order_list.html?' + Math.random();
	});
	$('#paymentRecharge').click(function() {
		//		window.location.href = '../funds/payment_recharge.html?'+Math.random();
		//保存到本地
		var selectObj = {
			OrderState: '-2',
			PayState: '0',
			ResellerID: '0',
			ResellerName: '',
			CreateDate: '-1',
			EndeDate: '-1'
		}

		sessionStorage.setItem('$reseller_selectObj', JSON.stringify(selectObj));
		window.location.href = '../order/order_list.html?' + Math.random();
	});

});

function loadCompanyList() {
	var GetUserCompany = JSON.stringify({
		UserID: usersObj.UserID
	});

	post('GetUserCompany', GetUserCompany, function(response) {
		if(response.Result === 'T') {
			// 加载厂商列表
			CompanyList = response.CompanyList;
			
			$.each(CompanyList, function(index, item) {
				// 厂商列表初次加载 默认选中第一个 
				// 从本地获取选中的厂商信息
				var isSelect = false;
				var items = null;
				if(item.CompanyID === usersObj.CompID)
					isSelect = true;
				
				if(isSelect){
					items = '<li style="color:dodgerblue" class="firm-li"   onclick=firmclickListener(this,' + index + ')>' +
					'<a style="color: dodgerblue">' + item.CompanyName + '</a><i class="i-arrow"></i>' +
					'</li>';
				}else{
					items = '<li class="firm-li" onclick=firmclickListener(this,' + index + ')>' +
					'<a>' + item.CompanyName + '</a><i class="i-arrow"></i>' +
					'</li>';
				}
				
				$('#addList').append(items);
			});
		} else {

		}
	});
}

/** 厂商选择监听 */
var firmclickListener = function(th,index) {
	// 保存当前选择厂商信息
	$('#offCanvas a').css("color","black");
	$(th).children('a').css("color","dodgerblue");
	if(CompanyList === null) {
		return;
	}
	// 替换默认保存的厂商ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	usersObj.CompID = CompanyList[index].CompanyID;
	usersObj.CompName = CompanyList[index].CompanyName;
	localStorage.setItem('$login_role', JSON.stringify(usersObj));
	// 根据选中的厂商 刷新商品列表 ，刷新筛选列表
	refreshview();
	$('#offCanvas').offCanvas('close');
}

/** 刷新界面 */
var refreshview = function() {
	$(".swiper-wrapper").html('');
	$("#goodsLiBig").html('');
	$("#footer").html('');
	$("#CriticalProductIDs").val("-1");
	mySwiper.destroy(false);
	var loadmore = '<div class="weui-loadmore"><i class="weui-loading"></i><span class="weui-loadmore__tips">正在加载商品信息</span></div>';
	$("#goodsLiBig").html(loadmore);
	DataGoodsBind();
	DataNewsBind();
};

//页面下拉事件
function LoadData() {
	getTypes = 1;
	var scrollTop = parseInt($(document).scrollTop()); //页面滚动的高度
	var scrollHeight = parseInt($(document).height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$(window).unbind("scroll"); //取消下拉绑定事件
		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
		setTimeout(function() {
			DataGoodsBind(); //下拉加载
		}, 1000);
	}
}

/** 绑定商品 */
function DataGoodsBind() {
	var datastr = getDate();
	$('.weui-loadmore').show();
	post('ResellerProductSearch', datastr, function(response) {

		$('.weui-loadmore').hide();
		if(response.Result == "T" && response.Description == "返回成功") {
			$("#footer").hide(); //隐藏加载中
			$(window).bind("scroll", LoadData); //重新绑定下拉事件
			var strbig = "";
			//遍历商品  追加到列表
			$.each(response.ProductSimpleList, function(n, value) {
				var imgurl = "../../images/pic.jpg";
				if(n == response.ProductSimpleList.length - 1)
					$("#CriticalProductIDs").val(value.ProductID) //记录当前列表最临界点订单ID

				if(value.ProductPicUrlList.length > 0)
					imgurl = value.ProductPicUrlList[0].PicUrl
				strbig += '<div class="li">' +
					'<a href="../goods/goods_detail.html?random=' + Math.random() + "&gid=" + value.ProductID + '">' +
					'<div class="pic"><img  src="' + imgurl + '"></div>' +
					'<div class="title">' + value.ProductName + '</div>' +
					'<div class="sum rcolor">¥' + value.SalePrice + '</div>' +
					'</a>' +
					'<a href="../goods/goods_detail.html?random=' + Math.random() + "&gid=" + value.ProductID + '">' +
					' </div>'
			});
			$("#goodsLiBig").append(strbig)
		} else if(response.Result == "T" && response.Description == "没有更多数据") {
			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
				'</div>';
			$("#footer").html(footer);
		} else {
			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
				'</div>';
			$("#footer").html(footer);
		}
	});
}

//获取查询参数
function getDate() {
	var ProductNames = $("#selectTextHid").val(); //搜索条件: 订单号/经销商ID/经销商名称
	var CriticalProductIDs = $("#CriticalProductIDs").val(); //当前列表最临界点订单ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	$("#CompName").html(usersObj.CompName) //公司名称
	var filter = {
		Classif:"-1",
        IsSales:"",
        MaxPrice:"",
        MinPrice:"",
        ProductStatus:"0"
	}
	var DataJson = {
		CompID: usersObj.CompID,
		Condition:"",
		CriticalProductID: CriticalProductIDs,
		Filter:filter,
		GetType: getTypes,
		ResellerID: usersObj.DisID,
		Type:"0",
		UserID: usersObj.UserID
	}
	//	 console.log(JSON.stringify(DataJson));
	return JSON.stringify(DataJson);
}

//获取新闻公告列表
function DataNewsBind() {
	var DataJson = {
		UserID: usersObj.UserID,
		CompanyID: usersObj.CompID,
		ResellerID: usersObj.DisID,
		IsEnabled: "1",
		CriticalOrderID: '-1',
		GetType: "1",
		Rows: "10",
		SortType: "0",
		OrderType: "0",
		Sort: "0",
		Search: {
			Title: "-1",
			NewsID: "-1",
			IsEnable: "-1",
			IsTop: "-1",
			NewsType: "-1",
			ShowType: "-1"
		},
		Infotype: "-1"
	}

	var datastr = JSON.stringify(DataJson)
	post('CompNewsList', datastr, function(response) {
		//console.log(JSON.stringify(response));
		if(response.Result == "T" && response.Description == "获取成功") {
			//		 		console.log(JSON.stringify(response.NewsList));
			var newsLists = response.NewsList;
			var html = "";
			//遍历消息   追加到列表
			if(newsLists.length > 1) {
				for(var i = 0; i < newsLists.length; i++) {
					html += "<li class='swiper-slide swiper-no-swiping'><a href='../news/news_info.html?random=" + Math.random() + "id=" + newsLists[i].NewsID + "'>[新闻]&nbsp;&nbsp;" + newsLists[i].Title + "</a></li>";
					if(i == 5) {
						break;
					}
				}
			} else if(newsLists.length = 1) {
				html = "<li>[新闻]&nbsp&nbsp" + newsLists[0].Title + "</li>";
			} else {
				html = "<li>暂无消息</li>";
			}
			$(".swiper-wrapper").append(html);
			//消息轮播
			mySwiper = new Swiper('.swiper-container', {
				autoplay: 2500,
				direction: 'vertical',
				loop: true
			});

		}
	});

}