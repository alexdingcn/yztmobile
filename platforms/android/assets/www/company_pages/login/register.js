function addHint(inputObj, valid, addIcon) {
    if (!valid) {
        inputObj.addClass("weui-cell_warn");
        if (addIcon) {
            inputObj.find(".weui-cell__ft").html("<i class=\"weui-icon-warn\"></i>");
        }
    } else {
        inputObj.removeClass("weui-cell_warn");
        if (addIcon) {
            inputObj.find(".weui-cell__ft").html("");
        }
    }
}
$(function(){

    FastClick.attach(document.body);
    $(".contract").click(function() {
        window.location.href = "contract.html";
    })

    var timerCount = 60;

    $(".weui-vcode-btn").click(function() {
        var phone = $('input[name=phone]').val();
        if (!phone || (!(/^1\d{10}$/.test(phone)))) {
            addHint($(".weui-cell.phone"), false);
        } else {
            addHint($(".weui-cell.phone"), true);
            var phoneInfo = JSON.stringify({
                PhoneNumb: phone,
                Type: '2',
                AndroidKey: '',
                IOSKey: ''
            });

            codeTimes = setInterval(function() { 
                if(timerCount<=0){
                    clearInterval(codeTimes);
                    $('.weui-vcode-btn').html("获取验证码").attr("disabled",false);
                    $('input#btn1');
                }else{
                    timerCount--;
                    val=timerCount+'s';
                    $('.weui-vcode-btn').html(val).attr("disabled",true);
                }
            },1000);

            post('GetCaptcha', phoneInfo, function(response) {
                console.log(response);
                if (response.Result === 'F') {
                    $("#msgDialog .weui-dialog__bd").html(response.Description);
                    $("#msgDialog").show();
                } else {
                    $("#sendId").val(response.SendId);
                }
            });
        }
    })

    $('input[name=type]').on('click',function(){
        $('input[name=type]').attr('checked',false);
        $(this).attr('checked',true);
    });

    $('.weui-cell').on('click', function() {
        addHint($(this), true);
    })

    $('.weui-dialog__btn_primary').on('click', function() {
        $('#msgDialog').hide();
    })

    $("#weuiAgree").click(function() {
        var checked = $(this).prop('checked');
        if (checked) {
            $('.submit-btn').removeClass("weui-btn_disabled").prop("disabled",false);
        } else {
            $('.submit-btn').addClass("weui-btn_disabled").prop("disabled",true);
        }
        
    });

    $(".submit-btn").click(function() {
        var valid = true;

        var company = $('input[name=company]').val();
        if (!company) {
            addHint($(".weui-cell.company"), false, true);
            valid = false;
        } else {
            addHint($(".weui-cell.company"), true, true);
        }

        var phone = $('input[name=phone]').val();
        if (!phone || (!(/^1\d{10}$/.test(phone)))) {
            addHint($(".weui-cell.phone"), false);
            valid = false;
        } else {
            addHint($(".weui-cell.phone"), true);
        }

        var verifycode = $('input[name=verifycode]').val();
        if (!verifycode) {
            addHint($(".weui-cell.verifycode"), false);
            valid = false;
        } else {
            addHint($(".weui-cell.verifycode"), true);
        }
        var password = $('input[name=password]').val();
        if (!password) {
            addHint($(".weui-cell.password"), false);
            valid = false;
        } else {
            addHint($(".weui-cell.password"), true);
        }

        if (valid) {
            var regInfo = JSON.stringify({
                CompanyName: company,
                PhoneNumb: phone,
                LoginName: phone,
                SendId: $("#sendId").val(),
                PassWord: password,
                Captcha: verifycode,
                Type: $('input[name=type]:checked').val(),
                AndroidKey: '',
                IOSKey: ''
            });

            post('SendEnterRequest', regInfo, function(response) {
                console.log(response);
                if (response.Result === "T") {
                    window.location.href = "./login.html";
                } else {
                    $("#msgDialog .weui-dialog__bd").html(response.Description);
                    $("#msgDialog").show();
                }
                
            });
        }
        

    });
})


