

var viewModel = {
    userAddress: "",
    dappAddress: "n21hEQpgAHBVJv6M53pWdGzev8uc7sizha6",
    nebulasUrl:"https://mainnet.nebulas.io",
    // nebulasUrl:"https://testnet.nebulas.io",
    neb: null,
    Account: null,
    Uint:null,
    intervalQuery: null,
    isshowloading: false,
    counter: 0,
    nebPay: null,
    page: 0,
    serialNumber: null,
    isInstallwebExtensionWallet:false

};

Date.prototype.Format = function (fmt) { //author: meizz   
    var o = {
        "M+": this.getMonth() + 1, //月份   
        "d+": this.getDate(), //日   
        "h+": this.getHours(), //小时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
}


function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";path=/;expires=" + exp.toGMTString();
}

function Loading(isshow) {


    if (isshow) {
        if (!viewModel.isshowloading) {
            viewModel.isshowloading = isshow;
            $('#loadingModal').modal({
                backdrop: 'static',
                keyboard: false
            });
        }


    } else {
        $("#loadingModal").modal('hide');
        viewModel.isshowloading = isshow;
    }
}

function Init() {
    if (typeof (webExtensionWallet) === "undefined") {
        $("#noExtension").show();
        $.alert_plugin.alert({
            message: "请使用谷歌浏览器，并点击页面右上角的连接下载星云钱包插件！"
        });
    }
    else
    {
        viewModel.isInstallwebExtensionWallet=true;
    }
    
    var nebulas = require("nebulas");
    Unit = require("nebulas").Unit;
    viewModel.Account = nebulas.Account;
    viewModel.neb = new nebulas.Neb();
    viewModel.neb.setRequest(new nebulas.HttpRequest(viewModel.nebulasUrl));

    var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
    viewModel.nebPay = new NebPay();

    var add = getCookie("userAddress");
    // var add = "n1FF1nz6tarkDVwWQkMnnwFPuPKUaQTdptE";
    if (add) {
        viewModel.userAddress = add;
        LoginSet(add);
    } else {
        LoginOutSet();
    }

    if (viewModel.page  <2) {
        GetALL();
    } else {
       
        GetmyDonations();
    }




}

function LoginSet(add) {
    $("#address").val("");
    $("#btn_login,#address_panel").hide();
    $("#userInfo,#addRaise").show();
    $("#uaerAddress").html(add);
    viewModel.userAddress = add;
    setCookie("userAddress", add);
}

function LoginOutSet() {
    delCookie("userAddress");
    if (viewModel.page != 0) {
        window.location.href = "index.html";
    } else {
        $("#btn_login,#address_panel").show();
        $("#userInfo,#addRaise").hide();
        $("#uaerAddress").html("");
        viewModel.userAddress = viewModel.Account.NewAccount().getAddressString();
    }



}

function GetALL() {

    var from = viewModel.userAddress;
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"

    var callFunction = "getAll"; 
    var callArgs = '["0","9999"]';
    var contract = {
        "function": callFunction,   
        "args": callArgs
    }

    $("#allDataPanel").show().siblings().hide();
    Loading(true);
    
    viewModel.neb.api.call(from, viewModel.dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        GetallCallback(resp);
    }).catch(function (err) {
        Loading(false);
        $.alert_plugin.alert({
            message: err.message
        });

        console.log("error:" + err.message);
    });
}

function GetallCallback(resp) {
    var result = resp.result; ////resp is an object, resp.result is a JSON string
    $("#content").val(JSON.stringify(result));
    var list = JSON.parse(result);
    Loading(false);
    if (typeof list === "object") {
        var length = list.length;
        if (length === 0) {
            $("#isNotdate").show();
            $("#allDataPanel_data").empty();
            return;
        }
        list.sort(function (a, b) {
            return new Date(b.time) - new Date(a.time);

        });
        var html = "";
        for (var i = 0; i < length; i++) {
            html += GetAllDataHtml(list[i]);
        }
        $("#isNotdate").hide();
        $("#allDataPanel_data").html(html);
    }

}

