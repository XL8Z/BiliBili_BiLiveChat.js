/**
 * PlayWithMe_JS项目的JSONP版本
 * https://gitee.com/XL8Z/BiliBili_PlayWithMe_JS
 */
class BiliBili_PlayWithMe {

    /**
     * 默认WEBSocket连接，一般会有一个BiliBili_WEBSocket对象，自动配置，不需要管
     */
    static WS = null;

    /**
     * 使用的AppID
     * - BiliBili直播开放平台的项目ID
     */
    static AppID = 0;

    /**
     * 直播间ID
     * - 非常重要
     */
    static LiveRoomID = 0;

    /**
     * 主播主站UID
     * - 非必须
     */
    static MID = 0;

    /**
     * 礼物连击合并
     * - 默认启动
     * - 需要等待连击结束，所以会产生延迟
     */
    static GiftCombine_Enable = true;

    /**
     * 制作一个Map用来登记正在统计的礼物连击
     */
    static GiftCombine_Map = new Map();

    /**
     * 礼物合并延迟
     * - 如默认5，则超过5秒没有再送礼物视为连击结束
     * - 礼物延迟播报的罪魁祸首
     * - 过短则无法正确合并礼物连击
     */
    static GiftCombine_Countdown = 5;

    /**
     * 初始化方法【必须】
     */
    static Init() {
        // 解析地址栏里URL，获取其他参数【如果手动设置过当我放屁】
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

    /**
     * 每秒刷新一次每个连击的计数器，依次触发每个连击的Tick事件
     * - 当连击记录的Tick计数【没有礼物接着连击的秒数】超过上面的超时时间，则判断连击结束
     */
    static GiftCombine_Timer = setInterval(() => {
        BiliBili_PlayWithMe.GiftCombine_Map.forEach(
            (v, k, map) => {
                v.Tick();
            });
    }, 1000);


    /**
     * 探测当前插件运行环境，是否为直播姬
     * @returns Boolean值的判定结果
     */
    static is_LiveHime() { return window.location.href.includes("livehime_ts"); };

    /**
     * 探测当前插件运行环境，是否为OBS
     * @returns Boolean值的判定结果
     */
    static is_OBS() { return navigator.userAgent.includes("OBS"); };


    /**
     * 使用JSONP方式获取签名授权进行连接
     * - 
     */
    static PrepareWEBSocketConnection_WithRemoteAuthorizerServer_UseJSONP() {
        let Elmts = document.createElement('script');
        Elmts.src = BiliBili_PlayWithMe.Authorizer.RemoteAuthorizerServer + "?RoomID=" + BiliBili_PlayWithMe.LiveRoomID.toString();
        document.body.appendChild(Elmts);

        Elmts.onload = (evt) => {
            BiliBili_PlayWithMe.NewSystemNotice(BiLiveChat_RemoteAuthorizerResponse.Msg)
            if (BiLiveChat_RemoteAuthorizerResponse.Code == 200)
                this.WS = new BiliBili_WEBSocket(BiLiveChat_RemoteAuthorizerResponse.WSData.data.auth_body);
            evt.currentTarget.remove();
        }

        Elmts.onerror = (evt) => {
            BiliBili_PlayWithMe.NewSystemNotice("JSONP代签失败")
            evt.currentTarget.remove();
        }
    }

    /**
     * 内部功能，以泽远喵的身份去发一条假弹幕，用于显示脚本的运行状态
     * @param {string} Str 
     */
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

    /**
     * 新弹幕事件，需要你自己覆写
     * @param {*} Dmk 
     */
    static NewDanmaku(Dmk) {

    }

    /**
     * 新礼物事件，需要你自己覆写
     * - 注意有礼物连击统计功能，关闭后每次送礼都是独立条目
     * @param {*} Gft 
     */
    static NewGifts(Gft) {

    }

    /**
     * 上舰事件，需要你自己覆写
     * @param {*} Grd 
     */
    static NewGuard(Grd) {

    }

    /**
     * SC事件，需要你自己覆写
     * @param {*} SC 
     */
    static NewSC(SC) {

    }

    /**
     * SC撤回事件，需要你自己覆写
     * @param {*} SCDel 
     */
    static SCDel(SCDel) {

    }

    /**
     * 默认签名器
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

    /**
     * 模拟收到B站开平长链的JSON回调
     * @param {JSON} JSON 模拟收到的JSON
     * - 样本在根目录下有
     */
    static Test(JSON) {
        BiliBili_WEBSocket.JSONExecute(JSON);
    }


}

/**
 * 写入了解码B站协议的WEBSocket客户端
 */
class BiliBili_WEBSocket extends WebSocket {

