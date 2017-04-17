
class NoteListView extends Emitter {
    createView() {
        const noteListView = this.noteListView = document.createElement('ul');
        noteListView.classList.add('list-group');
        this.noteListView.addEventListener('click', e => {
            let item = e.target;
            if (item.nodeName !== 'LI') item = item.parentElement;
            const path = item.id;
            this.emit('noteClicked', path);
        });
    }

    get selected() {
        return this.selectedNote;
    }
    set selected(path) {
        this._selectNote(path);
    }

    _selectNote(path) {
        this.selectedNote = path;
        const items = [].slice.call(this.noteListView.children);
        items.forEach(item => {
            if (item.id === path) item.classList.add('selected');
            else item.classList.remove('selected');
        })
    }

    setNotes(notes) {
        this.noteListView.innerHTML = notes.map(doc => {
          return `<li class='list-item' id='${doc.filePath}'>
            <span class='icon icon-file-text'>${doc.fileName}</span>
          </li>`
        }).join('\n');
    }


    getElement = () => this.noteListView
    getTitle = () => 'NoteListView'

}
