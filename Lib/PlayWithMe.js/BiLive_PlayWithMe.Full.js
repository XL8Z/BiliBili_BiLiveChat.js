class BiLive_PlayWithMeJS {

    /**
     * 本页面的参数，可以用来“保存”一些主播习惯性的设置，或者主播身份码
     * - 不想把身份码写死的时候，可以用参数设置网页.html?Code=喵喵喵喵的方式通过Get请求的参数把数据传进来
     * - 这样主播只要在收藏夹或者OBS的网址里写上自己的身份码就不用每次都输了
     * - 此方法同样可以用于插件内部设置，故把这个变量共享出来
     * - 注意为了防止大小写写错，这里的参数名字段为全大写，如“CODE”或者“TIMESTAMP”
     */
    static Paramaters = new Map();

    /**
     * 开放平台身份码，由主播提供
     * - 在网页端开播页面获取，挨着推流码：https://link.bilibili.com/p/center/index#/my-room/start-live
     * - 如果没有，去饭贩上随便添加一个项目也许可以激活【推荐大富翁或者我的插件】
     * - 看起来大概长这样“BNB1RBFZQ96O4”
     * - 主播可以随时废弃旧的身份码，制作一个新的，使用失效的身份码无法监听直播间
     * - 如果你的插件会公开，建议你把主播身份码放入网址参数中，不要写死在插件里
     * - 网址参数格式如 Demo.html?CODE=BNB1RBFZQ96O4 
     */
    static AuthCode = "";

    /**
     * 开放平台项目ID【app_id】
     * - 必须，非常重要
     * - 如果是为了体验，可以使用BiLiveChat项目的AppID 1653902473586
     * - 注意，如果使用签约的JSONP代签，则AppID绑定代签码，此项无效
     */
    static AppID = 1653902473586;

    /**
     * 直播间长ID【非短位】
     * - 通过解密身份码获得，必须先成功请求AppStart
     */
    static RoomID = "必须先执行AppStart，服务器才会解密身份码返回主播的真实数据";

    /**
     * 主播B站UID
     * - 通过解密身份码获得，必须先成功请求AppStart
     */
    static UID = "必须先执行AppStart，服务器才会解密身份码返回主播的真实数据";

    /**
     * 主播头像
     * - 通过解密身份码获得，必须先成功请求AppStart
     */
    static Avator = "必须先执行AppStart，服务器才会解密身份码返回主播的真实数据";

    /**
     * 主播B站昵称
     * - 通过解密身份码获得，必须先成功请求AppStart
     */
    static NickName = "必须先执行AppStart，服务器才会解密身份码返回主播的真实数据";

    /**
     * 饭贩插件v2接口签名 
     */
    static CodeSign = ""

    /**
     * 饭贩接口内主站ID参数
     */
    static MID = ""

    /**
     * 饭贩接口内时间戳参数
     */
    static Timestamp = ""

    /**
     * 礼物连击合并
     * - 默认启动
     * - 开平长链没有B站原生连击，只能自己实现
     * - 需要等待连击结束，所以会产生延迟
     * 
     * 工作原理如下
     * 当喵老板刷了一个喵娘时，产生一条记录
     * “喵老板刷了喵娘，1个，0秒”
     * 有一个定时器每秒为所有记录增加秒数
     * 2秒后该项目为“喵老板刷了一个喵娘，2秒”
     * 此时喵老板又刷了一个喵娘
     * 追踪当前连击中项目列表，寻找喵老板刷了喵娘，并触发一次连击+1
     * 该记录变为“喵老板刷了喵娘，2个，0秒”【数据累加，计时被重置】
     * 7秒后，喵老板没有再刷喵娘
     * 该记录变为“喵老板刷了喵娘，2个，5秒”
     * 5秒是连击阈值，超过5秒停止结算
     * 于是判定连击结束，释放事件，销毁Map里的记录
     * 即触发礼物事件：喵老板刷了两个猫娘
     * 【注：实际使用中用UID和礼物ID构建连击跟踪ID】
     */
    static GiftCombine_Enable = true;

    /**
     * 制作一个Map用来登记正在统计的礼物连击
     */
    static GiftCombine_Map = new Map();

    /**
     * 礼物合并延迟
     * - 如默认5，则超过5秒没有再送相同礼物视为连击结束
     * - 礼物延迟播报的罪魁祸首
     * - 过短则无法正确合并礼物连击
     * - B站的默认连击超时计算是5秒
     */
    static GiftCombine_Countdown = 5;

    /**
     * 开放平台App启动成功事件
     * - 开平长链成功连接后触发
     * - 如果你需要拉取主播的头像或者直播间信息，可以在这里操作
     * @param {*} Msg 
     */
    static AppStarted(Msg) { };

    /**
     * 新弹幕事件，需要你自己覆写
     * @param {*} Msg 
     */
    static NewDanmaku(Msg) { };

    /**
     * 新礼物事件，需要你自己覆写
     * - 注意有礼物连击统计功能，关闭后每次送礼都是独立条目
     * @param {*} Msg 
     */
    static NewGifts(Msg) { };

    /**
     * 上舰事件，需要你自己覆写
     * @param {*} Msg 
     */
    static NewGuard(Msg) { };

    /**
     * SC事件，需要你自己覆写
     * @param {*} Msg 
     */
    static NewSC(Msg) { };

    /**
     * SC撤回事件，需要你自己覆写
     * @param {*} Msg 
     */
    static DelSC(Msg) { };

    /**
     * 开平长链掉线事件
     * @param {*} Evt
     */
    static WSClientDisconnect(Evt) { };


    /**
     * 请求AppStart后得到的授权数据
     * - 样本参照项目根目录 样本.js
     */
    static AppStartResponse = null;

    /**
     * 默认WEBSocket连接，一般会有一个BiLive_PlayWithMeJS_WEBSocketClient对象
     * 自动配置，不需要管
     */
    static WSClient = null;

    /**
     * 初始化PlayWithMe.js
     * - 如果已经配置了主播身份码，则自动初始化开平长链监听
     * - 如果没有配置身份码，请在配置后手动触发
     */
    static Init() {
        console.warn("[BiLive_PlayWithMeJS]",
            "想来想去还是把很多控制台输出改成了DeBug\n现在通讯流程和签名流程产生的数据都在DeBug项目里，默认不显示\n要想观看完整流程，请先勾选 [日志级别：详细] \n【选项位于控制台输出区正上方过滤器输入框右边】");

        // 把网页地址栏里Get请求的Parameter序列化成Map
        window.location.search.substring(1).split('&').forEach(
            str => {
                let KAndV = str.split('=');
                BiLive_PlayWithMeJS.Paramaters.set(
                    KAndV[0].toUpperCase(),
                    KAndV.length === 2 ? KAndV[1] : "")
            }
        )
        console.log("[BiLive_PlayWithMeJS]", "检测到的网页Parameter", BiLive_PlayWithMeJS.Paramaters);

        if (BiLive_PlayWithMeJS.AuthCode.length > 0) {
            console.warn("检测到参数Code写死，这是一种不建议的写法\n如果你的插件会公开，建议你把主播身份码放入网址参数中\n如 Demo.html?CODE=BNB1RBFZQ96O4 \n我们会自动从参数中获取Code");
        }

        // 如果存在叫CODE的参数，自动设置为主播授权的身份码
        if (BiLive_PlayWithMeJS.Paramaters.has("CODE")) {
            BiLive_PlayWithMeJS.AuthCode = BiLive_PlayWithMeJS.Paramaters.get("CODE");
            console.log("检测到参数Code：" + BiLive_PlayWithMeJS.AuthCode + "，载入主播授权的身份码！");
        }


        if (BiLive_PlayWithMeJS.Paramaters.has("CODESIGN"))
            BiLive_PlayWithMeJS.CodeSign = BiLive_PlayWithMeJS.Paramaters.get("CODESIGN");
        if (BiLive_PlayWithMeJS.Paramaters.has("TIMESTAMP"))
            BiLive_PlayWithMeJS.Timestamp = parseInt(BiLive_PlayWithMeJS.Paramaters.get("TIMESTAMP"));
        if (BiLive_PlayWithMeJS.Paramaters.has("MID"))
            BiLive_PlayWithMeJS.MID = parseInt(BiLive_PlayWithMeJS.Paramaters.get("MID"));

        if (BiLive_PlayWithMeJS.AuthCode.length > 0) {
            console.log("检测到主播授权的身份码，自动启动");
            BiLive_PlayWithMeJS.AppStart();
        } else {
            console.log("未检测检测到主播授权的身份码，尝试弹窗");
            BiLive_PlayWithMeJS_AuthDialog.Show();
        }
    }

    /**
     * 启动开平长链监听的方法，重要
     * - 配置好了之后直接启动就行
     * - 如果说配置Key和代签就是瞄准，那这个方法就是开炮
     */
    static AppStart() {
        // 如果 AppStartResponse 已经被初始化，则不请求签名
        if (BiLive_PlayWithMeJS.AppStartResponse == null) {
            // 如果有设置POST的服务器URL，则使用同源POST请求开发者签名与AppStart
            if (BiLive_PlayWithMeJS_Authorizer.Chk_SameOriginAuthorizerServer())
                BiLive_PlayWithMeJS.AppStart_SameOrigin()
            // 如果有设置JSONP跨域代签，则使用跨域代签
            else if (BiLive_PlayWithMeJS_Authorizer.Chk_JSONPAuthorizerServer())
                BiLive_PlayWithMeJS.AppStart_JSONP()
            // 如果都没设置过，那就常识进行本地自签【需要浏览器强制关闭CORS安全检查】
            else BiLive_PlayWithMeJS.AppStart_Local()
        } else {
            // 如果HTML内已有<script>标签设定过BiLive_PlayWithMeJS.AppStartResponse，则直接进行后处理不再申请签名
            BiLive_PlayWithMeJS.AfterAppStart();
        }
    }

    static AfterAppStart() {
        if (BiLive_PlayWithMeJS.AppStartResponse.code == 0) {
            console.log("[BiLive_PlayWithMeJS]", "AppStart 请求成功，下发房间数据与开平长链登录JSON", BiLive_PlayWithMeJS.AppStartResponse);

            // 转存返回的主播数据到方便用的位置上
            BiLive_PlayWithMeJS.RoomID = BiLive_PlayWithMeJS.AppStartResponse.data.anchor_info.room_id;
            BiLive_PlayWithMeJS.UID = BiLive_PlayWithMeJS.AppStartResponse.data.anchor_info.uid;
            BiLive_PlayWithMeJS.Avator = BiLive_PlayWithMeJS.AppStartResponse.data.anchor_info.uface;
            BiLive_PlayWithMeJS.NickName = BiLive_PlayWithMeJS.AppStartResponse.data.anchor_info.uname;

            BiLive_PlayWithMeJS.WSClient = new BiLive_PlayWithMeJS_WEBSocketClient();
        } else {
            BiLive_PlayWithMeJS_UtilTools.AnalyzeErrCode(BiLive_PlayWithMeJS.AppStartResponse.code);
            BiLive_PlayWithMeJS.Test({
                "data": {
                    "fans_medal_level": 21,
                    "fans_medal_name": "官方",
                    "fans_medal_wearing_status": false,
                    "guard_level": 0,
                    "msg": "PlayWithMe：签名失败，" + BiLive_PlayWithMeJS.AppStartResponse.message,
                    "timestamp": 1655354216,
                    "uid": 3102384,
                    "uname": "猫裙少年泽远喵",
                    "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                    "room_id": 4639581
                },
                "cmd": "LIVE_OPEN_PLATFORM_DM"
            });;
        }
    }

    /**
     * 每秒刷新一次每个连击的计数器，依次触发每个连击的Tick事件
     * - 当连击记录的Tick计数【没有礼物接着连击的秒数】超过上面的超时时间，则判断连击结束
     * - JS特性，用setInterval创建的Timer自动运行，不需要干预
     */
    static GiftCombine_Timer = setInterval(() => {
        BiLive_PlayWithMeJS.GiftCombine_Map.forEach(
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
     * 屏蔽的弹幕列表
     * - 有什么需要的可以自己加
     */
    static DanmakuBlackList = new Set([
        "老板大气！点点红包抽礼物！",
        "前方高能预警，注意这不是演习",
        "我从未见过如此厚颜无耻之人",
        "那万一赢了呢",
        "你们城里人真会玩",
        "左舷弹幕太薄了",
        "要优雅，不要污",
        "我选择狗带"
    ])

    /**
     * 用已搜集的开平长链JSON模拟测试，模拟触发收到弹幕与收到礼物等事件
     * - 如果没有样本，可以去 样本.js 里获取
     * @param {JSON} JSON 
     */
    static Test(JSON) {
        BiLive_PlayWithMeJS_WEBSocketClient.NewJSONMsg(JSON);
    }


    static AppStart_JSONP() {
        // 使用JSONP方式获取签名授权进行连接
        let Elmts = document.createElement('script');
        Elmts.src = BiLive_PlayWithMeJS_Authorizer.JSONPAuthorizerServer + window.location.search + "&AppID=" + BiLive_PlayWithMeJS.AppID + "&PWMID=" + BiLive_PlayWithMeJS_Authorizer.PWMID;
        document.body.appendChild(Elmts);
        console.log("[BiLive_PlayWithMeJS]", "尝试 第三方JSONP代签 请求 AppStart");
        Elmts.onload = (evt) => {
            BiLive_PlayWithMeJS.AppStartResponse = PlayWithMe_AuthorizerProxyResponse;
            BiLive_PlayWithMeJS.AfterAppStart();
            evt.currentTarget.remove();
        }
        Elmts.onerror = (evt) => {
            BiLive_PlayWithMeJS.Test({
                "data": {
                    "fans_medal_level": 21,
                    "fans_medal_name": "官方",
                    "fans_medal_wearing_status": false,
                    "guard_level": 0,
                    "msg": "PlayWithMe：JSONP代签失败，" + BiLive_PlayWithMeJS.AppStartResponse.msg,
                    "timestamp": 1655354216,
                    "uid": 3102384,
                    "uname": "猫裙少年泽远喵",
                    "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                    "room_id": 4639581
                },
                "cmd": "LIVE_OPEN_PLATFORM_DM"
            });
            evt.currentTarget.remove();
        }
    }

    static AppStart_SameOrigin() {
        let AppStartRequest = new Request(
            BiLive_PlayWithMeJS_Authorizer.SameOriginAuthorizerServer, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                AppID: BiLive_PlayWithMeJS.AppID,
                PWMID: BiLive_PlayWithMeJS_Authorizer.PWMID,
                Code: BiLive_PlayWithMeJS.AuthCode,
                CodeSign: BiLive_PlayWithMeJS.CodeSign,
                Mid: BiLive_PlayWithMeJS.MID,
                Timestamp: BiLive_PlayWithMeJS.Timestamp
            })
        }
        )
        console.log("[BiLive_PlayWithMeJS]", "尝试 第三方普通代签 请求 AppStart");
        fetch(AppStartRequest).then(
            res => {
                res.json().then(
                    json => {
                        BiLive_PlayWithMeJS.AppStartResponse = json;
                        BiLive_PlayWithMeJS.AfterAppStart();
                    })
            }).then(
                BiLive_PlayWithMeJS.Test({
                    "data": {
                        "fans_medal_level": 21,
                        "fans_medal_name": "官方",
                        "fans_medal_wearing_status": false,
                        "guard_level": 0,
                        "msg": "PlayWithMe：签名失败，接口不可用",
                        "timestamp": 1655354216,
                        "uid": 3102384,
                        "uname": "猫裙少年泽远喵",
                        "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                        "room_id": 4639581
                    },
                    "cmd": "LIVE_OPEN_PLATFORM_DM"
                })
            );
    }

    static AppStart_Local() {
        let RequestBody = {
            "app_id": BiLive_PlayWithMeJS.AppID,
            "code": BiLive_PlayWithMeJS.AuthCode
        };
        let AppStartRequest = new Request(
            "https://live-open.biliapi.com/v2/app/start", {
            method: "POST",
            headers: BiLive_PlayWithMeJS_Authorizer.LocalAuthorizer_GenerateAuthorizedHead(RequestBody),
            body: JSON.stringify(RequestBody)
        }
        )
        console.log("[BiLive_PlayWithMeJS]", "准备使用 APIv2 发起 AppStart 请求")
        fetch(AppStartRequest).then(
            res => {
                res.json().then(
                    json => {
                        BiLive_PlayWithMeJS.AppStartResponse = json;
                        BiLive_PlayWithMeJS.AfterAppStart();
                    }
                )
            });
    }
}


