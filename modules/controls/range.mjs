import { Setting } from './setting.mjs';


class Range extends Setting {
    constructor( gameRef, formName, settingName ) {
        super( gameRef, formName, settingName );

        let that = this;
        let initialValue = this.gameRef[settingName].toString();
        this.input.value = initialValue;

        if ( this.preview != null ) {
            this.preview.textContent = initialValue;
            this.input.oninput = function(ev) {
                that.preview.textContent = ev.target.value;
            }
        }

        this.input.onchange = function(ev) {
            that.gameRef[settingName] = Number.parseFloat( ev.target.value );

            let preset = document.querySelector(`#settings-${formName}-preset`);

            if ( preset !== null ) {
                preset.value = '';
            }
        }
    }
}


class DynamicRange extends Setting {
    constructor( params ) {
        super( ...params.baseParams );

        const settings = {
            // FIXME not needed?
            min: null,
            max: null,
            ranges: [],
            reverseRanges: [],
            steps: [],
            labels: []
        };

        for ( const [key] of Object.entries(settings) ) {
            this[key] = params[key];
        }

        let that = this;
        let clearPreset = function() {
            let preset = document.querySelector(`#settings-${params.baseParams[1]}-preset`);

            if ( preset !== null ) {
                preset.value = '';
            }
        }

        if ( this.preview !== null ) {
            this.input.oninput = function( ev ) {
                that._value = that.parseSliderValue( ev.target.value );
                that.preview.textContent = that.getLabel( that.value );
                clearPreset();
            }
        }
        else {
            this.input.onchange = function( ev ) {
                that._value = that.parseSliderValue( ev.target.value );
                clearPreset();
            };
        }

        this.value = params.initialValue !== null ? params.initialValue : this.min;
    }

    set value( val ) {
        if ( this.reverseRanges !== undefined && this.reverseRanges.length > 0 ) {
            let reverse = true;
            this._value = val;
            let sliderValue = this.parseSliderValue( val, reverse );

            if ( this.preview !== null ) {
                this.preview.textContent = this.getLabel( this.value );
            }
            this.input.value = sliderValue;
        }
        else if ( this.steps !== undefined && this.steps.length > 0 ) {
            this._value = val;
            this.input.value = this.steps.indexOf( val );
            this.preview.textContent = val.toString();
        }
        else {
            this._value = val;
        }
    }

    get value() {
        return this._value;
    }

    parseSliderValue( val, reverse = false ) {
        if ( val !== null ) {
            val = Number.parseInt( val );
        }
        let ranges = [];

        if ( reverse ) {
            ranges = this.reverseRanges;
        }
        else {
            ranges = this.ranges;
        }

        if ( ranges !== undefined && ranges.length > 0 ) {
            for ( const range of ranges ) {
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

export { Range, DynamicRange };
