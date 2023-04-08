/**
 * 弹幕样式中文名
 */
BiLiveChat.Name = "大道至简"

/**
* 弹幕样式设计者
*/
BiLiveChat.Artist = "黑喵小姐";

/**
 * 弹幕样式编写者
 */
BiLiveChat.Developer = "猫裙少年泽远喵";

/**
* 最后更新
*/
BiLiveChat.LastUpdate = "2022.12.31";

/**
* 显示弹幕样式信息
*/
BiLiveChat.ShowDetail = true;

/**
 * 允许纯表情包弹幕【弹幕表情与直播间专属表情】
 */
AllowEmoticonDanmaku = true;

// 启动礼物连击合并
BiLive_PlayWithMeJS.GiftCombine_Enable = true;
// 连击超时判定，默认为5，即5秒内没有再送同种礼物判定连击结束
BiLive_PlayWithMeJS.GiftCombine_Countdown = 5;

/**
 * 粉丝团等级阈值
 * - 把粉丝团等级分为4个
 * - 0到3级为零档，3到8为一档，以此类推，然后为超过12级的老粉做特效
 * - 后面的 BiLiveChat.MedalLevelLevel(fans_medal_level) 就是在计算这玩意
 */
BiLiveChat.Threshold = [3, 8, 12];

// 收到新弹幕后会触发下面的 BiLive_PlayWithMeJS.NewDanmaku 方法，在这里写你自己的JS代码
// Dmk 的值如下
let 弹幕数据样本 = {
    "dm_type": 0,//弹幕类型 0：普通弹幕 1：表情包弹幕
    "emoji_img_url": "", //表情包图片地址
    "fans_medal_level": 21,
    "fans_medal_name": "官方", // 粉丝勋章名【注意只会显示当前直播间的粉丝团勋章】
    "fans_medal_wearing_status": false, // 当前是否佩戴主播勋章【建议忽略，强制显示该主播的勋章】
    "guard_level": 0, // 对应的大航海等级 1总督 2提督 3舰长
    "msg": "你们谁扔个小心心呗",
    "time": "20:44", // 某喵自己加的字段，方便你们打时间戳
    "timestamp": 1650717881, // UNIX时间戳
    "uid": 3102384, // 发弹幕DD的UID
    "uname": "猫裙少年泽远喵", // 发弹幕DD的昵称
    "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
    "room_id": 4639581
};

BiLiveChat.NewDanmaku = (Dmk) => {
    //添加Documents
    let HTML =
        `<!-- 生成头像 -->
        ${BiLiveChat.Make_Avatar(Dmk.uface)}
        <!--  生成粉丝牌 -->
        ${BiLiveChat.Make_FansMedal(Dmk.fans_medal_name, Dmk.fans_medal_level)}
        <!-- 生成昵称 -->
        <span class='NickName'>${Dmk.uname}</span>
        <!-- 生成内容 -->
        <span class='Content'>${Dmk.msg}</span>`;
    BiLiveChat.InsertNewItem(Dmk, HTML);
}

BiLiveChat.NewEmoticonDanmaku = (Dmk) => {
    let HTML =
        `<!-- 生成头像 -->
        ${BiLiveChat.Make_Avatar(Dmk.uface)}
        <!--  生成粉丝牌 -->
        ${BiLiveChat.Make_FansMedal(Dmk.fans_medal_name, Dmk.fans_medal_level)}
        <!-- 生成昵称 -->
        <span class='NickName'>${Dmk.uname}</span>
        <!-- 生成内容 -->
        <img class='Content' src='${Dmk.emoji_img_url}' />`;
    BiLiveChat.InsertNewItem(Dmk, HTML);
}

// 收到新礼物后会触发下面的 BiLive_PlayWithMeJS.NewGifts 方法，在这里写你自己的JS代码
// Gft 的值如下
let 礼物数据样本 = {
    "uid": 114439178,
    "uname": "不忘韩文初心",
    "uface": "http://i2.hdslb.com/bfs/face/e549b18085113c6f824c0eefaf2c9d9dcaf5a1d5.jpg",
    "gift_id": 30607,
    "gift_name": "小心心",
    "gift_num": 1,
    "price": 0, //道具金瓜子估值(1000 = 1元 = 10电池)，盲盒会显示爆出道具的价值
    "paid": false, //是否收费道具
    "fans_medal_level": 25,
    "fans_medal_name": "喵小姐", // 粉丝勋章名【注意只会显示当前直播间的粉丝团勋章】
    "guard_level": 3, // 对应的大航海等级 1总督 2提督 3舰长
    "time": "20:44", // 某喵自己加的字段，方便你们打时间戳
    "timestamp": 1650717898, // UNIX时间戳
    "anchor_info": {
        "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
        "uid": 3102384,
        "uname": "猫裙少年泽远喵"
    }
};
BiLiveChat.NewGifts = (Gft) => {
    let GiftInfo = BiLive_PlayWithMeJS_Gift.Info(Gft.gift_id);
    //添加Documents
    let HTML = "";
    if (Gft.paid) {
        HTML =
            `<div class='Head'>
            <!-- 生成头像 -->
            ${BiLiveChat.Make_Avatar(Gft.uface)}
            <!-- 生成昵称 -->
            <span class='NickName'>${Gft.uname}</span>
            <!-- 生成价格 -->
            <span class="Price">￥${Gft.price / 100}</span>
        </div>
        <div class='Content'>
            <!-- 生成数量 -->
            <span>${Gft.gift_num} 个 ${Gft.gift_name}</span>
        </div>
        <!-- 生成Icon -->
        ${BiLiveChat.Make_GiftIcon_WEBP(Gft.gift_id)}`;
    } else {
        HTML =
            `<!-- 生成头像 -->
            ${BiLiveChat.Make_Avatar(Gft.uface)}
            <!-- 生成昵称 -->
            <span class='NickName'>${Gft.uname}</span>
            <!-- 生成文本 -->
            <span class='Content'>${Gft.gift_num} 个 ${Gft.gift_name}</span>
            <!-- 生成Icon -->
            ${BiLiveChat.Make_GiftIcon_WEBP(Gft.gift_id)}`;
    }
    BiLiveChat.InsertNewItem(Gft, HTML);
}

