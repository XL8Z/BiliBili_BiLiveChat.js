class BiLiveChat {
    /**
     * 粉丝团等级阈值
     */
    static Threshold = [3, 8, 16, 20];

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
    }

    /**
     * 滚动到最底部
     */
    static GoBottom() {
        document.getElementById("hr_BottomMark").scrollIntoView();
    }
}