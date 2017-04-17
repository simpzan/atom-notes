'use babel';
const log = console.info.bind(console, "NoteListView");

const DocQuery = require("docquery");
const docQuery = this.docQuery = new DocQuery('/Users/simpzan/repo/notes.git', {recursive: true});

const EventEmitter = require('events').EventEmitter

class NoteListView extends EventEmitter {
    constructor() {
        super();
        this.createView();
        docQuery.on('ready', () => {
            const notes = docQuery.documents;
            this.setNotes(notes);
            this.emit('loaded');
        });
    }
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

    navigate(direction) {
        const notes = this.notes, selected = this.selected;
        const count = notes.length;
        let index = notes.findIndex(note => note.filePath === selected);
        index = (index + direction + count) % count;
        const newSelectedNote = notes[index];
        const path = newSelectedNote.filePath;
        this.selected = path;
        return path;
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

    searchNotes(keyword) {
        const notes = keyword ? docQuery.search(keyword) : docQuery.documents;
        this.setNotes(notes);
        return notes;
    }

    setNotes(notes) {
        this.notes = notes;
        this.noteListView.innerHTML = notes.map(doc => {
          return `<li class='list-item' id='${doc.filePath}'>
            <span class='icon icon-file-text'>${doc.fileName}</span>
          </li>`
        }).join('\n');
    }


    getElement = () => this.noteListView
    getTitle = () => 'NoteListView'

}

module.exports = NoteListView;