/**
 * 开平长链定制版WEBSocket客户端
 * - 长链数据结构和包定义见 https://open-live.bilibili.com/document/doc&tool/api/websocket.html
 */
class BiLive_PlayWithMeJS_WEBSocketClient extends WebSocket {
    constructor() {
        super("wss://broadcastlv.chat.bilibili.com:443/sub")

        // 长链启动后进行初始化
        this.onopen = (evt) => {
            // 发送内含Auth字符串的握手包
            this.Login();
        }

        // 长链接收到数据后进行处理
        this.onmessage = (msg) => {
            let WSReader = new FileReader();
            WSReader.onloadend = (rdr) => this.NewPkg(new Uint8Array(rdr.currentTarget.result));
            WSReader.readAsArrayBuffer(msg.data);
        }

        this.onclose = (evt) => BiLive_PlayWithMeJS.WSClientDisconnect(evt);

    }

    Login() {
        // 把之前 AppStart 拿到的带授权码的 JSON，以 UTF-8 编码转换为 ByteArray
        // 【里面是之前AppStart拿到的带密钥的JSON，证明本次开平长链请求得到授权】
        let Body = BiLive_PlayWithMeJS_UtilTools.Str2Uint8Array(
            BiLive_PlayWithMeJS.AppStartResponse.data.websocket_info.auth_body);
        // 编码后的内容长度加上固定16的包头，推算出数据包总长度
        let PkgLength = 16 + Body.length;
        // 包头部分
        let PkgData = new Array();
        PkgData.push.apply(PkgData, [
            // 【Packet Length】包长字节数(Byte)【每隔字节8个位(Bit)，即数组里的一个UInt8】
            // 4字节[Byte]长度的包总长度，后两个为实际长度的高位和低位
            // 这里用了取巧的写法，毕竟字节码是一个Byte是0到255，所以用255直接进位
            // 至于前两位……你跟我说你能发个长度超过65535的包？
            0, 0, PkgLength / 255, PkgLength % 255,
            // 【Header Length】数据包包头长度，固定16，写死写死！
            0, 16,
            // 【Version】协议版本1，0表示无加密，2是zlib压缩过的，开平长链里没有压缩过的数据
            0, 0,
            // 操作码，这里写死，7为OP_AUTH，登录握手包
            0, 0, 0, 7,
            // 不知道干啥的“Sequence ID”，瞎写
            // 【但是之前有很多野生API这里会写1？】
            0, 0, 0, 0
        ]);
        // 给黄老爷【啊呸】给张麻子的腿【啊不是】给数据包把包身接上
        // 就是本方法第一行那个玩意
        PkgData.push.apply(PkgData, Body);
        // 不知道为什么就是觉得转成 Uint8Array 可能会稳点
        // 之前做普通Array是因为 Uint8Array 不支持拼接
        PkgData = new Uint8Array(PkgData);
        console.log("[BiLive_PlayWithMeJS] [开平长链]", "准备发送握手，申请监听直播间");
        console.debug("[BiLive_PlayWithMeJS] [开平长链]", "发送\n" + BiLive_PlayWithMeJS_UtilTools.Uint8Array2HexStr(PkgData));
        // 送走，收工
        this.send(PkgData);
    }