    Reader = null;

    /**
     * 构造器，启动B站开放平台专用WEBSocketClient需要一个握手认证字符串
     * @param {string} LoginAuthStr 握手认证字符串
     */
    constructor(LoginAuthStr) {
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
     * 构建并发送握手认证包
     * @param {string} LoginAuthStr 
     */
    Login(LoginAuthStr) {
        let Body = UtilTools.Str2Uint8Array(LoginAuthStr)
        let PackageLength = Body.length + 16;
        console.log("拿到的AuthStr：" + LoginAuthStr);
        console.log("预计的握手包长度：" + PackageLength);
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
                BiliBili_WEBSocket.JSONExecute(JSONObj);
                break;
            case 8:
                BiliBili_PlayWithMe.NewSystemNotice("连上了喵！")
                console.log("[开放平台长链接]解析到服务器的登陆回复");
                break;
            default:
                console.log("[开放平台长链接]未知的数据类型");
                break;
        }
    }

    /**
     * 执行B站开平长链的JSON回调
     * @param {JSON} JSONObj 
     */
    static JSONExecute(JSONObj) {
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

                // 检测礼物合并开关
                if (BiliBili_PlayWithMe.GiftCombine_Enable) {
                    // 制作“UID-礼物ID”格式的合并参照ID
                    let ID = CombinedGifts.MakeID(JSONObj.data);
                    // 根据合并参照ID查询正在进行的礼物合并项
                    if (!(BiliBili_PlayWithMe.GiftCombine_Map.has(ID))) {
                        // 如果没有，创建一个新的礼物合并项
                        BiliBili_PlayWithMe.GiftCombine_Map.set(ID, new CombinedGifts(JSONObj.data));
                    }
                    // 获取新的或者旧的礼物合并项并让其加入新的数量
                    BiliBili_PlayWithMe.GiftCombine_Map.get(ID).Add(JSONObj.data.gift_num);
                }
                // 如果不使用礼物合并则直接输出
                else { BiliBili_PlayWithMe.NewGifts(JSONObj.data); }
                break;
            case "LIVE_OPEN_PLATFORM_GUARD":
                // 当标识为 LIVE_OPEN_PLATFORM_GUARD
                // 将 JSON 里的 data 传给 BiliBili_PlayWithMe.NewGuard() 方法
                switch (JSONObj.data.guard_level) {
                    case 3:
                        JSONObj.data.guard_name = "舰长";
                        break;
                    case 2:
                        JSONObj.data.guard_name = "提督";
                        break;
                    case 1:
                        JSONObj.data.guard_name = "总督";
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
     * @param {string} Str 字符串
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
     * @param {number} Timestamp 秒级时间戳
     * @returns 返回 JavaScript 的 Date 对象
     */
    static Timestamp2DateObj(Timestamp) {
        return new Date(Timestamp * 1000);
    }

    /**
     * 
     * @param {number} Timestamp 秒级时间戳
     * @returns 返回 JavaScript 的 Date.toLocaleString()
     */
    static Timestamp2DateStr(Timestamp) {
        return UtilTools.Timestamp2DateObj(Timestamp).toLocaleString();
    }

    /**
     * 一键测试
     */
    static AutoTest() {
        setTimeout(() => BiliBili_PlayWithMe.NewSystemNotice("开始样式测试，如果你不想要测试，请移除HTML文件里的“UtilTools.AutoTest();”调用"), 1100);
        setTimeout(() => BiliBili_PlayWithMe.Test(样本.礼物), 100);
        setTimeout(() => BiliBili_PlayWithMe.Test(样本.弹幕), 3000);
        setTimeout(() => BiliBili_PlayWithMe.Test(样本.上舰), 7000);
        setTimeout(() => BiliBili_PlayWithMe.Test(样本.SC), 9000);
    }

    样本 = {
        "弹幕": {
            "data": {
                "fans_medal_level": 21,
                "fans_medal_name": "官方",
                "fans_medal_wearing_status": false,
                "guard_level": 0,
                "msg": "你们谁扔个小心心呗",
                "timestamp": 1650717881,
                "uid": 3102384,
                "uname": "猫裙少年泽远喵",
                "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                "room_id": 4639581
            },
            "cmd": "LIVE_OPEN_PLATFORM_DM"
        },
        "礼物": {
            "data": {
                "uid": 114439178,
                "uname": "不忘韩文初心",
                "uface": "http://i2.hdslb.com/bfs/face/e549b18085113c6f824c0eefaf2c9d9dcaf5a1d5.jpg",
                "gift_id": 30607,
                "gift_name": "小心心",
                "gift_num": 1,
                "price": 0,
                "paid": false,
                "fans_medal_level": 25,
                "fans_medal_name": "官方",
                "guard_level": 3,
                "timestamp": 1650717898,
                "anchor_info": {
                    "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                    "uid": 3102384,
                    "uname": "猫裙少年泽远喵"
                }
            },
            "cmd": "LIVE_OPEN_PLATFORM_SEND_GIFT"
        },
        "上舰": {
            "data": {
                "user_info": {
                    "uid": 1270482,
                    "uname": "Sequbre",
                    "uface": "http://i0.hdslb.com/bfs/face/061e978938b8a60b4920fad15596657e77465170.jpg"
                },
                "guard_level": 3,
                "guard_num": 1,
                "guard_unit": "月",
                "fans_medal_level": 2,
                "fans_medal_name": "黑喵姐",
                "fans_medal_wearing_status": false,
                "msg_id": "982ce571-5242-4b73-a82e-3087a958be7b",
                "room_id": 4639581
            },
            "cmd": "LIVE_OPEN_PLATFORM_GUARD"
        },
        "SC": {
            "data": {
                "guard_level": 0,
                "uid": 1270482,
                "uname": "Sequbre",
                "uface": "http://i0.hdslb.com/bfs/face/061e978938b8a60b4920fad15596657e77465170.jpg",
                "message_id": 3992851,
                "message": "进行一个鱼的摸",
                "rmb": 30,
                "timestamp": 1652413567,
                "start_time": 1652413567,
                "end_time": 1652413627,
                "fans_medal_level": 0,
                "fans_medal_name": "",
                "fans_medal_wearing_status": false,
                "msg_id": "968e07ea-49e6-478c-867e-b721ccbd0d62",
                "room_id": 4639581
            },
            "cmd": "LIVE_OPEN_PLATFORM_SUPER_CHAT"
        }
    }
}

/**
 * 每个连击对象的类
 */
class CombinedGifts {

    /**
     * 总连击礼物量
     */
    gift_num = 0;

    /**
     * 第一个事件的所有数据
     */
    GftEvt = {};

    /**
     * 最后一次累加到现在的秒数
     */
    TimerCount = 0;

    constructor(Gft) {
        // 拷贝基础数据
        this.GftEvt = Gft;
        this.uid = Gft.uid;
        this.uname = Gft.uname;
        this.uface = Gft.uface;
        this.gift_id = Gft.gift_id;
        this.gift_name = Gft.gift_name;
        this.price = Gft.price;
        this.paid = Gft.paid;
        this.fans_medal_level = Gft.fans_medal_level;
        this.fans_medal_name = Gft.fans_medal_name;
        this.guard_level = Gft.guard_level;
        this.timestamp = Gft.timestamp;
        this.time = Gft.time;
        this.anchor_info = Gft.anchor_info;
    }

    /**
     * 有新的同UID同种类礼物时触发
     * @param {number} Num 礼物数量
     * - 每次触发会重置计时器
     */
    Add(Num) {
        // 累加计数
        this.gift_num += Num;
        // 重置计时器
        this.TimerCount = 0;
    }

    /**
     * 每秒触发一次的Tick事件
     */
    Tick() {
        // 每秒计算器加一
        this.TimerCount += 1;
        // 如果计时器累加的秒数超过阈值，判定连击结束
        if (this.TimerCount > BiliBili_PlayWithMe.GiftCombine_Countdown)
            this.Execute();
    }

    /**
     * 生成“UID-礼物ID”格式的序列ID
     * @param  Gft 标准Gft时间的 data 部分
     * @returns 
     */
    static MakeID(Gft) {
        return Gft.uid + '-' + Gft.gift_id;
    }

    /**
     * 计时用完，判定连击结束，触发事件
     */
    Execute() {
        // 触发事件
        BiliBili_PlayWithMe.NewGifts(this);
        // 移除Map注销自身
        BiliBili_PlayWithMe.GiftCombine_Map.delete(CombinedGifts.MakeID(this));
    }

}