function GetmyDonations() {
    var from = viewModel.userAddress;
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "myDonations";
    var callArgs = ""; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    $("#allDataPanel").show().siblings().hide();
    Loading(true);
    viewModel.neb.api.call(from, viewModel.dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        GetmyDonationsCallback(resp);
    }).catch(function (err) {
        Loading(false);
        $.alert_plugin.alert({
            message: err.message
        });

        console.log("error:" + err.message);
    });
}

function GetmyDonationsCallback(resp) {
    var result = resp.result;
    $("#content").val(JSON.stringify(result));
    var data = JSON.parse(result);
    Loading(false);
    if (typeof data === "object") {
        $(".donationsCount").html(data.amountCount / Math.pow(10, 18));
        var list = data.list;
        var length = list.length;
        if (length === 0) {
            $("#isNotdate").show();
            $("#allDataPanel_data").empty();
            return;
        }
        list.sort(function (a, b) {
            return new Date(b.time) - new Date(a.time);

        });
        var html = "";
        for (var i = 0; i < length; i++) {
            html += GetmyDonationsCallbackHtml(list[i]);
        }
        $("#isNotdate").hide();
        $("#allDataPanel_data").html(html);
    }

}

function takeoutCallback(resp) {
    var result = resp.result;
    var model = JSON.parse(result);
    console.log(resp);
    Loading(false);
}

function verifyAddressCallback(resp, add) {
    var result = resp.result;
    var model = JSON.parse(result);
    if (typeof model === "object") {
        if (model.valid) {
            LoginSet(add);
        } else {
            $.alert_plugin.alert({
                message: "钱包地址不是一个有效的地址，请检查！"
            });
        }
    } else {
        $.alert_plugin.alert({
            message: result
        });
    }
    Loading(false);
}


function GetmyDonationsCallbackHtml(model) {
    var html = '<div class="col-xs-12 col-md-4 col-sm-6"><div class="panel panel-default "><div class="panel-body"><div><span class="title">{title}</span><span>发起人：<span style="color: #bbb6b6">{add}</span></span><p>捐助时间：<span class="data_time">{time}</span></p><p><span style="margin-right: 20px">捐助金额：<span class="amountCount">{amount}</span> NAS</span></p></div></div></div></div>';
    html = html.replace("{title}", model.title).replace("{amount}", model.amount / Math.pow(10, 18)).replace("{add}", model.to).replace("{time}", new Date(model.time).Format("yyyy年MM月dd日 hh:mm:ss"));

    return html;
}
//

function showBalanceOf(addr){
    viewModel.neb.api.getAccountState(addr).then(function (resp) {
        var balance = Unit.fromBasic(resp.balance, "nas");
        console.log(addr)
        if(balance<new BigNumber()){
            return "";
        }
        console.log(balance)
        return balance;
   })
}

function GetAllDataHtml(model) {
    // var balance = showBalanceOf(model.key)
    var html = '<div class="panel panel-default"><div class="panel-body {complete}" data-id="{id}" ><img src="img/maimai.jpeg" class="rounded mx-auto d-block alldataImage" alt=""><div style="padding-left: 60px"><span class="title">{title}</span><p>职位描述：{desc}</p><p>地 点：<span class="">{city}</span></p>薪 资:<span class="">{salary}</span></p></span><span>学 历:<span class="">{education}</span></span></p><div ><span style="float: left;" class="data_addtitle">招聘人地址：<span style="color: #bbb6b6" class="data_add"><a href="https://explorer.nebulas.io/#/address/{key}" target="_blank">{key1}</a></span></span><span style="float: right;">{raise}<span class="showDetail" style="color:#00b38a" aria-hidden="true">应聘者 {showdetail}</span></span></div><div style="clear: both;"></div></div>{detail}</div></div>';
    html = html.replace("{id}", model.id).replace("{desc}", model.desc).replace("{title}", model.title).replace("{education}", model.education).replace("{salary}", model.salary ).replace("{key}", model.key).replace("{key1}", model.key).replace("{city}", model.city);
    var raise = '<span class="glyphicon glyphicon-share donations" aria-hidden="true" data-title="'+model.title+'" data-add="' + model.key + '">投个简历</span>';
    if (model.resumeJob.length > 0) {
        html = html.replace("{showdetail}", '<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>');
        model.resumeJob.sort(function (a, b) {
            return b.count - a.count;
        });
        if (model.resumeJob) {
            var detailHtml = "";
            var length=model.resumeJob.length;
            
            for (var i = 0; i < length; i++) {
                
                detailHtml += GetDetailHtml(model.resumeJob[i],model.id);
            }
            html=html.replace("{detail}", detailHtml);
        }
     }
     else
     {
        html = html.replace("{showdetail}", "").replace("{detail}", "")
     }

    if (viewModel.page === 1) {
        raise = '<span class="glyphicon glyphicon-yen collection" aria-hidden="true">收款</span>';
    }
    if (model.status > 0) {
        html = html.replace("{complete}", "isComplete");
    } else {
        html = html.replace("{complete}", "");
    }

    if (model.status === 1) {
        if (viewModel.page === 0) {
            raise = '<span class="" aria-hidden="true">岗位已完成</span>';
        }

    } else if (model.status === 2) {
        raise = '<span class="" aria-hidden="true">已收款</span>';
    }
    html = html.replace("{raise}", raise);
    return html;


}


