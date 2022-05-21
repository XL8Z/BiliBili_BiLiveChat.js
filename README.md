# BiLiveChat.js
基于PlayWithMe_JS二次开发的纯前端弹幕展示板  
纯前端，H5+ES6+CSS3实现

## 功能简介
-  通过B站官方开放平台接口接收B站直播间数据，长期有效
-  纯前端实现，直接导入OBS或直播姬
-  完全开源，简单易懂
-  从弹幕和礼物事件的处理到构建HTML的Document Element，整个流程结构清晰完全透明，可以自己自由定义
-  妈宝级的注释【十年来写的最多的一次】
### 更新
- 2022年5月21日 傍晚 更新了多个相同礼物的连击合并功能
### 画饼
- 黑白名单屏蔽功能
- 过低等级和无粉丝团路人屏蔽功能
- 舰长和高等级老粉进入事件【待官方提供】
- Up主表情和直播间表情支持

## 完整Demo预览
### 直接打开
![预览图](/预览_Chrome.png)
### 浏览器源导入OBS
![预览图](/添加到OBS.png)
### 实际效果
![预览图](/预览_直播.png)

## 心里堵得慌不吐不快的牢骚
GayHub不是打不开，就是反俄整西方那套话语权的烂活  
GitEE各种弱智废物，早不做审核和监管，上面发话了就乱成一团，连申请开源的功能都一堆Bug【见CNMSBGitEE.png】  
Coding半死不活，开源功能实际上基本屏蔽了，只能拿来当私有代码仓库用  
我是真的被恶心了一晚上，这里请允许我代表中国IT行业基层码农向非要在开源里搞政治的白皮傻逼们竖个中指  
别问，问就 #StandWithRussia #DepoliticizationNow   

## 使用方式

1.  同步仓库到本地
2.  [加Q群248810727](https://jq.qq.com/?_wv=1027&k=4JcqejBO)申请直播间的白名单激活代签服务
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
```
CSS选择器参考如下

:root
变量字段

#div_BiLiveChatOutputer
主要输出区域

#div_BiLiveChatOutputer>.div_OutputerItem
一个独立的内容【弹幕、礼物、上舰】

#div_BiLiveChatOutputer>.div_OutputerItem[type="Danmaku"]
弹幕内容

#div_BiLiveChatOutputer>.div_OutputerItem[medal_level_level='0']
粉丝团等级区间范围为0的内容
【当粉丝团等级分段设为[3,10,16,20]时，18级牌子的粉丝团等级区间为3】
【详见MedalLevelLevel说明】

#div_BiLiveChatOutputer>.div_OutputerItem[guard_level='3']
舰长发出的内容

选择器可以叠加，如：
#div_BiLiveChatOutputer>.div_OutputerItem[type="Danmaku"][guard_level='2']
为提督的弹幕内容

#div_BiLiveChatOutputer>.div_OutputerItem[type="Danmaku"]:not([guard_level='0'])
所有舰队【舰长、提督、总督】的弹幕内容
```
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

## 注意：遇事不决，把一下文件仔细看一遍，留意注释
- 完整Demo\BiLiveChat.html  
【内含全部应该由你控制的HTML和JS代码，你应该全文看完】
- 完整Demo\CustomStyle.css   
【内含全部应该由你控制的CSS样式代码】
- Lib\BiLiveChat\BiLiveChat.js  
【一些通用的处理，比如滚动到底或者自动生成粉丝牌子】
- Lib\BiLiveChat\BiLiveChat.css  
【一些通用的样式，比如关闭主要面板的滚动条显示，或者平滑滚动特效】
- Lib\BiLiveChat\BiliBili_PlayWithMe_JSONP.js   
【通用的B站直播开放平台 JavaScript SDK，如果你好奇如何与B站通讯，或者作为初学者需要东西助眠，可以去看看】



## 引用与鸣谢
- LinusU：decode-utf8.js【用于WEBSocket数据解码】
- 落霞孤鹜：悠哉体中文版【用于完整Demo】
- Sequbre：B站运营提供对接支持


## 二次开发与使用协议
 **当你基于BiLiveChat与其他我们的开源项目进行二次开发时，我们视作您已经认同并知晓以下信息**  
本项目为开源项目，但我方并未放弃任何权利，仅默认允许他人使用本项目的代码、设计、服务和其他资源  
 **我方有权利单方面对任何直播间进行封锁和屏蔽，随时可以停止服务** 


### 二次开发者的义务
-  **二次开发需要在文件包内部添加声明文件，公示所引用的一切资源，包括但不限于：字体、开源代码、网站上下载其他美术素材**  *【对于已付费买断商用权利的内容不做强制要求】*  
- 付费定制中，甲方有权并应知悉乙方二次开发的工作范围与工作量与其具体价格，乙方应明确告知甲方工作内容与收费原因


### 以下行为可能会导致涉事的直播间被停用、封锁、屏蔽，二次创作者备案信息被我方公开，甚至内部沟通后B站官方封禁
-  **<font size=4>以欺诈目的骗取签名，实际利用本插件的代签服务用于其他目的，如弹幕游戏【你他喵的自己不会申请开发者帐号么？】</font>**
-  **<font size=4>恶意移除本文件与其他权利声明文件</font>**  
-  **<font size=4>二次定制开发恶意抹除项目原始归属信息，或包装为自己的纯原创项目</font>** 
- **未对甲方声明本项目的存在与已完成内容，拒绝明确告知对方哪些部分属于定制**
- **接到举报有侵权问题，包括但不限于使用了禁止商用或者仅限个人私用的代码与素材，经核实属实**
- 对本项目已有部分进行收费，或巧立名目对甲方收取明显超过大众认知中合理价格的费用
- 二次定制开发单版本分发超过1人未明确告知用户，以欺诈为目的的一稿多售
- 普适版本的一稿多售价格明显过高【定制开发均价的25%】【这里不强制要求，但我方保留质疑的权利】
-  **对于可能涉嫌隐瞒、欺诈与不当盈利的二次定制开发，我方有权无限期暂停对涉事直播间的长链授权，并书面公示所有涉事画师与前端程序员的涉事帐号** 
 **我方有权在取得谅解与完成和解后仍保留公示信息，望好自为之** 


### 我们认同并支持以下行为
- **二次开发者不对定制版本进行混淆加密，便于使用过程中甲方自行微调**
- 二次开发者使用CSS的变量、伪类选择器等新技术精心设计代码结构，尽可能写出更清晰的代码
- 
- 二次开发者提交自己练习、展示用途的非商用稿件到开源案例，在自我宣传的同时充分照顾新人主播  
【建议在稿件中写好联系方式，万一有新人喜欢想找你定制呢？】


## 最后对某些人说句题内的题外话
有能耐就自己看懂代码照着做一个，没能耐就给我忍着，别整那套拿别人东西抹掉各种信息装原创骗钱的烂活，一套两三百，去骗新人小V的钱  
你大可继续自己令人唾弃的龌龊，当一个理直气壮的灰产小子，赚自己的快钱  
但请你记住，你要面对的是整个圈子的道德审判，以及来自一个小学就开始搞计算机，在相关领域摸鱼了16年的IT从业者的绝对恶意  
不要等身败名裂，等社会正义的铁拳砸下来了才哭诉自己遭遇了恐怖的网络暴力  
互联网是有记忆的，网络暴力只有你身份证或者你的帐号注销了才会停止  
 **<font size=7>勿谓言之不预也</font>**  
