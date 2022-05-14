/**
 * PlayWithMe_JS项目的JSONP版本
 * https://gitee.com/XL8Z/BiliBili_PlayWithMe_JS
 */
class BiliBili_PlayWithMe {
    constructor() {
        let URLParam = window.location.search.substring(1).split('&');
        URLParam.forEach(str => {
            let KAndV = str.split('=');
            if (KAndV.length == 2) {
                switch (KAndV[0].toUpperCase()) {
                    case "ACSKEY":
                        BiliBili_PlayWithMe.Authorizer.DeveloperAccessKey = KAndV[1];
                        console.log("捕获到网址参数DeveloperAccessKey" + KAndV[1]);
                        break;
                    case "ACSECRET":
                        BiliBili_PlayWithMe.Authorizer.DeveloperAccessSecret = KAndV[1];
                        console.log("捕获到网址参数DeveloperAccessSecret" + KAndV[1]);
                        break;
                    case "ROOMID":
                        BiliBili_PlayWithMe.LiveRoomID = KAndV[1];
                        console.log("捕获到网址参数LiveRoomID" + KAndV[1]);
                        break;
                    case "MID":
                        BiliBili_PlayWithMe.MID = KAndV[1];
                        console.log("捕获到网址参数MID" + KAndV[1]);
                        break;
                    case "TIMESTAMP":
                        BiliBili_PlayWithMe.Param_Timestamp = KAndV[1];
                        console.log("捕获到网址参数Param_Timestamp" + KAndV[1]);
                        break;
                    case "SIGN":
                        BiliBili_PlayWithMe.Param_Sign = KAndV[1];
                        console.log("捕获到网址参数Sign" + KAndV[1]);
                        break;
                }
            }
        })
    }

    static WS = null;
    static AppID = 0;
    static LiveRoomID = 0;
    static MID = 0;

    /**
     * 探测当前插件运行环境，是否为直播姬
     * @returns Boolean值的判定结果
     */
    static is_LiveHime() { return window.location.href.includes("livehime_ts") };

    /**
     * 探测当前插件运行环境，是否为OBS
     * @returns Boolean值的判定结果
     */
    static is_OBS() { return navigator.userAgent.includes("OBS") };


    PrepareWEBSocketConnection_WithRemoteAuthorizerServer_UseJSONP() {
        let ElmtsStr = '<script id="scpt_BiliBili_PlayWithMe_JSONP" src="http://localhost:9000/BiliFanFan/BiLiveChat/Proxy/PlgnSrtAndWEBSocket?RoomID=' + BiliBili_PlayWithMe.LiveRoomID.toString() + '" type="text/javascript"></script>';
        let Elmts = document.createElement('script');
        Elmts.src = "http://BiLive.XL7Z.net/BiliFanFan/BiLiveChat/Proxy/PlgnSrtAndWEBSocket?RoomID=" + BiliBili_PlayWithMe.LiveRoomID.toString();

        document.body.appendChild(Elmts);

        Elmts.onload = (evt) => {
            BiliBili_PlayWithMe.NewSystemNotice(BiLiveChat_RemoteAuthorizerResponse.Msg)
            if (BiLiveChat_RemoteAuthorizerResponse.Code == 200)
                this.WS = new BiliBili_WEBSocket(BiLiveChat_RemoteAuthorizerResponse.WSData.data.auth_body);
            evt.currentTarget.remove();
        }

        Elmts.onerror = (evt) => {
            BiliBili_PlayWithMe.NewSystemNotice("代签授权失败，请联系Q群 248810727 https://jq.qq.com/?_wv=1027&k=UTn3mvTF")
            evt.currentTarget.remove();
        }
    }

    static NewSystemNotice(Str) {
        let T = new Date();
        BiliBili_PlayWithMe.NewDanmaku({
            "fans_medal_level": 21,
            "fans_medal_name": "官方",
            "fans_medal_wearing_status": true,
            "guard_level": 2,
            "msg": Str,
            "timestamp": T.getTime() / 1000,
            "time": (T.getHours() > 9 ? T.getHours() : '0' + T.getHours()) + ':' + (T.getMinutes() > 9 ? T.getMinutes() : '0' + T.getMinutes()),
            "uid": 3102384,
            "uname": "猫裙少年泽远喵",
            "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
            "room_id": 4639581
        });
    }

    static NewDanmaku() {

    }

    static NewGifts() {

    }

    static NewGuard() {

    }

    static NewSC() {

    }

    static SCDel() {

    }

