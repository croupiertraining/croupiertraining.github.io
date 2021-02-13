import * as Random from '../random.mjs';


class Game {
    constructor( settings, params ) {
        for ( const [key, val] of Object.entries(settings) ) {
            this[key] = val;
        }

        if ( params !== null && params !== undefined ) {
            for ( const [key, val] of Object.entries(params) ) {
                this[key] = val;
            }
        }

        // this will hold Setting refs
        this.settings = {};
        this.presets = [];
    }

    $(id, doc) {
        return document.querySelector(`#${id}`);
    }

    refresh() {
        this.next();
        this.redraw();
    }

    redraw() {
        this.ctx.numpad.reset();
    }

    setPreset( presetName ) {
        let preset = this.presets[ presetName ];

        if ( preset ) {
            for ( const [setting, value] of Object.entries(preset) ) {
                this.settings[ setting ].value = value;
                this[ setting ] = value;
            }
        }
    }

    getRandomSteps() {
        let maxSteps = Math.floor((this.maxBet - this.minBet)/this.step) + 1;

        return this.step * Random.int( 0, maxSteps );
    }

    onPaneHide() {
    }

    onPaneShow() {
        this.ctx.numpad.target.placeholder = this.answerPlaceholder;

        if ( this.iconsPosition == 'top' ) {
            this.$('icons').classList.add('top');
        }
        else {
            this.$('icons').classList.remove('top');
        }
    }

    checkAnswer() {
        let input = this.ctx.numpad.target;
        let answer = input.value;

        if ( this.checkAnswerCondition(answer) ) {
            input.markCorrect();

            let wantRefresh = this.onCorrectAnswer();

            if (wantRefresh) {
                let that = this;
                setTimeout( function(){ that.refresh() }, 200 );
            }
        }
        else {
            input.markWrong();
            this.onWrongAnswer();
        }
    }

    checkAnswerCondition( answer ) {
        return false;
    }

    onCorrectAnswer() {
        // By default, want refresh
        return true;
    }

    onWrongAnswer() {
    }

    showResult() {
        this.ctx.numpad.reset();
        this.ctx.numpad.setHinted();
        this.setResult();
    }
}

export { Game };
