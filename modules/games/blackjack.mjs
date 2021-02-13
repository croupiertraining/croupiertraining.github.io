import { Game } from './gamebase.mjs';

class BlackJack extends Game {
    constructor() {
        super({
            paneName: 'bjframe',
            settingsPaneName: 'SettingsBJ',
            iconsPosition: 'top',
            minBet: 10,
            maxBet: 100,
            step: 5,
            current: {
                money: null,
                payout: null
            }
        });
    }

    next() {
        let money = this.minBet;
        this.current.money = money + this.getRandomSteps();
        this.current.payout = this.current.money * 1.5;
    }

    redraw() {
        super.redraw();
        document.querySelector("#bjMoney").textContent = this.current.money;
    }

    onPaneHide() {
        this.$('btDel').innerHTML = '&#8592;';
    }

    onPaneShow() {
        super.onPaneShow();

        this.$("btDel").textContent = ".50";
    }

    checkAnswerCondition( answer ) {
        return Number.parseFloat(answer) == this.current.payout;
    }

    setResult() {
        this.ctx.numpad.target.value = this.current.payout;
    }
}

export { BlackJack };