function GetDetailHtml(model,id) {
    
    var detailHtml = '<div style="display:none" class="detail_data_{id}"><div style="padding: 5px;border:1px solid #f7f7f7;border-radius:4px;margin-top:5px;"><p>岗位：{title}</p><div><span style="float: left;" class="data_addtitle">应聘人地址：<span style="color: #bbb6b6" class="data_add"><a href="https://explorer.nebulas.io/#/address/{fromAdd}" target="_blank">{fromAdd1}</a></span></span><span style="float: right;"><span style="margin-right: 20px">聘金：<span class="amountCount">{count}</span> NAS</span></span></div><div style="clear: both;"></div></div></div>';
    detailHtml = detailHtml.replace("{id}",id).replace("{title}", model.title).replace("{count}", model.count).replace("{fromAdd}", model.fromAdd).replace("{fromAdd1}",model.fromAdd);

    return detailHtml;
}


function funcIntervalQuery(callback) {
    viewModel.nebPay.queryPayInfo(viewModel.serialNumber) //search transaction result from server (result upload to server by app)
        .then(function (resp) {

            var respObject = JSON.parse(resp)
            if (respObject.code === 0) {
                viewModel.counter = 0;
                clearInterval(viewModel.intervalQuery);
                callback();
            } else {
                if (viewModel.counter >= 3) {
                    // $.alert_plugin.alert({
                    //     message: "暂时无法查询到记录，请等下一会刷新查看！"
                    // });
                    callback();
                    clearInterval(viewModel.intervalQuery);
                    viewModel.counter = 0;
                }

                viewModel.counter++;
            }


        })
        .catch(function (err) {
            $.alert_plugin.alert({
                message: err
            });
        });
}

function addDonationslistener(resp) {

    console.log("response of push: " + JSON.stringify(resp));
    if (resp.txhash) {
        $.alert_plugin.alert({
            message: "您的捐助已经发送都链上，请稍后刷新页面查看！"
        });
        viewModel.intervalQuery = setInterval(function () {
            funcIntervalQuery(GetALL);
        }, 5000);
    }

}

function collectionlistener(resp) {

    console.log("response of push: " + JSON.stringify(resp));
    if (resp.txhash) {
        $.alert_plugin.alert({
            message: "您的收款已经发送都链上，请稍后刷新页面查看！"
        });
        viewModel.intervalQuery = setInterval(function () {
            funcIntervalQuery(GetALL);
        }, 5000);
    }

}

function addlistener(resp) {

    console.log("response of push: " + JSON.stringify(resp));
    if (resp.txhash) {
        $.alert_plugin.alert({
            message: "岗位已经发送都链上，请稍后刷新页面查看！"
        });
        viewModel.intervalQuery = setInterval(function () {
            funcIntervalQuery(GetALL);
        }, 5000);
    }

}

