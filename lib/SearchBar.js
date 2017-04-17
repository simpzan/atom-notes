
class SearchBar extends Emitter {
    createView() {
        const input = this.input = document.createElement('input');
        input.classList.add('input-text');
        this.input.addEventListener('keyup', e => {
            const keyCode = e.keyCode;
            const UP = 38, DOWN = 40, ENTER = 13;
            if (keyCode === UP) {
            } else if (keyCode === DOWN) {
            } else if (keyCode === ENTER) {
            } else {
            }
            this.emit('valueChanged', this.value);
        });
    }

    focus() {
        this.input.focus();
        this.input.focus();
    }
    get value() {
        return this.input.value;
    }
    set value(value) {
        this.input.value = value;
    }

    getElement = () => this.input
    getTitle = () => 'SearchBar'

}

module.exports = SearchBar;
