import { AnswerInput } from './controls/answerinput.mjs';

class Numpad {
    constructor( target ) {
        this.target = target;
        this.availableTargets = ['answer', 'answer2', 'answer3'].map( function(x) {
            // FIXME copy paste set target()
            return new AnswerInput( document.querySelector(`#${x}`) );
        } );
    }

    set target( t ) {
        this._target = new AnswerInput( document.querySelector(`#${t}`) );
    }

    get target() {
        return this._target;
    }

    nextTarget() {
        let targetIds = this.availableTargets.map( function(x) {
            return x.id;
        } );
        let i = targetIds.indexOf( this.target.id );

        if ( i+1 < this.availableTargets.length ) {
            i += 1;
        }
        else {
            i = 0;
        }

        this._target = this.availableTargets[i];

        return i == 0;
    }

    reset() {
        for ( const target of this.availableTargets ) {
            target.reset();
        }

        this._target = this.availableTargets[0];
    }

    setHinted() {
        for ( const target of this.availableTargets ) {
            target.markHinted();
        }
    }

    clear() {
        this.target.clear();
    }

    del() {
        this.target.del();
    }

    append( digit ) {
        this.target.append( digit );
    }

    increment( inc = 1 ) {
        this.target.increment( inc );
    }

    decrement( inc = 1 ) {
        this.target.decrement( inc );
    }
}

export { Numpad };