    /**
     * 收到B站WEBSocket服务器回复登陆成功的包之后进行的后续处理
     */
    LoginAuthorized() {
        // 握手完毕后，先丢一个心跳包过去探路，原理跟踹猫一脚看看猫叫不叫差不多
        // 【你懂什么，这也是握手的一部分.gif】
        this.HeartBeat();
        // 设置循环发送，告诉服务器自己还活着，不然抠逼服务器会把长链接掐了
        //【还没死hao透.gif】
        setInterval(() => {
            this.HeartBeat();
            // 定时发送循环延迟，单位毫秒【20000=20秒】
            // B站说30，我就20，这叫保守，懂么？【什么层层加码】
        }, 20000);
    }

    /**
     * 发送一个心跳包
     */
    HeartBeat() {
        let PkgData = new Uint8Array([
            // 【Packet Length】包长16字节(Byte)【16个8位(Bit)】
            0, 0, 0, 16,
            // 【Header Length】数据包包头长度，固定16，写死写死！
            0, 16,
            // 【Version】协议版本1，0表示无加密，2是zlib压缩过的，开平长链里没有压缩过的数据
            // 【但是之前有很多野生API这里会写1？】
            0, 0,
            // 【Operation】操作类型，这里写死，2为OP_HEARTBEAT，客户端心跳，KeepAlive包
            0, 0, 0, 2,
            // 不知道干啥的“Sequence ID”，瞎写
            0, 0, 0, 0
        ]);
        console.debug("[BiLive_PlayWithMeJS] [开平长链]", "发送心跳包【踢服务器一jio】，内容如下\n" + BiLive_PlayWithMeJS_UtilTools.Uint8Array2HexStr(PkgData));
        // 送走，收工
        this.send(PkgData);
    }

