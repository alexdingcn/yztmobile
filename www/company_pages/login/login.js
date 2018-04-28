/**
 * 登陆
 * @author hxbnzy
 * @time 2017/7/21
 */
var verifyCode;
var isWxLogin = false;
var OpenID = '';

window.onload = function() {
    verifyCode = new GVerify("v_container");
    FastClick.attach(document.body);
    var backButtonPress = 0;

    $('#login').click(function() {
        $(this).text('正在登陆...');
        $(this).attr('disabled', true).addClass("weui-btn_disabled");

        var account = document.getElementById('account').value;
        var password = document.getElementById('password').value;
        var loginInfo = {
            LoginName: account,
            PassWord: password,
            AndroidKey: '',
            IOSKey: ''
        };
        login(loginInfo, function(response) {
            if (response.Result === "T") {
                // 展示角色列表
                //				showRoleList(response.UserList);
                // 默认选中第一个角色
                selectCallback(0, response.UserList)
            } else {
                weui.topTips(response.Description, {
                    duration: 3000,
                    className: "custom-classname",
                    callback: function() {

                    }
                });
            }
            $('#login').text('登 录');
            $('#login').attr('disabled', false).removeClass("weui-btn_disabled");
        });

    });
}

/** 展示角色列表 */
function showRoleList(userList) {
    var roleList = new Array();
    var i = 0;
    len = userList.length;

    var actionList = new Array();;
    for (; i < len;) {
        (function(i) {
            actions = {
                text: userList[i].CType === 1 ? userList[i].CompName + ' - 核心企业' : userList[i].CompName + ' - 经销商  ',
                onClick: function() {
                    selectCallback(i, userList);
                }
            }
        })(i);
        actionList.push(actions);
        i++;
    }

    $.actions({
        actions: actionList
    });
}

function selectCallback(position, userList) {
    //将登陆角色保存到本地
    localStorage.setItem('$login_role', JSON.stringify(userList[position]));
    var wx_OpenID = localStorage.getItem('$wx_openid')
    if (is_weixin()) {
        var EditOpenID = JSON.stringify({
            OpenID: wx_OpenID,
            CompUserID: userList[position].CompUserID,
        });
        post('EditOpenID', EditOpenID, function(response) {

        });

        if (userList[position].CType === 1) {
            window.location.href = '../home/home.html?t=' + Math.random();
        } else if (userList[position].CType === 2) {
            window.location.href = '../../reseller_pages/home/home.html?t=' + Math.random();
        } else {

        }

    } else {
        // 设置JPush 别名
        try {
            if (isDebug()) {
                if (userList[position].CType === 1) {
                    window.location.href = '../home/home.html?t=' + Math.random();
                } else if (userList[position].CType === 2) {
                    window.location.href = '../../reseller_pages/home/home.html?t=' + Math.random();
                } else {

                }
            } else {
                setAlias(md5(userList[position].CompUserID), function(response) {
                    if (response.Result === "T") {
                        console.log("别名设置成功------------" + response.Description.alias);
                    } else {
                        //极光推送别名设置失败
                        //目前不知道改做什么操作 😢
                        console.log("别名设置失败------------" + response.Description.code);
                    }
                    if (userList[position].CType === 1) {
                        window.location.href = '../home/home.html?t=' + Math.random();
                    } else if (userList[position].CType === 2) {
                        window.location.href = '../../reseller_pages/home/home.html?t=' + Math.random();
                    } else {

                    }
                });
            }

        } catch (e) {
            //TODO handle the exception
            console.log('------------出错啦------------');
            console.log(e)
        }
    }

}

/**
 * 获取本地登陆设置
 */
function getSettings() {
    var settingsText = localStorage.getItem('$settings') || "{}";
    return JSON.parse(settingsText);
}

/**
 * 设置本地自动登陆
 */
function Settings(settings) {
    settings = settings || {};
    localStorage.setItem('$settings', JSON.stringify(settings));
}

/**
 * 用户登陆
 */
function login(loginInfo, callback) {
    var obj = {
        Result: "",
        Description: ''
    };
    callback = callback || $.noop;
    var res = verifyCode.validate($('#code_input').val());
    loginInfo = loginInfo || {};
    if (loginInfo.LoginName.length < 1) {
        obj.Result = "F";
        obj.Description = '请输入登陆账号';
        return callback(obj);
    }

    if (loginInfo.PassWord.length < 1) {
        obj.Result = "F";
        obj.Description = '请输入登陆密码';
        return callback(obj);
    }

    if (!res) {
        obj.Result = "F";
        obj.Description = '验证码错误';
        return callback(obj);
    }
    var loginInfoObj = JSON.stringify(loginInfo);

    /** 请求登陆 */
    post('Login', loginInfoObj, function(response) {
        if (response.Result === "T") {
            //保存用户信息
            localStorage.setItem('$usersList', JSON.stringify(response.UserList));
        }
        callback(response);
    });

};
