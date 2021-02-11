class DynamicRange {
    constructor( params ) {
        const settings = {
            // FIXME not needed?
            min: null,
            max: null,
            ranges: [],
            steps: [],
            labels: []
        };

        for ( const [key] of Object.entries(settings) ) {
            this[key] = params[key];
        }

        this.input   = document.querySelector(`#${params.inputID}`);
        this.preview = document.querySelector(`#${params.previewID}`);

        let that = this;

        if ( this.preview !== null ) {
            this.input.oninput = function( ev ) {
                that.value = that.parseSliderValue( ev.target.value );
                that.preview.textContent = that.getLabel( that.value );
            }
        }
        else {
            this.input.onchange = function( ev ) {
                that.value = that.parseSliderValue( ev.target.value );
            };
        }

        this.value = params.initialValue !== null ? params.initialValue : this.min;
    }

    parseSliderValue( val ) {
        // this might not be needed...
        val = Number.parseInt( val );

        if ( this.ranges !== undefined && this.ranges.length > 0 ) {
            for ( const range of this.ranges ) {
                if ( this.fits(range, val) ) {
                    return this.parseReturnValue( range.returnValue, val );
                }
            }
        }

        if ( this.steps !== undefined && this.steps.length > 0 ) {
            return this.steps[ val ];
        }

        return val;
    }

    fits( range, val ) {
        switch ( range.type ) {
            case '==':
                return val == range.value;
            case '<=':
                return val <= range.value;
            case '<':
                return val < range.value;
            case '>':
                return val > range.value;
            case '>=':
                return val >= range.value;
            case 'default':
                return true;
            default:
                console.warn(`DynamicRange: Wrong range type (${range.type})`);
                return false;
        }
    }

    parseReturnValue( val, sliderVal ) {
        if ( typeof val === 'function' ) {
            return val( sliderVal );
        }
        else {
            return val;
        }
    }

    // FIXME copy paste parseSliderValue
    getLabel( val ) {
        if ( this.labels !== undefined && this.labels.length > 0 ) {
            for ( const label of this.labels ) {
                if ( this.fits(label, val) ) {
                    return this.parseReturnValue( label.returnValue, val );
                }
            }
        }
        else {
            return val.toString();
        }
    }
}

export { DynamicRange };