    /**
     * 拿到数据包之后的处理
     * - 包类型参考 https://open-live.bilibili.com/document/doc&tool/api/websocket.html
     */
    NewPkg(Pkg) {
        // 判断协议版本，这里把1包括进来，因为野生WS客户端经常接受到协议1的无压缩内容
        // 协议版本为2的是zlib压缩过的包，暂时不处理，直接报错，因为据说开放平台根本没有压缩过的包
        console.debug("[BiLive_PlayWithMeJS] [开平长链]", "收到服务器的数据包\n" + BiLive_PlayWithMeJS_UtilTools.Uint8Array2HexStr(Pkg));
        if (Pkg[7] < 2) {
            switch (Pkg[11]) {
                case 3:
                    console.debug("[BiLive_PlayWithMeJS] [开平长链]", "收到服务器收到心跳包后的回执【服务器很傲娇的踹了回来】");
                    break;
                case 5:
                    // 服务器通知你有新事件发生，此包夹带事件JSON
                    let Jsn = JSON.parse(decode_utf8.decodeUtf8(Pkg.slice(16)));
                    console.log("[BiLive_PlayWithMeJS] [开平长链]", "收到新直播间事件，解码后内容为\n", Jsn);
                    // 进行事件处理
                    BiLive_PlayWithMeJS_WEBSocketClient.NewJSONMsg(Jsn);
                    break;
                case 8:
                    console.log("[BiLive_PlayWithMeJS] [开平长链]", "服务器收到登录包并确认你是正经开发者，回复握手包【服务器终于打算理你了】");
                    console.log("[BiLive_PlayWithMeJS] [开平长链]", "开平长链建立成功，开始监听 " + BiLive_PlayWithMeJS.NickName + " 的直播间，房间号 " + BiLive_PlayWithMeJS.RoomID);
                    this.LoginAuthorized();
                    BiLive_PlayWithMeJS.AppStarted(BiLive_PlayWithMeJS.AppStartResponse);
                    BiLive_PlayWithMeJS.Test({
                        "data": {
                            "fans_medal_level": 21,
                            "fans_medal_name": "官方",
                            "fans_medal_wearing_status": false,
                            "guard_level": 0,
                            "msg": "已成功通过开平长链连接到房间：" + BiLive_PlayWithMeJS.RoomID,
                            "timestamp": 1655354216,
                            "uid": 3102384,
                            "uname": "猫裙少年泽远喵",
                            "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                            "room_id": 4639581
                        },
                        "cmd": "LIVE_OPEN_PLATFORM_DM"
                    });
                    break;
            }
        }
    }

    /**
     * 新JSON事件处理
     * @param {JSONObj} Msg 开平长链事件JSON
     */
    // https://open-live.bilibili.com/document/liveRoomData.html
    static NewJSONMsg(Msg) {
        switch (Msg.cmd) {
            case "LIVE_OPEN_PLATFORM_DM":
                // 检测是否为抽奖和节奏风暴等固定无意义弹幕
                if (!BiLive_PlayWithMeJS.DanmakuBlackList.has(Msg.data.msg)) {
                    // 思前想后还是扒了data的衣服，扒衣见君挺好的
                    // 要不然每次写处理你们还得 Msg.data.XXXX的太罗嗦了
                    // 但是这样通用的处理会遇到困难，干脆在里面塞个事件类型备用
                    Msg.data.type = "Danmaku";
                    // 交由你写的事件代码处理
                    BiLive_PlayWithMeJS.NewDanmaku(Msg.data);
                }
                break;
            case "LIVE_OPEN_PLATFORM_SEND_GIFT":
                // 当标识为 LIVE_OPEN_PLATFORM_SEND_GIFT
                // 将 JSON 里的 data 传给 BiLive_PlayWithMeJS.NewGifts() 方法
                // 检测礼物合并开关
                if (BiLive_PlayWithMeJS.GiftCombine_Enable) {
                    // 制作“UID-礼物ID”格式的合并参照ID
                    let ID = BiLive_PlayWithMeJS_CombinedGifts.MakeID(Msg.data);
                    // 根据合并参照ID查询正在进行的礼物合并项
                    if (BiLive_PlayWithMeJS.GiftCombine_Map.has(ID)) {
                        // 获取新的或者旧的礼物合并项并让其加入新的数量
                        BiLive_PlayWithMeJS.GiftCombine_Map.get(ID).Add(Msg.data.gift_num);
                    } else {
                        // 如果没有，创建一个新的礼物合并项
                        BiLive_PlayWithMeJS.GiftCombine_Map.set(ID, new BiLive_PlayWithMeJS_CombinedGifts(Msg.data));
                    }
                }
                // 如果不使用礼物合并则直接输出
                else {
                    Msg.data.type = "Gifts";
                    BiLive_PlayWithMeJS.NewGifts(Msg.data);
                }
                break;
            case "LIVE_OPEN_PLATFORM_GUARD":
                // 当标识为 LIVE_OPEN_PLATFORM_GUARD
                switch (Msg.data.guard_level) {
                    case 3:
                        Msg.data.guard_level_name = "舰长";
                        break;
                    case 2:
                        Msg.data.guard_level_name = "提督";
                        break;
                    case 1:
                        Msg.data.guard_level_name = "总督";
                        break;
                }
                // 补个事件类型防止后续需要时遇到困难
                Msg.data.type = "Guard";
                // 将 JSON 里的 data 传给 BiLive_PlayWithMeJS.NewGuard() 方法
                BiLive_PlayWithMeJS.NewGuard(Msg.data);
                break;
            case "LIVE_OPEN_PLATFORM_SUPER_CHAT":
                // 当标识为 LIVE_OPEN_PLATFORM_SUPER_CHAT
                // 补个事件类型防止后续需要时遇到困难
                Msg.data.type = "SuperChat";
                // 将 JSON 里的 data 传给 BiLive_PlayWithMeJS.NewSC() 方法
                BiLive_PlayWithMeJS.NewSC(Msg.data);
                break;
            case "LIVE_OPEN_PLATFORM_SUPER_CHAT_DEL":
                // 当标识为 LIVE_OPEN_PLATFORM_SUPER_CHAT_DEL
                Msg.data.type = "DeleteSuperChat";
                // 将 JSON 里的 data 传给 BiLive_PlayWithMeJS.SCDel() 方法
                BiLive_PlayWithMeJS.SCDel(Msg.data);
                break;
        }
    }
}

/**
 * 授权器部分
 */