//查询礼物ID为1的辣条信息，调用 Gift.Info(1) 内容如下
Gift数据库里辣条数据 = {
    "Name": "辣条",
    "Desc": "辣条是流行于哔哩哔哩的坊间美食，可以直接食用，也能用来打赌。",
    "GiftType": 0,
    "Price": 100,
    "StlcImg": "https://s1.hdslb.com/bfs/live/d57afb7c5596359970eb430655c6aef501a268ab.png",
    "StlcImg_Mini": "https://i0.hdslb.com/bfs/live/d57afb7c5596359970eb430655c6aef501a268ab.png",
    "GIFImg": "https://i0.hdslb.com/bfs/live/d40ff17d533047cbb9b2bed4feb927cb0e71901c.gif",
    "WEBPImg": "https://i0.hdslb.com/bfs/live/07d4dad91d7f68d92cb6a324ad9395ae2adefd47.webp"
};

// 粉丝上舰后会触发下面的 BiLive_PlayWithMeJS.NewGuard 方法，在这里写你自己的JS代码
// Grd 的值如下
let 上舰数据样本 = {
    "user_info": {
        "uid": 1270482,
        "uname": "Sequbre",
        "uface": "http://i0.hdslb.com/bfs/face/061e978938b8a60b4920fad15596657e77465170.jpg"
    },
    "guard_level": 2, // 对应的大航海等级 1总督 2提督 3舰长
    "guard_name": "提督", // 某喵自己加的字段，给你省一波判断
    "guard_num": 1,
    "guard_unit": "月",
    "time": "11:46", // 某喵自己加的字段，方便你们打时间戳
    "timestamp": 1652413567, // UNIX时间戳
    "fans_medal_level": 24, // 粉丝勋章等级
    "fans_medal_name": "官方", // 粉丝勋章名【注意只会显示当前直播间的粉丝团勋章】
    "fans_medal_wearing_status": true, // 当前佩戴的粉丝勋章佩戴状态
    "msg_id": "982ce571-5242-4b73-a82e-3087a958be7b", // 随机UUID，防止数据错误导致一条信息被发送多次
    "room_id": 4639581
};
BiLiveChat.NewGuard = (Grd) => {
    let DateTime = BiLive_PlayWithMeJS_UtilTools.Timestamp2DateObj(Grd.timestamp);
    let Price = 198;
    for (let i = Grd.guard_level; i < 3; i++) {
        Price = Price * 10;
    }
    switch (Grd.guard_unit) {
        case "月":
            Price = Price * Grd.guard_num;
            break;
        case "年":
            Price = Price * Grd.guard_num * 12;
            break;
    }
    //添加Documents
    let HTML =
        `<div class='Head'>
            <!-- 生成头像 -->
            ${BiLiveChat.Make_Avatar(Grd.user_info.uface)}
            <!-- 生成昵称 -->
            <span class='NickName'>${Grd.user_info.uname}</span>
            <!-- 生成价格 -->
            <span class="Price">￥${Price}</span>
        </div>                         
        <div class='Content'>
            <!-- 生成数量 -->
            <span>上了 ${Grd.guard_num} 个 ${Grd.guard_unit} 的 ${Grd.guard_name}</span>
        </div>
        <!-- 生成Icon -->
        ${BiLiveChat.Make_GiftIcon_WEBP(Grd.guard_level + 10000)}`;
    BiLiveChat.InsertNewItem(Grd, HTML);
}


// 老板打SC后会触发下面的 BiLive_PlayWithMeJS.NewSC 方法，在这里写你自己的JS代码
// SC 的值如下
let SC数据样本 = {
    "guard_level": 0,
    "uid": 1270482,
    "uname": "Sequbre",
    "uface": "http://i0.hdslb.com/bfs/face/061e978938b8a60b4920fad15596657e77465170.jpg",
    "message_id": 3992851, // SC 的 ID，撤回用
    "message": "进行一个鱼的摸",
    "rmb": 30,
    "time": "11:46", //某喵自己加的字段，方便你们打时间戳
    "timestamp": 1652413567, // UNIX时间戳
    "start_time": 1652413567, // SC开始时间
    "end_time": 1652413627, // SC过期事件
    "fans_medal_level": 0,
    "fans_medal_name": "官方", // 粉丝勋章名【注意只会显示当前直播间的粉丝团勋章】
    "fans_medal_wearing_status": true, //当前佩戴的粉丝勋章佩戴状态
    "msg_id": "968e07ea-49e6-478c-867e-b721ccbd0d62",
    "room_id": 4639581
};
BiLiveChat.NewSC = (SC) => {
    let DateTime = BiLive_PlayWithMeJS_UtilTools.Timestamp2DateObj(SC.timestamp);
    //添加Documents
    let HTML =
        `<div class='Head'>
        <!-- 生成头像 -->
        ${BiLiveChat.Make_Avatar(SC.uface)}
        <!-- 生成昵称 -->
        <span class='NickName'>${SC.uname}</span>
        <!-- 生成价格 -->
        <span class="Price">￥${SC.rmb}</span>
    </div>
    <div class='Content'>
        <p>${SC.message}</p>
    </div>`;
    BiLiveChat.InsertNewItem(SC, HTML);
}

