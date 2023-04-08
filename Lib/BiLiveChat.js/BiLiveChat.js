class BiLiveChat {

    static Init() {
        // 设置代签服务器地址
        BiLive_PlayWithMeJS_Authorizer.JSONPAuthorizerServer = "http://BiLive.XL7Z.Net/DeveloperHelper/BiliBili/Proxy/BiLiveChatStartWithJSONP";

        BiLiveChat.OverrideJSONPStarter();
        if (window.location.search.includes("AUTOTEST")) {
            this.AutoTest();
            BiLive_PlayWithMeJS.AppStart = () => {
                setInterval(() => { this.AutoTest(); }, 15000)
            }
        };
        BiLiveChat.Outputer = window.document.getElementById('div_BiLiveChatOutputer');

        // 由某喵的代签服务器向B站申请进行WEBSocket长连接，成功了会自动连入
        BiLive_PlayWithMeJS.NewDanmaku = (Evt) => BiLiveChat.NewDanmaku(Evt);
        BiLive_PlayWithMeJS.NewGifts = (Evt) => {
            BiLiveChat.NewGifts(Evt);
            console.log("【￣^￣】");
        }
        BiLive_PlayWithMeJS.NewGuard = (Evt) => {
            Evt.guard_name = BiLiveChat.GuardLevel_ZHCN[Evt.guard_level];
            BiLiveChat.NewGuard(Evt);
        }
        BiLive_PlayWithMeJS.NewSC = (Evt) => BiLiveChat.NewSC(Evt);
        BiLive_PlayWithMeJS.SCDel = (Evt) => BiLiveChat.SCDel(Evt);

        window.BiLiveChat = BiLiveChat;
        if (BiLive_PlayWithMeJS.Paramaters.has("NOHVL"))
            document.getElementById("div_HighVoltageList").style.display = "none";
        BiLive_PlayWithMeJS.Init();
        BiLiveChat.Loaded();
    }

    
    /**
     * 加载成功后回调，需要就自己覆写掉
     */
     static Loaded(){}

    /**
     * 粉丝团等级阈值
     */
    static Threshold = [3, 8, 12];

    /**
     * 把30个粉丝团等级简化为几个
     * - 具体分组方式由 Threshold 设置
     * - 默认[3, 8, 12]把粉丝团等级分为4个
     * - 0到3级为零档，3到8为一档，以此类推，然后为超过12级的老粉做特效
     * @param {Int or String} FansMedalLevel 粉丝牌等级
     * @returns 对应的简化后的CSS样式等级
     */
    static MedalLevelLevel(FansMedalLevel) {
        FansMedalLevel = parseInt(FansMedalLevel);
        for (let index = 0; index < BiLiveChat.Threshold.length; index++) {
            if (FansMedalLevel < BiLiveChat.Threshold[index])
                return index;
        }
        return BiLiveChat.Threshold.length;
    }

    /**
     * 主要输出div
     *
     */
    static Outputer = null;

    /**
     * 滚动到最底部
     * - 注意依赖于默认Documents里位于 #div_BiLiveChatOutputer 下面的 #hr_BottomMark 工作
     */
    static GoBottom() {
        document.getElementById("hr_BottomMark").scrollIntoView(false);
    }

    /**
     * 生成i标签粉丝牌
     * - 如果没有牌子则返回空字符串
     * - 不满意可以自己重写，建议使用 .FansMedal 这个 class
     * @param {string} Name 粉丝牌名字
     * @param {number} Level 粉丝牌等级
     * @returns 标准的i标签粉丝牌
     */
    static Make_FansMedal(Name, Level) {
        return Level > 0 ? "<i class = 'FansMedal' name='" + Name + "' level='" + Level + "'> </i>" : "";
    }

    /**
     * 根据URL生成img礼物Icon【WEBP动图】
     * - 不满意可以自己重写
     * - @128w_128h是B站图床的控制参数，表示128像素宽高
     * - 加1-3c还可以控制图像质量和压缩比，不加不压画质，如@64w_64h_1c
     * @param {number} GiftID 礼物Int类型ID
     * @returns 标准的img标签礼物Icon
     */
    static Make_GiftIcon_WEBP(GiftID) {
        return "<img class = 'GiftIcon' src='" + BiLive_PlayWithMeJS_Gift.Info(GiftID).WEBPImg + "@128w'/>"
    }

    /**
     * 根据URL生成img标签头像
     * - 不满意可以自己重写
     * - @128w_128h是B站图床的控制参数，表示128像素宽高
     * - 加1-3c还可以控制图像质量和压缩比，不加不压画质，如@64w_64h_1c
     * @param {string} URL
     * @returns 标准的img标签头像
     */
    static Make_Avatar(URL) {
        return "<img class = 'Avatar' src='" + URL + "@128w_128h'/>"
    }

    static Num_ZHCN =
        ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
            "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"];

    static GuardLevel_ZHCN = ["粉丝", "总督", "提督", "舰长"]

    static InsertNewItem(EventJSON, HTML) {
        console.log(EventJSON);
        // 生成对象，指定类型为弹幕，参数放入粉丝牌子等级区间、航海等级
        let div = document.createElement("div");
        div.classList.add("div_OutputerItem");
        div.setAttribute("Type", EventJSON.type);
        div.setAttribute("medal_level_level", BiLiveChat.MedalLevelLevel(EventJSON.fans_medal_level));
        div.setAttribute("guard_level", EventJSON.guard_level);
        if (EventJSON.Type = "Danmaku" && BiLive_PlayWithMeJS.UID == EventJSON.uid)
            div.setAttribute("self", true);
        div.innerHTML = HTML;
        BiLiveChat.Outputer.appendChild(div);
        BiLiveChat.GoBottom();
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

    static AutoTest() {
        setTimeout(() => BiLiveChat.NewSystemNotice("开始样式测试，如果你不想要测试，请移除HTML文件里的“BiLiveChat.AutoTest();”调用"), 1100);
        setTimeout(() => BiLive_PlayWithMeJS.Test(BiLiveChat.样本.礼物), 100);
        setTimeout(() => BiLive_PlayWithMeJS.Test(BiLiveChat.样本.弹幕), 3000);
        setTimeout(() => BiLive_PlayWithMeJS.Test(BiLiveChat.样本.上舰), 7000);
        setTimeout(() => BiLive_PlayWithMeJS.Test(BiLiveChat.样本.SC), 9000);
    }

    static NewSystemNotice(通知消息) {
        let Dmk = {
            "data": {
                "fans_medal_level": 21,
                "fans_medal_name": "官方",
                "fans_medal_wearing_status": false,
                "guard_level": 2,
                "msg": 通知消息,
                "timestamp": 1650717881,
                "uid": 3102384,
                "uname": "猫裙少年泽远喵",
                "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                "room_id": 4639581
            },
            "cmd": "LIVE_OPEN_PLATFORM_DM"
        };
        Dmk.data.guard_level = 2;
        Dmk.data.msg = 通知消息;
        BiLive_PlayWithMeJS.Test(Dmk);
    }

    static 样本 = {
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
                "price": 1000,
                "paid": true,
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
                "timestamp": 1652413567,
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

    static OverrideJSONPStarter() {
        BiLive_PlayWithMeJS.AppStart_JSONP = () => {
            if (BiLive_PlayWithMeJS.Paramaters.has("AUTOTEST")) {
                setInterval(() => {
                    this.AutoTest();
                }, 15000)
            } else {
                // 使用JSONP方式获取签名授权进行连接
                let Elmts = document.createElement('script');
                Elmts.src = BiLive_PlayWithMeJS_Authorizer.JSONPAuthorizerServer + "?AuthCode=" + BiLive_PlayWithMeJS.AuthCode;
                document.body.appendChild(Elmts);
                console.log("[BiLive_PlayWithMeJS]", "尝试 第三方JSONP代签 请求 AppStart");
                Elmts.onload = (evt) => {
                    BiLive_PlayWithMeJS.AppStartResponse = BiLiveChat_RemoteAuthorizerResponse;
                    evt.currentTarget.remove();
                    BiLive_PlayWithMeJS.AfterAppStart();
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
        }
    }



    static HighVoltageList_Enable = false;
    static HighVoltageList_TimerCountdownPerCost = 5;

    /**
     * 每秒刷新一次高能榜
     * - 每一个HighVoltageListItem都有自己的超时时间
     * - 到达预设的超时时间后自动移除改项目
     * - JS特性，用setInterval创建的Timer自动运行，不需要干预
     */
    static HighVoltageList_Timer = setInterval(() => {
        if (BiLiveChat.HighVoltageList_Enable) {
            let TsNow = Math.round(new Date() / 1000);
            let List = document.getElementById("div_HighVoltageList").children;
            for (let i = 0; i < List.length; i++) {
                if (parseInt(List[i].getAttribute("timeoutstamp")) <= TsNow)
                    document.getElementById("div_HighVoltageList").removeChild(List[i]);
            }
        }
    }, 1000);

    static MakeHighVoltageList(TimeOutStamp, HTML) {
        let div = document.createElement("div");
        div.classList.add("div_HighVoltageListItem");
        div.setAttribute("timeoutstamp", TimeOutStamp);
        div.innerHTML = HTML;
        document.getElementById("div_HighVoltageList").appendChild(div);
        BiLiveChat.GoBottom();
    }
}