$(function () {


    $(document).on("click", ".showDetail", function () {
        var $this = $(this).find(".glyphicon");
        var id = $(this).parents(".panel-body").data("id");
        if ($this && $this.length > 0) {
            if ($this.hasClass("glyphicon-triangle-top")) {
                $(".detail_data_"+id).hide();
                $this.removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
            }
            else {
                $(".detail_data_"+id).show();
                $this.addClass("glyphicon-triangle-top").removeClass("glyphicon-triangle-bottom");
            }
        }

    });

    $(document).on("click", "#btn_addDonations_cancel,#btn_cancel", function () {
        if(!viewModel.isInstallwebExtensionWallet)
        {
            $.alert_plugin.alert({
                message: "您没有安装星云钱包插件，请点击页面右上角的连接下载星云钱包插件！"
            });
            return;
        }
        $("#allDataPanel").show().siblings().hide();
    });
    $(".myRaise").click(function () {
        window.location.href = "user.html";
    });
    $(".mydonations").click(function () {
        window.location.href = "mydonations.html";
    });
    $(document).on("click", ".donations", function () {
        if(!viewModel.isInstallwebExtensionWallet)
        {
            $.alert_plugin.alert({
                message: "您没有安装星云钱包插件，请点击页面右上角的连接下载星云钱包插件！"
            });
            return;
        }
        var add = $(this).data("add");
        var title = $(this).data("title")
        var id = $(this).parents(".panel-body").data("id");
        $("#addDonations_address").val(add);
        $("#addDonations_title").val(title);

        $("#addDonations_id").val(id);

        $("#addDonations").show().siblings().hide();
    });
    $("#btn_addDonations_submit").click(function () {
        if(!viewModel.isInstallwebExtensionWallet)
        {
            $.alert_plugin.alert({
                message: "您没有安装星云钱包插件，请点击页面右上角的连接下载星云钱包插件！"
            });
            return;
        }
        var to = viewModel.dappAddress;
        var id = $("#addDonations_id").val();
        var toAdd = $("#addDonations_address").val();
        var title = $("#addDonations_title").val();
        var count = $("#addDonations_raiseCount").val();

        if ((id === undefined && id != 0) || id.length == 0) {
            $("#addDonations_addError").show().html("提交信息不正确请联系管理员！");
            return;
        }

        if (toAdd === "") {
            $("#addDonations_addError").show().html("地址不对！");
            $("#addDonations_address").focus();
            return;
        }
        var c = parseFloat(count);
        if (c < 0.00001) {
            $("#addDonations_addError").show().html("请填写金额！最小必须0.00001 NAS");
            $("#addDonations_raiseCount").val("0").focus();
            return;
        }
        $("#addDonations_addError").hide().html("");
        var callFunction = "resumeJob";
        var callArgs =  JSON.stringify([id,title,toAdd,count]);
        Loading(true);
        $("#addDonations_id").val("");
        viewModel.serialNumber = viewModel.nebPay.call(to, count, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
            listener: addDonationslistener //设置listener, 处理交易返回信息
        });



    });
    $(document).on("click", ".collection", function () {
        if(!viewModel.isInstallwebExtensionWallet)
        {
            $.alert_plugin.alert({
                message: "您没有安装星云钱包插件，请点击页面右上角的连接下载星云钱包插件！"
            });
            return;
        }
        var id = $(this).parents(".panel-body").data("id");
        var to = viewModel.dappAddress;
        if ((id === undefined && id != 0) || id.length == 0) {
            $.alert_plugin.alert({
                message: "提交信息不正确请联系管理员！"
            });
            return;
        }
        var callFunction = "takeout";
        var callArgs = "[\"" + id + "\"]";
        Loading(true);

        viewModel.serialNumber = viewModel.nebPay.call(to, "0", callFunction, callArgs, { //使用nebpay的call接口去调用合约,
            listener: collectionlistener //设置listener, 处理交易返回信息
        });


    });
    $("#btn_login").click(function () {
        var add = $("#address").val().trim();
        if (add == "") {
            $.alert_plugin.alert({
                message: "请填写正确的钱包地址！"
            });
            return;
        }

        var from = viewModel.userAddress;
        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "verifyAddress";
        var callArgs = "[\"" + add + "\"]";
        var contract = {
            "function": callFunction,
            "args": callArgs
        }
        Loading(true);
        viewModel.neb.api.call(from, viewModel.dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
            verifyAddressCallback(resp, add);
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message);
            $.alert_plugin.alert({
                message: err.message
            });
        });

    });
    $("#btn_loginout").click(function () {
        LoginOutSet();
    });
    window.addEventListener('message', function (e) {
        //alert(e);

        console.log("message:" + e);
    });
    $("#addRaise").click(function () {
        if(!viewModel.isInstallwebExtensionWallet)
        {
            $.alert_plugin.alert({
                message: "您没有安装星云钱包插件，请点击页面右上角的连接下载星云钱包插件！"
            });
            return;
        }
        $("#addPanel").show().siblings().hide();


    });
    $("#btn_submit").click(function () {
        if(!viewModel.isInstallwebExtensionWallet)
        {
            $.alert_plugin.alert({
                message: "您没有安装星云钱包插件，请点击页面右上角的连接下载星云钱包插件！"
            });
            return;
        }
        var to = viewModel.dappAddress;
        var value = "0";

        var title = $("#title").val();
        var desc = $("#desc").val();

        if (title === "") {
            $("#addError").show().html("请填写招聘职位！");
            $("#title").focus();
            return;
        }
        if (desc === "") {
            $("#addError").show().html("请填写职位描述！");
            $("#desc").focus();
            return;
        }
        $("#addError").hide().html("");
        var callFunction = "save";

        var city = $('#city').selectpicker('val');
        var education = $('#education').selectpicker('val');
        var salary = $('#salary').selectpicker('val');
        var key =viewModel.userAddress;
        
        // var callArgs =  [title,desc,city,education,salary,key];
        // var callArgs = "[\"" + title + "\",\"" + desc + "\",\"" + city+ "\",\"" + education+ "\",\"" +salary+ "\",\"" +key+ "\"]";
        var callArgs = JSON.stringify([title,desc,city,education,salary,key]);
        Loading(true);
        viewModel.serialNumber = viewModel.nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
            listener: addlistener //设置listener, 处理交易返回信息
        });


    });





});


