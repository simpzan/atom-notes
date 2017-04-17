'use babel';

const log = console.info.bind(console, "NotesView");

const DocQuery = require("docquery");
const docQuery = this.docQuery = new DocQuery('/Users/simpzan/repo/notes.git', {recursive: true});

const SearchBar = require('./SearchBar');
const NoteListView = require('./NoteListView');
const EditorView = require('./EditorView');

export default class NotesView {

  createViews() {
    this.element = document.createElement('div');
    this.element.classList.add('notes');
    this.element.classList.add('native-key-bindings');

    const searchBar = this.searchBar = new SearchBar();
    this.element.appendChild(searchBar.createView());

    const noteListView = this.noteListView = new NoteListView();
    this.element.appendChild(noteListView.getElement());

    this.editor = new EditorView();
  }

  handleEvents() {
    docQuery.on('ready', () => {
      const notes = docQuery.documents;
      this.noteListView.setNotes(notes);
      this.searchBar.focus();
    });
    const sb = this.searchBar;
    sb.on('enterPressed', () => {
      this.editor.findNext();
    });
    sb.on('navigate', direction => {
      const path = this.noteListView.navigateNoteList(direction);
      this.openAndSearchNote(path);
    });
    sb.on('valueChanged', this.searchNotes);

    this.noteListView.on('noteClicked', path => {
      // select the note in note list
      // open the note
      this.selectThenOpenAndSearchNote(path);
    });
  }

  searchNotes = (value) => {
    const notes = value ? docQuery.search(value) : docQuery.documents;
    this.noteListView.setNotes(notes);

    const note = notes[0];
    if (note) {
      // select note in note list view
      // open the note
      const path = note.filePath;
      this.selectThenOpenAndSearchNote(path);
    }
  }
  selectThenOpenAndSearchNote(path) {
    this.noteListView.selected = path;
    this.openAndSearchNote(path);
  }
  openAndSearchNote(path) {
    return this.openNote(path).then(e => {
      this.editor.searchInNote(this.searchBar.value);
    });
  }
  openNote(path, pending = true) {
      return atom.workspace.open(path, {pending}).then(e => {
        this.searchBar.focus();
      });
  }


  constructor(serializedState) {
    this.createViews();
    this.handleEvents();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {deserializer: 'notes/NotesView'};
  }

  destroy() {
    this.element.remove();
  }

  getElement = () => this.element
  getTitle = () => 'Notes'
  getURI = () => 'atom://note-list'
  getDefaultLocation = () => 'left'
  getAllowedLocations = () => 'left'
}
