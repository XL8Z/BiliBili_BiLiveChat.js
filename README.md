# BiLiveChat.js
基于PlayWithMe_JS二次开发的纯前端弹幕展示板
纯前端，H5+ES6+CSS3实现

## 使用方式

1.  同步仓库到本地
2.  [加群](https://jq.qq.com/?_wv=1027&k=4JcqejBO)申请直播间的白名单激活代签服务
3.  复制一个完整Demo，改名为你的项目名
4.  修改[BiLiveChat\你的项目\BiLiveChat.html]文件里45行左右的默认直播间ID，如：
```
BiliBili_PlayWithMe.LiveRoomID = 4639581;
```
5.  在[BiLiveChat\你的项目\BiLiveChat.html]的[div_BiLiveChatOutputer]里做静态的前端代码样式，如：  
```
<div class="div_OutputerItem" type="Danmaku" medal_level_level="4" guard_level="2">
    <span class="Time">04:35</span>
    <img class="Avatar" src="http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg@64w_64h" '="">
    <i class="FansMedal" name="官方" level="21" '=""> </i>
    <span class="Nickname">猫裙少年泽远喵</span>
    <span class="Content">连上了喵！</span>
</div>
```
【可以使用[Ctrl]+[F]快速定位】【如果使用默认HTML模板，直接单改CSS也行】  
6.  在[BiLiveChat\你的项目\CustomStyle.css]里编写CSS样式，调试到正确的显示效果
7.  在[BiLiveChat\你的项目\BiLiveChat.html]里重写替换原有绑定事件，按照你的模板插入HTML代码，如：  
```
BiliBili_PlayWithMe.NewDanmaku = (Dmk) => {
        //添加Documents
        Outputer.innerHTML +=
            "<div class='div_OutputerItem' type='Danmaku' \
            medal_level_level=" + BiLiveChat.MedalLevelLevel(Dmk.fans_medal_level) + " \
            guard_level='" + Dmk.guard_level + "' >\
            <span class='Time'>" + Dmk.time + "</span>" +
            Make_Avatar(Dmk.uface) +
            (Dmk.fans_medal_level > 0 ? Make_FansMedal(Dmk.fans_medal_name, Dmk.fans_medal_level) : " ") +
            Dmk.uname + " ： \
            <span class='Content'>" + Dmk.msg + "</span>\
            </div>";
        //滚动到最底部
        BiLiveChat.GoBottom();
    }
```
8.  测试效果，无问题后交付使用


## 引用与鸣谢
- LinusU：decode-utf8.js【用于WEBSocket数据解码】
- 落霞孤鹜：悠哉体中文版【用于完整Demo】
- Sequbre：B站运营提供对接支持


## 二次开发与使用协议
 **当你基于BiLiveChat与其他我们的开源项目进行二次开发时，我们视作您已经认同并知晓以下信息**  
本项目为开源项目，但我方并未放弃任何权利，仅默认允许他人使用本项目的代码、设计、服务和其他资源  
 **我方有权利单方面对任何直播间进行封锁和屏蔽，随时可以停止服务** 


### 二次开发者的义务
-  **二次定制开发需要在文件包内部添加声明文件，公示所引用的一切资源，包括但不限于：字体、开源代码、网站上下载其他美术素材**  
 _对于已付费买断商用权利的内容不做强制要求_  
- 付费定制中，甲方有权并应知悉乙方二次开发的工作范围与工作量与其具体价格，乙方应明确告知甲方工作内容与收费原因


### 以下行为可能会导致涉事的直播间被停用、封锁、屏蔽，或二次创作者备案信息被我方公开
-  **恶意移除本文件与其他权利声明文件**  
-  **二次定制开发恶意抹除项目原始归属信息，或包装为自己的纯原创项目** 
- 未对甲方声明本项目的存在与已完成内容，拒绝明确告知对方哪些部分属于定制
- 接到举报有侵权问题，包括但不限于使用了禁止商用或者仅限个人私用的代码与素材，经核实属实
- 对本项目已有部分进行收费，或巧立名目对甲方收取明显超过大众认知中合理价格的费用
- 二次定制开发单版本分发超过1人未明确告知用户，以欺诈为目的的一稿多售
- 普适版本的一稿多售价格明显过高【定制开发均价的25%】【这里不强制要求，但我方保留质疑的权利】
-  **对于可能涉嫌隐瞒、欺诈与不当盈利的二次定制开发，我方有权无限期暂停对涉事直播间的长链授权，并书面公示所有涉事画师与前端程序员的涉事帐号** 
 **我方有权在取得谅解与完成和解后仍保留公示信息，望好自为之** 


### 我们认同并支持以下行为
- 二次开发者不对定制版本进行混淆加密，便于使用过程中甲方自行微调
- 二次开发者使用变量、CSS3等新技术精心设计代码结构
- 二次开发者提交自己练习、展示用途的非商用稿件到开源案例，在自我宣传的同时充分照顾新人主播


## 最后对某些人说句题内的题外话
有能耐就自己看懂代码照着做一个，没能耐就给我忍着，别整那套拿别人东西抹掉各种信息装原创骗钱的活骗新人小V的钱  
你大可继续自己令人唾弃的龌龊，当一个理直气壮的灰产小子，赚自己的快钱  
但请你记住，你要面对的是整个圈子的道德审判，以及来自一个小学就开始搞计算机，在相关领域摸鱼了16年的IT从业者的绝对恶意  
不要等身败名裂，等社会正义的铁拳砸下来了才哭诉自己遭遇了恐怖的网络暴力  
互联网是有记忆的，网络暴力只有你身份证或者你的帐号注销了才会停止  
 **勿谓言之不预也**  