! function () {
    function n(n, e, t) { return n.getAttribute(e) || t }

    function e(n) { return document.getElementsByTagName(n) }

    function t() {
        var t = e("script"),
            o = t.length,
            i = t[o - 1];
        return { l: o, z: n(i, "zIndex", -1), o: n(i, "opacity", .8), c: n(i, "color", "61,223,224"), n: n(i, "count", 180) }
    }

    function o() { a = m.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, c = m.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight }

    function i() {
        r.clearRect(0, 0, a, c);
        var n, e, t, o, m, l;
        s.forEach(function (i, x) { for (i.x += i.xa, i.y += i.ya, i.xa *= i.x > a || i.x < 0 ? -1 : 1, i.ya *= i.y > c || i.y < 0 ? -1 : 1, r.fillRect(i.x - .5, i.y - .5, 1, 1), e = x + 1; e < u.length; e++) n = u[e], null !== n.x && null !== n.y && (o = i.x - n.x, m = i.y - n.y, l = o * o + m * m, l < n.max && (n === y && l >= n.max / 2 && (i.x -= .03 * o, i.y -= .03 * m), t = (n.max - l) / n.max, r.beginPath(), r.lineWidth = t / 2, r.strokeStyle = "rgba(" + d.c + "," + (t + .2) + ")", r.moveTo(i.x, i.y), r.lineTo(n.x, n.y), r.stroke())) }), x(i)
    }
    var a, c, u, m = document.createElement("canvas"),
        d = t(),
        l = "c_n" + d.l,
        r = m.getContext("2d"),
        x = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (n) { window.setTimeout(n, 1e3 / 45) },
        w = Math.random,
        y = { x: null, y: null, max: 2e4 };
    m.id = l, m.style.cssText = "position:fixed;top:0;left:0;z-index:" + d.z + ";opacity:" + d.o, e("body")[0].appendChild(m), o(), window.onresize = o, window.onmousemove = function (n) { n = n || window.event, y.x = n.clientX, y.y = n.clientY }, window.onmouseout = function () { y.x = null, y.y = null };
    for (var s = [], f = 0; d.n > f; f++) {
        var h = w() * a,
            g = w() * c,
            v = 2 * w() - 1,
            p = 2 * w() - 1;
        s.push({ x: h, y: g, xa: v, ya: p, max: 6e3 })
    }
    u = s.concat([y]), setTimeout(function () { i() }, 100)
}();