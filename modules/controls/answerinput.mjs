class AnswerInput {
    constructor( target ) {
        this.target = target;
    }

    set value( val ) {
        this.target.value = val;
    }

    get value() {
        return this.target.value;
    }

    get id() {
        return this.target.id;
    }

    set placeholder( text ) {
        this.target.setAttribute('placeholder', text || '');
    }

    reset() {
        this.target.value = '';
        this.target.classList.add('preinput');
        this.target.classList.remove('hinted', 'error');
    }

    markCorrect() {
        this.target.classList.remove('error', 'preinput');
    }

    markWrong() {
        this.target.classList.add('error');
    }

    markHinted() {
        this.target.classList.add('hinted');
    }

    clear() {
        this.target.value = '';
    }

    del() {
        let val = this.target.value;
        this.target.value = val.substr(0, val.length-1);
    }

    append( digit ) {
        this.target.value = this.target.value + digit;
    }

    increment( inc = 1 ) {
        let val = Number.parseFloat( this.target.value ) || 0;
        this.target.value = (val + inc).toString();
    }

    decrement( inc = 1 ) {
        let val = Number.parseFloat( this.target.value ) || 0;
        val -= inc;

        if ( val < 1 ) {
            val = 1;
        }

        this.target.value = val.toString();
    }
}

export { AnswerInput };