    /**
     * 
     */
    static Authorizer = {
        /**
         * 签名器类型
         * - "Local"：从本地寻找开发者AccessKey和AccessSecret
         * - 可以写在这里，也可以自动从页面请求参数中获取
         * - "Remote"：将签名流程委托给在线服务器
         * - 代签服务器端参照RemoteAuthorizer
         */
        Type: "",
        /**
         * 开发者AccessKey，必填
         */
        DeveloperAccessKey: "",
        /**
         * 开发者AccessSecret，使用在线服务器代签不用填
         */
        DeveloperAccessSecret: "",
        /**
         * 代签服务器接口地址，使用本地自签不用填
         */
        RemoteAuthorizerServer: ""
    }

}

/**
 * 
 */
class BiliBili_WEBSocket extends WebSocket {

    Reader = null;

    constructor(LoginAuthStr, Parent) {
        super("ws://broadcastlv.chat.bilibili.com:2244/sub")
        this.onopen = evt => {
            this.Login(LoginAuthStr);
            // 握手完毕后，先丢一个心跳包过去探路
            // 【你懂什么，这也是握手的一部分.gif】
            this.Heartbeat();
            // 设置自动定时发送心跳包
            setInterval(() => {
                this.Heartbeat();
                // 定时发送循环延迟，单位毫秒【20000=20秒】
            }, 20000);
        }


        // 收到消息回调
        this.onmessage = (evt) => {
            // 通过FileReader读出数据
            this.Reader = new FileReader();
            // 预先设定好，当数据读出后，送往NewMessage方法进行处理
            this.Reader.onloadend = (evt) => this.NewMessage(evt.currentTarget.result);
            // 命令FileReader开始读出
            this.Reader.readAsArrayBuffer(evt.data);
        }

        this.onclose = (evt) => {
            Parent.PrepareWEBSocketConnection_WithRemoteAuthorizerServer_UseJSONP()
        }
    }

    /**
     * 
     * @param {*} LoginAuthStr 
     */
    Login(LoginAuthStr) {
        let Body = UtilTools.Str2Uint8Array(LoginAuthStr)
        let PackageLength = Body.length + 16;
        console.log("预计的包长度：" + PackageLength);
        let Data = new Array(0);
        // 放入包头
        Data.push.apply(Data, [
            // 【Packet Length】包长字节数(Byte)【每隔字节8个位(Bit)，即数组里的一个UInt8】
            // 【注意是包头(Header)+包身(Body)的整个数据长度】
            0, 0, (PackageLength > 255 ? 1 : 0), (PackageLength % 255),
            // 【Header Length】数据包包头长度16字节(Byte)【16个8位(Bit)】
            0, 16,
            // 【Version】协议版本0，无加密
            0, 0,
            // 【Operation】操作类型，7为OP_AUTH，登录握手包
            0, 0, 0, 7,
            // 【Sequence ID】保留字段，很多人都写1，我就跟着瞎写了
            0, 0, 0, 0
        ]);
        // 放入包身
        Data.push.apply(Data, Body);
        // 统一转换为Uint8Array
        Data = new Uint8Array(Data);

        console.log("[开放平台长链接]：准备发送握手包，内容为\n" + UtilTools.Uint8Array2HexStr(Data));
        // 调用原WEBSocket的发送方法发送握手包
        super.send(Data);
    }


    /**
     * 发送一个心跳包
     * - 必须每隔30秒发送一个，不然会被服务器认为客户端已经故障或关闭，切断连接
     */
    Heartbeat() {
        // 固定写死的心跳包
        let HeartbeatData = new Uint8Array([
            // 【Packet Length】包长18字节(Byte)【18个8位(Bit)】
            0, 0, 0, 18,
            // 【Header Length】数据包包头长度16字节(Byte)【16个8位(Bit)】
            0, 16,
            // 【Version】协议版本1，无加密【虽然文档里要求写0，但是正常是写1】
            0, 1,
            // 【Operation】操作类型，2为OP_HEARTBEAT，客户端心跳，KeepAlive包
            0, 0, 0, 2,
            // 【Sequence ID】保留字段，很多人都写1，我就跟着瞎写了
            0, 0, 0, 1,
            // 【Body】实际内容，其实是“{}”，无意义
            0x7b, 0x7d
        ]);
        console.log("[开放平台长链接]发送心跳包喵【￣^￣】");
        // 调用原WEBSocket的发送方法发送心跳包
        super.send(HeartbeatData);
    }

