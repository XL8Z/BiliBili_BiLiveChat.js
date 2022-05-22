class BiLiveChat {
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
     * 滚动到最底部
     * - 注意依赖于默认Documents里位于 #div_BiLiveChatOutputer 下面的 #hr_BottomMark
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
     * 根据URL生成img标签头像
     * - 不满意可以自己重写
     * - @128w_128h是B站图床的控制参数，表示128像素宽高
     * - 加1-3c还可以控制图像质量和压缩比，不加不压画质，如@64w_64h_1c
     * @param {string} URL 
     * @returns 标准的img标签头像
     */
    static Make_GiftIcon_WEBP(GiftID) {
        return "<img class = 'GiftIcon' src='" + Gift.Info(GiftID).WEBPImg + "@128w_128h'/>"
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



}