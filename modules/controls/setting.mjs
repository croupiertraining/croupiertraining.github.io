class Setting {
    constructor( gameRef, formName, settingName ) {
        this.gameRef = gameRef;
        this.settingName = settingName;

        this.input = document.querySelector(`#settings-${formName}-${settingName}`);
        this.preview = document.querySelector(`#preview-${formName}-${settingName}`);
    }

    set value( val ) {
        val = val.toString();

        this.input.value = val;

        if ( this.preview !== null ) {
            this.preview.textContent = val;
        }
    }

    get value() {
        return this.input.value;
    }
}

export { Setting };
