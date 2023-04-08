var 样本 = {
    "弹幕": {
        "自己的弹幕": {
            "dm_type": 0,// 弹幕类型，0普通，1纯表情，目前只有0和1
            "emoji_img_url": "",// 如果是表情弹幕，这里会给出表情的图片
            "fans_medal_level": 22,// 发弹幕者在当前直播间的粉丝团等级
            "fans_medal_name": "Anti粉",// 当前直播间内的粉丝牌名字
            "fans_medal_wearing_status": false,// 他是否佩戴了这个粉丝牌
            "guard_level": 0,// 舰队等级
            "msg": "喵喵喵喵喵",// 弹幕内容
            "timestamp": 1672338197,// UNIX时间戳
            "uid": 3102384,// 发弹幕用户的B站UID
            "uname": "猫裙少年泽远喵",// 发弹幕用户的昵称
            "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",// 头像，万恶的头像【Blivechat：谢谢脑瓜子已经在疼了】
            "msg_id": "b706a698-1efc-4a70-a7d0-0ac41098e51b",// 一个随机生成的UUID，用于防重复，可以不管
            "room_id": 4639581,// 该直播间的直播间ID
            "type": "Danmaku",// 事件类型，备用
            "user_tag": "Self"// 用户的特殊身份，目前只有Self=主播本人
        },
        "表情弹幕":
        {
            "dm_type": 1,// 弹幕类型，0普通，1纯表情，目前只有0和1
            "emoji_img_url": "http://i0.hdslb.com/bfs/live/7b7a2567ad1520f962ee226df777eaf3ca368fbc.png",// 如果是表情弹幕，这里会给出表情的图片
            "fans_medal_level": 0,// 发弹幕者在当前直播间的粉丝团等级
            "fans_medal_name": "",// 当前直播间内的粉丝牌名字
            "fans_medal_wearing_status": false,// 他是否佩戴了这个粉丝牌
            "guard_level": 0,// 舰队等级
            "msg": "妙啊",// 弹幕内容
            "timestamp": 1672339037,// UNIX时间戳
            "uid": 1680630163,// 发弹幕用户的B站UID
            "uname": "缇思teath",// 发弹幕用户的昵称
            "uface": "https://i1.hdslb.com/bfs/face/55ba3aab8307c75cfdb5d39486bafd4d98e107d6.jpg",// 头像，万恶的头像【Blivechat：谢谢脑瓜子已经在疼了】
            "msg_id": "5125d1df-d80d-4ad1-b3dd-b22a36d57709",// 一个随机生成的UUID，用于防重复，可以不管
            "room_id": 4639581,// 该直播间的直播间ID
            "type": "Danmaku",// 事件类型，备用
            "user_tag": ""// 用户的特殊身份，目前只有Self=主播本人
        }
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