class BiLive_PlayWithMeJS_Authorizer {
    static BiliOpenLiveAccessKey = "";
    static BiliOpenLiveSecretKey = "";
    static SameOriginAuthorizerServer = "";
    static JSONPAuthorizerServer = "";

    /**
     * 代签项目ID
     * - 不使第三方批量代签可以不用
     * - 个人自签时可以写死
     */
    static PWMID = ""

    /**
     * 检查开发者密钥是否已配置
     */
    static Chk_DvlprKeys() {
        let Rtn = true;
        if (BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveAccessKey == null || BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveAccessKey == "" || typeof BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveAccessKey == 'undefined') {
            console.error("[BiLive_PlayWithMeJS] [开平签名器]", "未能检测到有效的AccessKey\n如果你打算进行离线测试与体验，请把自己的Key写入根目录下的 MyOpenLiveKey.js 内\n或设置 BiLive_PlayWithMeJS_Authorizer.AccessKey = \"你的开放平台开发者AccessKey\"");
            Rtn = false;
        }
        if (BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveSecretKey == null || BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveSecretKey == "" || typeof BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveSecretKey == 'undefined') {
            console.error("[BiLive_PlayWithMeJS] [开平签名器]", "未能检测到有效的SecretKey\n如果你打算进行离线测试与体验，请把自己的Key写入根目录下的 MyOpenLiveKey.js 内\n或设置 BiLive_PlayWithMeJS_Authorizer.SecretKey = \"你的开放平台开发者SecretKey\"");
            Rtn = false;
        }
        return Rtn;
    }

    /**
     * 检查饭贩参数
     */
    static Chk_FanFanParam() {
        if (
            BiLive_PlayWithMeJS.Paramaters.has("CODESIGN") ||
            BiLive_PlayWithMeJS.Paramaters.has("MID") ||
            BiLive_PlayWithMeJS.Paramaters.has("TIMESTAMP") ||
            BiLive_PlayWithMeJS.Paramaters.has("CODE")
        ) {
            console.error("[BiLive_PlayWithMeJS] [开平签名器]", "未能检测到有效的饭贩参数组");
            return false;
        }
        return true;
    }


    /**
     * 检查代签参数
     */
    static Chk_PWMID() {
        if (BiLive_PlayWithMeJS_Authorizer.PWMID.length <= 0) {
            console.error("[BiLive_PlayWithMeJS] [开平签名器]", "未能检测到有效的代签服务ID");
            return false;
        }
        return true;
    }

    /**
     * 检测同源代签服务器接口设置情况
     * @returns 
     */
    static Chk_SameOriginAuthorizerServer() {
        if (
            BiLive_PlayWithMeJS_Authorizer.SameOriginAuthorizerServer == null || BiLive_PlayWithMeJS_Authorizer.SameOriginAuthorizerServer == "" || typeof BiLive_PlayWithMeJS_Authorizer.SameOriginAuthorizerServer == 'undefined') {
            console.error("[BiLive_PlayWithMeJS] [开平签名器]", "未能检测到有效的同源代签服务器接口");
            return false;
        }
        return true;
    }

    static Chk_JSONPAuthorizerServer() {
        if (
            BiLive_PlayWithMeJS_Authorizer.JSONPAuthorizerServer == null || BiLive_PlayWithMeJS_Authorizer.JSONPAuthorizerServer == "" || typeof BiLive_PlayWithMeJS_Authorizer.JSONPAuthorizerServer == 'undefined') {
            console.error("[BiLive_PlayWithMeJS] [开平签名器]", "未能检测到有效的JSONP代签服务器接口");
            return false;
        }
        return true;
    }

    static LocalAuthorizer_GenerateAuthorizedHead(RequestBody) {
        let MD5 = new Hashes.MD5();
        let HMAC_SHA256 = new Hashes.SHA256();
        console.warn("[BiLive_PlayWithMeJS] 正在进行本地强制跨域请求，这种把开发者Key写入静态前端文件的方式极度危险，稍一不慎随时有可能导致你的开放平台开发者Key外泄！\n目前据说是可以通过寻求开放平台工作人员帮助的形式强制更换开发者Key，但具体操作流程非常麻烦，请千万小心不要把写入自己Key版本流出！");
        BiLive_PlayWithMeJS_Authorizer.Chk_DvlprKeys()
        console.debug("[BiLive_PlayWithMeJS] [开平签名器] [本地模式]", "待签名的POST请求，其Body内容为\n" + JSON.stringify(RequestBody));
        let BodyMD5 = MD5.hex(JSON.stringify(RequestBody));
        let RdmInt = parseInt(Math.random() * 10000000);
        let Timestamp = Math.round(new Date() / 1000);
        console.debug("[BiLive_PlayWithMeJS] [开平签名器] [本地模式]", "待签名的POST请求，其Body内容的MD5值为\n" + BodyMD5);
        let xBiliHeaders = "x-bili-accesskeyid:" +
            BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveAccessKey +
            "\nx-bili-content-md5:" + BodyMD5 +
            "\nx-bili-signature-method:HMAC-SHA256" +
            "\nx-bili-signature-nonce:" + RdmInt +
            "\nx-bili-signature-version:1.0" +
            "\nx-bili-timestamp:" + Timestamp;

        console.debug("[BiLive_PlayWithMeJS] [开平签名器] [本地模式]", "待签名的POST请求，其需要HMAC签名的内容为\n" + xBiliHeaders);
        let HMAC = HMAC_SHA256.hex_hmac(BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveSecretKey, xBiliHeaders);
        console.debug("[BiLive_PlayWithMeJS] [开平签名器] [本地模式]", "对上述内容使用你的开发者SecretKey进行HMAC-SHA256签名，得到的结果为\n" + HMAC);
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-bili-accesskeyid": BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveAccessKey,
            "x-bili-content-md5": BodyMD5,
            "x-bili-signature-method": "HMAC-SHA256",
            "x-bili-signature-nonce": RdmInt,
            "x-bili-signature-version": "1.0",
            "x-bili-timestamp": Timestamp,
            "Authorization": HMAC
        };
    };

    /**
     * 本地检查Sign
     * - 我知道没啥用，就是给你们看看流程
     */
    static LocalAuthorizer_SignCheck() {
        let HMAC_SHA256 = new Hashes.SHA256();
        let Str = "Caller:bilibili\nCode:" + BiLive_PlayWithMeJS.AuthCode + "\nMid:" + BiLive_PlayWithMeJS.MID + "\nTimestamp:" + BiLive_PlayWithMeJS.Timestamp;
        console.debug("[BiLive_PlayWithMeJS] [开平签名器] [本地模式]", "待签名的贩贩请求字符串\n" + Str);
        let HMAC = HMAC_SHA256.hex_hmac(BiLive_PlayWithMeJS_Authorizer.BiliOpenLiveSecretKey, Str);
        console.debug("[BiLive_PlayWithMeJS] [开平签名器] [本地模式]", "对上述内容使用你的开发者SecretKey进行HMAC-SHA256签名，得到的结果为\n" + HMAC);
        console.debug("[BiLive_PlayWithMeJS] [开平签名器] [本地模式]", "饭贩链接里提供的Sign参数为\n" + BiLive_PlayWithMeJS.CodeSign +
            "\n比对结果为" + (HMAC == BiLive_PlayWithMeJS.CodeSign));
        return (HMAC == BiLive_PlayWithMeJS.CodeSign);
    }
}

