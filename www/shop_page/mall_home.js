/**
 * This page is my1818 wechat inline enterprise home.
 * @author hxbnzy
 * @time 2017/09/06
 */
var CompID = '';
var CriticalProductID;
var CompName = '';
$(function() {
	CompID = getQueryVariable('id') || '';
	alert(CompID);
	if(CompID === '') {
		JumpLoginPage();
		//window.location.href = 'http://h.my1818.com';
	}

	$('#allProduct').click(function() {
		window.location.href = 'product_list.html?t=' + Math.random() + '&id=' + CompID;
	});
	
	$('#mallIntrouduction').click(function() {
		window.location.href = 'mall_introduction.html?' + Math.random() + '&id=' + CompID + '&CompName=' + CompName;
	});
	
	$('#login').click(function(){
		JumpLoginPage();
	});

	//Get picture links to slider.
	var WXGetCompanyImg = JSON.stringify({
		CompID: CompID
	});
	var list = new Array();
	post('WXGetCompanyImg', WXGetCompanyImg, function(response) {
		if(response.Result === 'T') {
			CompName = response.CompName;
			$('#compName').text(CompName);
			if(response.ImgUrlList === null || response.ImgUrlList === '') {
				list.push('../images/pic.jpg')
			} else {
				$.each(response.ImgUrlList, function(index, value) {
					list.push(value);
				});
			}
			var str = '';
			$.each(list, function(index, value) {
				str += '<li><span style="background-image:url(' + value + ')"></span></li>'
			});
			$('.ui-slider-content').html(str);

			var slider = new fz.Scroll('.ui-slider', {
				role: 'slider',
				indicator: true,
				autoplay: true,
				interval: 3000
			});

			slider.on('beforeScrollStart', function(fromIndex, toIndex) {

			});

			slider.on('scrollEnd', function(cruPage) {

			});

		}

	});

	DataGoodsBind();

});

// 页面下拉事件
function LoadData() {
	getTypes = 1;
	var scrollTop = parseInt(document.body.scrollTop); //页面滚动的高度
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

function DataGoodsBind() {
	var WXGetProductList = JSON.stringify({
		CompID: CompID,
		CriticalProductID: $("#CriticalProductIDs").val(),
		GetType: '1',
		RowNum: '10'
	});

	post('WXGetProductList', WXGetProductList, function(response) {
		if(response.Result == "T" && response.Description == "获取成功") {
			$("#footer").hide(); //隐藏加载中
			$(window).bind("scroll", LoadData); //重新绑定下拉事件
			var strbig = "";
			// 遍历商品  追加到列表
			$.each(response.ProductList, function(n, value) {
				var imgurl = "../../images/pic.jpg";
				if(n == response.ProductList.length - 1)
					$("#CriticalProductIDs").val(value.ProductID) //记录当前列表最临界点订单ID

				if(value.ProductPicUrlList.length > 0)
					imgurl = value.ProductPicUrlList[0].PicUrl
				strbig += '<div class="li">' +
					'<a href="product_detail.html?random=' + Math.random() + "&GoodID=" + value.ProductID + "&CompID=" + CompID + '">' +
					'<div class="pic"><img  src="' + imgurl + '"></div>' +
					'<div class="title">' + value.ProductName + '</div>' +
					'</a>' +
					' </div>'
			});

			$("#goodsLiBig").append(strbig)
		} else if(response.Result == "T" && response.Description == "没有更多数据") {
			$("#footer").html("已经加载完毕");
		} else {
			$("#footer").children("span:eq(0)").hide().next().html("加载数据失败");
			setTimeout(function() {
				$("#footer").hide();
				setTimeout(function() {
					$(window).bind("scroll", LoadData);
				}, 15);
			}, 1500);
		}

	});
}