    /**
     * 
     * @param {*} Data 
     */
    NewMessage(Data) {
        let Uint8Ary = new Uint8Array(Data);
        console.log("[开放平台长链接]收到服务器的消息，内容为\n" + UtilTools.Uint8Array2HexStr(Uint8Ary));
        if (Data[7] == 2) {
            // TODO 需要Zlib解压的大包，还没做
        } else switch (Uint8Ary[11]) {
            case 3:
                console.log("[开放平台长链接]解析到服务器回复的心跳包");
                break;
            case 5:
                // 删掉头部后UTF8解码二进制内容
                let JSONStr = decodeUtf8(Data.slice(16)).trim();
                console.log("[开放平台长链接]解析到服务器的新消息\n" + JSONStr);
                let JSONObj = JSON.parse(JSONStr);
                let DateTime = "";
                if (typeof(JSONObj.data.timestamp) == Number)
                    DateTime = UtilTools.Timestamp2DateObj(JSONObj.data.timestamp);
                else {
                    DateTime = new Date();
                    JSONObj.data.timestamp = DateTime.getTime / 1000;
                }
                JSONObj.data.time = (DateTime.getHours() > 9 ? DateTime.getHours() : '0' + DateTime.getHours()) + ':' + (DateTime.getMinutes() > 9 ? DateTime.getMinutes() : '0' + DateTime.getMinutes());
                switch (JSONObj.cmd) {
                    case "LIVE_OPEN_PLATFORM_DM":
                        // 当标识为 LIVE_OPEN_PLATFORM_DM
                        // 将 JSON 里的 data 传给 BiliBili_PlayWithMe.NewDanmaku() 方法
                        if (JSONObj.data.msg != "老板大气！点点红包抽礼物！") {
                            BiliBili_PlayWithMe.NewDanmaku(JSONObj.data);
                        }
                        break;
                    case "LIVE_OPEN_PLATFORM_SEND_GIFT":
                        // 当标识为 LIVE_OPEN_PLATFORM_SEND_GIFT
                        // 将 JSON 里的 data 传给 BiliBili_PlayWithMe.NewGifts() 方法
                        BiliBili_PlayWithMe.NewGifts(JSONObj.data);
                        break;
                    case "LIVE_OPEN_PLATFORM_GUARD":
                        // 当标识为 LIVE_OPEN_PLATFORM_GUARD
                        // 将 JSON 里的 data 传给 BiliBili_PlayWithMe.NewGuard() 方法
                        switch (JSONObj.data.guard_level) {
                            case 3:
                                JSONObj.data.guard_name = "总督"
                                break;
                            case 2:
                                JSONObj.data.guard_name = "提督"
                                break;
                            case 1:
                                JSONObj.data.guard_name = "舰长"
                                break;
                        }
                        BiliBili_PlayWithMe.NewGuard(JSONObj.data);
                        break;
                    case "LIVE_OPEN_PLATFORM_SUPER_CHAT":
                        // 当标识为 LIVE_OPEN_PLATFORM_SUPER_CHAT
                        // 将 JSON 里的 data 传给 BiliBili_PlayWithMe.NewSC() 方法
                        BiliBili_PlayWithMe.NewSC(JSONObj.data);
                        break;
                    case "LIVE_OPEN_PLATFORM_SUPER_CHAT_DEL":
                        // 当标识为 LIVE_OPEN_PLATFORM_SUPER_CHAT_DEL
                        // 将 JSON 里的 data 传给 BiliBili_PlayWithMe.SCDel() 方法
                        BiliBili_PlayWithMe.SCDel(JSONObj.data);
                        break;
                }
                window.document.getElementById('div_BiLiveChatOutputer').scrollTop = 999999;
                break;
            case 8:
                BiliBili_PlayWithMe.NewSystemNotice("连上了喵！")
                console.log("[开放平台长链接]解析到服务器的登陆回复");
                break;
            default:

                break;
        }
    }
}



/**
 * 静态工具类
 */
class UtilTools {

    /**
     * 转换Uint8Array为HEX字符串
     * @param {Uint8Array} Uint8Array 二进制数组
     * @returns 十六进制小写字符串
     */
    static Uint8Array2HexStr(Uint8Array) {
        return Array.prototype.map.call(Uint8Array, (x) => ('00' + x.toString(16)).slice(-2)).join(' ');
    }

    /**
     * 
     * @param {String} Str 字符串
     * @returns UTF-8编码下的原始数据Uint8Array2Str
     */
    static Str2Uint8Array(Str) {
        var arr = [];
        for (var i = 0, j = Str.length; i < j; ++i)
            arr.push(Str.charCodeAt(i));
        return new Uint8Array(arr);
    }

    /**
     * 
     * @param {Int} Timestamp 秒级时间戳
     * @returns 返回 JavaScript 的 Date 对象
     */
    static Timestamp2DateObj(Timestamp) {
        return new Date(Timestamp * 1000);
    }

    /**
     * 
     * @param {Int} Timestamp 秒级时间戳
     * @returns 返回 JavaScript 的 Date.toLocaleString()
     */
    static Timestamp2DateStr(Timestamp) {
        return UtilTools.Timestamp2DateObj(Timestamp).toLocaleString();
    }
}