class BiLive_PlayWithMeJS_UtilTools {

    /**
     * 转换Uint8Array为HEX字符串
     * @param {Uint8Array} Uint8Array 二进制数组
     * @returns 十六进制小写字符串
     */
    static Uint8Array2HexStr(Uint8Array) {
        return Array.prototype.map.call(Uint8Array, (x) => ('00' + x.toString(16)).slice(-2)).join(' ');
    }



    /**
     * 将字符串以UTF-8编码转换为二进制数据
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
     * 分析解读错误码
     * @param {*} ErrCode 
     */
    static AnalyzeErrCode(ErrCode) {
        switch (ErrCode) {
            case 4002:
                console.error("请求失败，错误码 4002\n你的HMAC签名无效，可能是使用了错误的开发者SecretKey，或者待签名字符串有误");
                break;
        }
    }

    /**
     * 把秒级时间戳转换为JavaScript的Date对象
     * @param {number} Timestamp 秒级时间戳
     * @returns 返回 JavaScript 的 Date 对象
     */
    static Timestamp2DateObj(Timestamp) {
        return new Date(Timestamp * 1000);
    }

    /**
     * 把秒级时间戳转换为JavaScript的Date对象后提取人类友好字符串
     * @param {number} Timestamp 秒级时间戳
     * @returns 返回 JavaScript 的 Date.toLocaleString()
     */
    static Timestamp2DateStr(Timestamp) {
        return UtilTools.Timestamp2DateObj(Timestamp).toLocaleString();
    }


}

/**
 * 每个连击对象的类
 */
class BiLive_PlayWithMeJS_CombinedGifts {


    /**
     * 第一个事件的所有数据
     */
    Evt = {};

    /**
     * 最后一次累加到现在的秒数
     */
    TimerCount = 0;

    constructor(Gft) {
        // 拷贝基础数据
        this.Evt = Gft;
        // 移除了外层"cmd": "LIVE_OPEN_PLATFORM_SEND_GIFT"，补个类型以防万一
        this.Evt.type = "Gifts";
    }

    /**
     * 有新的同UID同种类礼物时触发
     * @param {number} Num 礼物数量
     * - 每次触发会重置计时器
     */
    Add(Num) {
        // 累加计数
        this.Evt.gift_num += Num;
        // 重置计时器
        this.TimerCount = 0;
    }

    /**
     * 每秒触发一次的Tick事件
     */
    Tick() {
        // 每秒计算器加一
        this.TimerCount += 1;
        // 如果本项计时器累加的秒数超过阈值，即多少秒内同一个人没有再送过相同礼物，判定连击结束
        if (this.TimerCount > BiLive_PlayWithMeJS.GiftCombine_Countdown)
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
        BiLive_PlayWithMeJS.NewGifts(this.Evt);
        // 移除Map注销自身
        BiLive_PlayWithMeJS.GiftCombine_Map.delete(BiLive_PlayWithMeJS_CombinedGifts.MakeID(this.Evt));
    }

}

