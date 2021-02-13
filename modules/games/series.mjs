import { Game } from './gamebase.mjs';
import * as Random from '../random.mjs';


class Series extends Game {
    constructor( params ) {
        super({
            paneName: 'seriesframe',
            settingsPaneName: 'SettingsSeries',
            iconsPosition: 'top',
            answerPlaceholder: 'Bet',
            selectedSeries: ["tier", "orphelins", "vousins du zero", "0-spiel"],
            seriesBet: {
                tier: 6,
                orphelins: 5,
                "vousins du zero": 9,
                "0-spiel": 4
            },

            // FIXME make these required params or sth
            minBet: null,
            maxBet: null,
            step: null,

            current: {
                series: null,
                money: null,
                bet: null,
                totalBet: null,
                rest: null
            }
        }, params);

        this.settings = {
            minBet: this._minBet,
            maxBet: this._maxBet,
            step: this._step
        };
        this.controls = document.getElementsByClassName("control-series");
    }

    set minBet( dynamicRange ) {
        if ( dynamicRange !== null && typeof dynamicRange == 'object' ) {
            this._minBet = dynamicRange;
        }
    }

    get minBet() {
        let seriesMinimum = this.coeff * 5;

        return this._minBet.value || seriesMinimum;
    }

    set maxBet( dynamicRange ) {
        if ( dynamicRange !== null && typeof dynamicRange == 'object' ) {
            this._maxBet = dynamicRange;
        }
    }

    get maxBet() {
        return this._maxBet.value;
    }

    set step( dynamicRange ) {
        if ( dynamicRange !== null && typeof dynamicRange == 'object' ) {
            this._step = dynamicRange;
        }
    }

    get step() {
        return this._step.value;
    }

    get coeff() {
        return this.seriesBet[ this.current.series ];
    }

    next() {
        this.current.series = Random.elem( this.selectedSeries );

        this.current.money = this.minBet + this.getRandomSteps();

        // how many 5s fit in money?
        this.current.bet = this.current.money / this.coeff;
        // get the highest multiple of 5s from the above number
        this.current.bet = Math.floor(this.current.bet / 5) * 5;
        this.current.totalBet = this.current.bet * this.coeff;
        this.current.rest = this.current.money - this.current.totalBet;
    }

    redraw() {
        super.redraw();
        this.setSeriesName();
        this.setMoney();
    }

    setSeriesName() {
        let visibleSeriesName = this.current.series;
        let seriesNameElem = document.querySelector("#seriesName");

        seriesNameElem.classList.remove("narrow");

        if ( visibleSeriesName == "vousins du zero" ) {
            visibleSeriesName = "v. du zero";
            seriesNameElem.classList.add("narrow");
        }

        seriesNameElem.textContent = visibleSeriesName;
    }

    setMoney() {
        document.querySelector("#seriesMoney").textContent = this.current.money;
    }

    onPaneHide() {
        for ( let i = 0; i < this.controls.length; i++ ) {
            this.controls[i].classList.add("invisible");
        }
    }

    onPaneShow() {
        super.onPaneShow();

        for ( let i = 0; i < this.controls.length; i++ ) {
            this.controls[i].classList.remove("invisible");
        }
    }

    checkAnswerCondition( answer ) {
        return answer == this.getCurrentField();
    }

    onCorrectAnswer() {
        return this.ctx.numpad.nextTarget();
    }

    getCurrentField() {
        let fieldName = {
            answer: 'bet',
            answer2: 'totalBet',
            answer3: 'rest'
        }[ this.ctx.numpad.target.id ];

        return this.current[ fieldName ];
    }

    setCurrentAnswer() {
        this.ctx.numpad.target.value = this.getCurrentField();
    }

    showResult() {
        this.ctx.numpad.reset();

        this.setCurrentAnswer();
        this.ctx.numpad.nextTarget();

        this.setCurrentAnswer();
        this.ctx.numpad.nextTarget();

        this.setCurrentAnswer();
        // This is pretty awkward :(
        // There's no nextTarget() for the third time,
        // because we want the focus to be on the last input,
        // so that when we hit 'Enter' or click 'Submit' button,
        // the game refreshes...

        this.ctx.numpad.setHinted();
    }
}

export { Series };
