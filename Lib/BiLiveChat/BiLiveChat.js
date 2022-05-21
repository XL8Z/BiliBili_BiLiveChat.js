class BiLiveChat {
    /**
     * 粉丝团等级阈值
     */
    static Threshold = [3, 8, 12, 18];

    /**
     * 把30个粉丝团等级简化为几个，
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
     */
    static GoBottom() {
        document.getElementById("hr_BottomMark").scrollIntoView(false);
    }

    /**
     * 生成i标签粉丝牌
     * - 如果没有牌子则返回空字符串
     * - 不满意可以自己重写
     * @param {String} Name 粉丝牌名字
     * @param {Int} Level 粉丝牌等级
     * @returns 标准的i标签粉丝牌
     */
    static Make_FansMedal(Name, Level) {
        return Level > 0 ? "<i class = 'FansMedal' name='" + Name + "' level='" + Level + "''> </i>" : "";
    }

    /**
     * 根据URL生成img标签头像
     * - 不满意可以自己重写
     * @param {String} URL 
     * @returns 标准的img标签头像
     */
    static Make_Avatar(URL) {
        // 后缀的@64w_64h是B站图床的控制参数，表示64像素宽高
        // 加1-3c还可以控制图像质量和压缩比，不加不压画质
        return "<img class = 'Avatar' src='" + URL + "@64w_64h''/>"
    }

}