class BiLive_PlayWithMeJS_AuthDialog {
    static Show() {
        let Style = document.createElement("style");
        Style.id = "css_PlayWithMeJS_AuthDialog";
        Style.innerHTML =
            "#div_PlayWithMeJS_AuthDialog {\
            z-index:9999;\
            position: fixed;\
            width: 100vw;\
            width: -webkit-fill-available;\
            height: 100vh;\
            height: -webkit-fill-available;\
            background-color: #0004;\
            user-select: none;\
            display: flex;\
            justify-content: center;\
            align-items: center;\
            margin: 0;\
            top: 0;\
            left: 0;\
            right: 0;\
            bottom: 0;\
        }\
        \
        #div_PlayWithMeJS_AuthDialog_Dialog {\
            width: 30vw;\
            min-width: 30rem;\
            height: 30vh;\
            min-height: 20rem;\
            background-color: #fff;\
            border-radius: .5rem;\
            position: relative;\
        }\
        \
        #div_PlayWithMeJS_AuthDialog_Dialog>h1 {\
            color: #FF6699;\
            width: 100%;\
            font-weight: 300;\
            font-size: 1.5rem;\
            text-align: center;\
            position: absolute;\
            top: 7%;\
        }\
        \
        #p_PlayWithMeJS_AuthDialog_Input {\
            border-top-left-radius: .5rem;\
            border-bottom-left-radius: .5rem;\
            border: .1em solid #E3E5E7;\
            background-color: #F6F7F8;\
            text-align: center;\
            position: absolute;\
            width: 5rem;\
            height: 2rem;\
            line-height: 2rem;\
            top: 30%;\
            left: calc(38% - 5rem);\
            margin: 0;\
        }\
        \
        #ipt_PlayWithMeJS_AuthDialog_Input {\
            border-top-right-radius: .5rem;\
            border-bottom-right-radius: .5rem;\
            border: .1em solid #E3E5E7;\
            background-color: #FFFFFF;\
            text-align: center;\
            position: absolute;\
            height: 2rem;\
            line-height: 2rem;\
            top: 30%;\
            left: 38%;\
            width: 40%;\
        }\
        \
        #div_PlayWithMeJS_AuthDialog_Dialog>h4 {\
            color: #BBB;\
            width: 100%;\
            font-weight: 300;\
            font-size: .5rem;\
            text-align: center;\
            position: absolute;\
            top: 40%;\
        }\
        \
        .img_Bili_FootLogo {\
            position: absolute;\
            left: 0;\
            bottom: 0;\
        }\
        .img_Bili_Help {\
            vertical-align: top;\
            height: 3rem;\
        }\
        \
        #btn_PlayWithMeJS_AuthDialog_Confirm {\
            background-color: #FF6699;\
            color: #FFF;\
            text-align: center;\
            border-radius: .7rem;\
            line-height: 2.5rem;\
            height: 2.5rem;\
            width: 10rem;\
            left: calc(50% - 5rem);\
            right: calc(50% - 5rem);\
            bottom: 20%;\
            position: absolute;\
        }\
        \
        #a_PlayWithMeJS_AuthDialog_Description {\
            position: absolute;\
            bottom: 0;\
            right: 0;\
            width: 8rem;\
            text-align: center;\
            color: #BBB;\
            line-height: 3rem;\
        }\
        \
        #a_PlayWithMeJS_AuthDialog_GoGet {\
            color: #FF6699;\
            position: absolute;\
            bottom: 7%;\
            left: calc(50% - 1.5em);\
            text-decoration: none;\
        }";
        document.head.appendChild(Style);
        let HTML = document.createElement("div");
        HTML.id = ("div_PlayWithMeJS_AuthDialog");
        HTML.innerHTML = "<div id='div_PlayWithMeJS_AuthDialog'>\
        <div id='div_PlayWithMeJS_AuthDialog_Dialog'>\
            <h1>请提供您的主播身份码</h1>\
            <h4>提供身份码视为您授权此插件监听您的直播间<br/> 请不要向不信任的插件提供身份码\
                <br/> 如您怀疑身份码被恶意冒用，请点击刷新更换\
            </h4>\
            <p id='p_PlayWithMeJS_AuthDialog_Input' placeholder='请输入您网页端上的身份码'>身份码</p>\
            <input id='ipt_PlayWithMeJS_AuthDialog_Input'>\
            <a id='btn_PlayWithMeJS_AuthDialog_Confirm' onclick='BiLive_PlayWithMeJS_AuthDialog.Confirm();'>授权此插件</a>\
            <svg class='img_Bili_FootLogo'  xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" fill=\"none\" version=\"1.1\" width=\"138.20126342773438\" height=\"99.42987060546875\" viewBox=\"0 0 138.20126342773438 99.42987060546875\"><defs><mask id=\"master_svg0_0_1127\"><g style=\"mix-blend-mode:passthrough\"><rect x=\"0\" y=\"0\" width=\"138.20126342773438\" height=\"99.42987060546875\" rx=\"0\" fill=\"#FFFFFF\" fill-opacity=\"1\"/></g></mask><radialGradient cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" id=\"master_svg1__005\" gradientTransform=\"translate(63.807690675224876 8.587513662200081) rotate(92.8815830230863) scale(100.34351882787351 165.70771456468367)\"><stop offset=\"0%\" stop-color=\"#FB7299\" stop-opacity=\"1\"/><stop offset=\"100%\" stop-color=\"#FB7299\" stop-opacity=\"0.24076704680919647\"/></radialGradient></defs><g style=\"mix-blend-mode:passthrough\"><g><g style=\"mix-blend-mode:passthrough\"><g mask=\"url(#master_svg0_0_1127)\"><path d=\"M97.21114928741456,12.331931427001955L119.91944928741455,12.331931427001955C132.13144928741457,12.331931427001955,142.12244928741455,22.40643142700195,142.12244928741455,34.71993142700195L142.12244928741455,90.77953142700196C142.12244928741455,103.09343142700196,132.13144928741457,113.16743142700196,119.91944928741455,113.16743142700196L116.61144928741454,113.16743142700196C116.61144928741454,117.23743142700195,113.33844928741455,120.53743142700195,109.30154928741455,120.53743142700195C105.26524928741455,120.53743142700195,101.99334928741455,117.23743142700195,101.99334928741455,113.16743142700196L50.04184928741455,113.16743142700196C50.04184928741455,117.23743142700195,46.76994928741455,120.53743142700195,42.73294928741455,120.53743142700195C38.696549287414555,120.53743142700195,35.42474928741455,117.23743142700195,35.42474928741455,113.16743142700196L32.115649287414556,113.16743142700196C19.90473928741455,113.16743142700196,9.91344928741455,103.09343142700196,9.91344928741455,90.77953142700196L9.91344928741455,34.71993142700195C9.91344928741455,22.40643142700195,19.90473928741455,12.331931427001955,32.115649287414556,12.331931427001955L55.22064928741455,12.331931427001955L44.49384928741455,1.5149614270019534C42.74804928741455,-0.2461885729980473,42.74804928741455,-3.127508572998047,44.49384928741455,-4.887968572998047C46.23964928741455,-6.649115572998047,49.09764928741455,-6.648421572998047,50.84414928741455,-4.887968572998047L67.91984928741455,12.331931427001955L84.51134928741455,12.331931427001955L101.58774928741455,-4.887968572998047C103.33354928741456,-6.648421572998047,106.19154928741455,-6.649115572998047,107.93724928741455,-4.887968572998047C109.68374928741456,-3.127508572998047,109.68304928741455,-0.2461885729980473,107.93724928741455,1.5149614270019534L97.21114928741456,12.331931427001955ZM33.94164928741455,98.79943142700195L118.94944928741455,98.79943142700195C123.40044928741455,98.79943142700195,127.07544928741456,95.14543142700195,127.04244928741456,90.67913142700195L126.62044928741454,33.71373142700195C126.58744928741456,29.248031427001955,122.97944928741455,25.593131427001953,118.52844928741455,25.593131427001953L33.52024928741455,25.593131427001953C29.06904928741455,25.593131427001953,25.39484928741455,29.248031427001955,25.427649287414553,33.71373142700195L25.84904928741455,90.67913142700195C25.88194928741455,95.14543142700195,29.49104928741455,98.79943142700195,33.94164928741455,98.79943142700195Z\" fill-rule=\"evenodd\" transform=\"matrix(0.9659258127212524,0.2588190734386444,-0.2588190734386444,0.9659258127212524,-1.2691032378459113,-2.7773416874389056)\" fill=\"url(#master_svg1__005)\" fill-opacity=\"0.13947173953056335\"/><g style=\"mix-blend-mode:passthrough\"><path d=\"M46.069020147705075,47.42802429199219L17.628620147705078,52.72129429199219L19.73090014770508,63.07742429199219L48.17202014770508,57.784124291992185L46.069020147705075,47.42802429199219ZM73.40342014770508,57.784124291992185L101.84442014770508,63.07742429199219L103.94682014770508,52.72129429199219L75.50572014770508,47.42802429199219L73.40342014770508,57.784124291992185ZM73.94422014770508,78.33542429199218C74.42922014770508,77.63142429199219,75.24212014770508,77.16812429199219,76.16552014770508,77.16812429199219C77.65212014770508,77.16812429199219,78.71542014770507,78.41252429199218,78.71542014770507,79.89162429199219C78.71542014770507,80.36782429199218,78.59532014770508,80.80382429199219,78.39572014770508,81.1859242919922L78.40532014770508,81.19132429199219C78.40532014770508,81.19132429199219,75.15162014770507,87.8555242919922,68.14202014770507,87.8555242919922C63.811320147705075,87.8555242919922,60.78812014770508,84.4531242919922,60.78812014770508,84.4531242919922C60.78812014770508,84.4531242919922,57.764220147705075,87.8555242919922,53.43412014770508,87.8555242919922C46.423920147705076,87.8555242919922,43.17012014770508,81.19132429199219,43.17012014770508,81.19132429199219L43.18042014770508,81.1859242919922C42.98012014770508,80.80382429199219,42.860120147705075,80.36782429199218,42.860120147705075,79.89162429199219C42.860120147705075,78.41252429199218,43.92342014770507,77.16812429199219,45.40992014770508,77.16812429199219C46.33332014770508,77.16812429199219,47.146920147705075,77.63142429199219,47.631920147705074,78.33542429199218L47.63402014770508,78.33342429199219C47.63402014770508,78.33342429199219,50.08922014770508,82.34982429199218,52.97452014770508,82.34982429199218C57.57422014770508,82.34982429199218,57.90412014770508,78.08712429199218,60.78812014770508,74.81442429199218C63.67132014770508,78.08712429199218,64.00202014770508,82.34982429199218,68.60162014770508,82.34982429199218C71.48632014770507,82.34982429199218,73.94152014770508,78.33342429199219,73.94152014770508,78.33342429199219L73.94422014770508,78.33542429199218Z\" fill-rule=\"evenodd\" transform=\"matrix(0.9659258127212524,0.2588190734386444,-0.2588190734386444,0.9659258127212524,12.875958206657742,-2.9465517506445167)\" fill=\"#FFEFF4\" fill-opacity=\"1\"/></g></g></g></g></g></svg>\
            <a id='a_PlayWithMeJS_AuthDialog_GoGet' href='https://link.bilibili.com/p/center/index#/my-room/start-live' target='_blank'>去复制</a>\
            <a id='a_PlayWithMeJS_AuthDialog_Description'>\
            <svg class='img_Bili_Help'  xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" fill=\"none\" version=\"1.1\" width=\"15\" height=\"15\" viewBox=\"0 0 15 15\"><clipPath id=\"master_svg0_0_1077\"><rect x=\"0\" y=\"0\" width=\"15\" height=\"15\" rx=\"0\"/></clipPath><g clip-path=\"url(#master_svg0_0_1077)\" style=\"mix-blend-mode:passthrough\"><g><g style=\"mix-blend-mode:passthrough\"><path d=\"M6.796875,11.489529609680176C6.796875,11.877864609680175,7.11167,12.192654609680176,7.5,12.192654609680176C7.888335,12.192654609680176,8.203125,11.877864609680175,8.203125,11.489529609680176C8.203125,11.101199609680176,7.888335,10.786404609680176,7.5,10.786404609680176C7.11167,10.786404609680176,6.796875,11.101199609680176,6.796875,11.489529609680176C6.796875,11.489529609680176,6.796875,11.489529609680176,6.796875,11.489529609680176Z\" fill=\"#BBB\" fill-opacity=\"1\"/></g><g style=\"mix-blend-mode:passthrough\"><path d=\"M7.5,14.0625C3.88125,14.0625,0.9375,11.1187,0.9375,7.5C0.9375,3.88125,3.88125,0.9375,7.5,0.9375C11.1187,0.9375,14.0625,3.88125,14.0625,7.5C14.0625,11.1187,11.1187,14.0625,7.5,14.0625C7.5,14.0625,7.5,14.0625,7.5,14.0625ZM7.5,1.879204C4.40062,1.879204,1.879204,4.40062,1.879204,7.5C1.879204,10.59891,4.40062,13.1208,7.5,13.1208C10.59891,13.1208,13.1208,10.59892,13.1208,7.5C13.1208,4.40062,10.59891,1.879204,7.5,1.879204C7.5,1.879204,7.5,1.879204,7.5,1.879204C7.5,1.879204,7.5,1.879204,7.5,1.879204Z\" fill=\"#BBB\" fill-opacity=\"1\"/></g><g style=\"mix-blend-mode:passthrough\"><path d=\"M7.5,9.868573759536744C7.2412399999999995,9.868573759536744,7.03125,9.658573759536743,7.03125,9.399843759536743C7.03125,9.399843759536743,7.03125,8.607183759536742,7.03125,8.607183759536742C7.03125,7.840293759536743,7.61717,7.254373759536743,8.13467,6.737343759536744C8.51388,6.357653759536744,8.90624,5.965783759536743,8.90624,5.653123759536744C8.90624,4.8717137595367435,8.2753,4.236092759536743,7.5,4.236092759536743C6.71158,4.236092759536743,6.09375,4.844533759536743,6.09375,5.621253759536743C6.09375,5.8799937595367435,5.883765,6.089983759536743,5.625,6.089983759536743C5.366235,6.089983759536743,5.15625,5.879983759536743,5.15625,5.621233759536743C5.15625,4.340623759536744,6.20763,3.298593759536743,7.5,3.298593759536743C8.79237,3.298593759536743,9.84375,4.354683759536743,9.84375,5.653123759536744C9.84375,6.3548437595367435,9.311720000000001,6.886393759536743,8.7975,7.400623759536743C8.38969,7.807493759536743,7.96876,8.228433759536744,7.96876,8.606703759536742C7.96876,8.606703759536742,7.96876,9.399353759536744,7.96876,9.399353759536744C7.96876,9.658123759536743,7.7587600000000005,9.868573759536744,7.5,9.868573759536744C7.5,9.868573759536744,7.5,9.868573759536744,7.5,9.868573759536744Z\" fill=\"#BBB\" fill-opacity=\"1\"/></g></g></g></svg> 这是什么？</a>\
        </div>\
    </div>";
        document.body.appendChild(HTML);
        console.log("[BiLive_PlayWithMeJS] [索码弹窗]", "生成弹窗索要身份码");
    }

    static Hide() {

        document.getElementById("css_PlayWithMeJS_AuthDialog").remove();
        document.getElementById("div_PlayWithMeJS_AuthDialog").remove();
        console.log("[BiLive_PlayWithMeJS] [索码弹窗]", "销毁弹窗与配套样式");
    }

    static Confirm() {
        if (document.getElementById('ipt_PlayWithMeJS_AuthDialog_Input')) {
            let Code = document.getElementById('ipt_PlayWithMeJS_AuthDialog_Input').value;
            if (Code.length >= 13 && Code[0] == 'B') {
                BiLive_PlayWithMeJS.AuthCode = Code;
                BiLive_PlayWithMeJS_AuthDialog.Hide();
                console.log("[BiLive_PlayWithMeJS] [索码弹窗]", "用户提供了身份码：" + Code);
                BiLive_PlayWithMeJS.AppStart();
                return true;
            } else {
                console.error("[BiLive_PlayWithMeJS] [索码弹窗]", "无法读入身份码，身份码非法");
                return false;
            }
        } else {
            console.error("[BiLive_PlayWithMeJS] [索码弹窗]", "无法读入身份码，可能已经错误的销毁了输入框与弹窗");
        }
    }
}

/**
 * UTF-8解码类
 * - decode-utf8
 * - By LinusU
 * - GitHub：https://github.com/LinusU/decode-utf8
 */
class decode_utf8 {
    static toUint8Array(input) {
        if (input instanceof Uint8Array) return input
        if (input instanceof ArrayBuffer) return new Uint8Array(input)

        throw new TypeError('Expected "input" to be an ArrayBuffer or Uint8Array')
    }

    static decodeUtf8(input) {
        const data = decode_utf8.toUint8Array(input)
        const size = data.length

        let result = ''

        for (let index = 0; index < size; index++) {
            let byte1 = data[index]

            // US-ASCII
            if (byte1 < 0x80) {
                result += String.fromCodePoint(byte1)
                continue
            }

            // 2-byte UTF-8
            if ((byte1 & 0xE0) === 0xC0) {
                let byte2 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x1F) << 6) | byte2)
                continue
            }

            if ((byte1 & 0xF0) === 0xE0) {
                let byte2 = (data[++index] & 0x3F)
                let byte3 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3)
                continue
            }

            if ((byte1 & 0xF8) === 0xF0) {
                let byte2 = (data[++index] & 0x3F)
                let byte3 = (data[++index] & 0x3F)
                let byte4 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) | (byte3 << 0x06) | byte4)
                continue
            }
        }

        return result
    }
}