'use babel';

const DocQuery = require("docquery");
const log = console.info.bind(console, "NotesView");
const markerLayers = new WeakMap;
const docQuery = this.docQuery = new DocQuery('/Users/simpzan/repo/notes.git', {recursive: true});
const SearchBar = require('./SearchBar');
const NoteListView = require('./NoteListView');

export default class NotesView {
  getMarkerLayer(editor) {
      let layer = markerLayers.get(editor);
      if (!layer) {
        layer = editor.addMarkerLayer({maintainHistory: false});
        markerLayers.set(editor, layer);

        this.resultsLayerDecoration = editor.decorateMarkerLayer(layer, {type: 'highlight', class: 'find-result'});
      }
      return layer;
  }

  searchInNote() {
    const editor = this.lastEditor
    const layer = this.getMarkerLayer(editor);
    layer.getMarkers().forEach(marker => marker.destroy());
    const ranges = this.ranges = window.ranges = [];
    this.current = 0;
    editor.scan(new RegExp(this.searchBar.value, 'g'), obj => {
      const range = obj.computedRange;
      ranges.push(range);
      layer.markBufferRange(range, {invalidate: 'inside'});
    })
    const range = ranges[0];
    if (range) editor.scrollToBufferPosition(range.start)
  }
  findNext = () => {
    const ranges = this.ranges, count = ranges.length;
    if (count === 0) {
      return log("not found");
    }
    const index = (this.current + 1 + count) % count;
    this.current = index;
    const range = ranges[index];
    this.lastEditor.scrollToBufferPosition(range.start);
  }

  createViews() {
    this.element = document.createElement('div');
    this.element.classList.add('notes');
    this.element.classList.add('native-key-bindings');

    const searchBar = this.searchBar = new SearchBar();
    this.element.appendChild(searchBar.createView());

    const noteListView = this.noteListView = new NoteListView();
    this.element.appendChild(noteListView.getElement());
  }

  loadNotes() {
    docQuery.on('ready', () => {
      const notes = this.notes = docQuery.documents;
      this.noteListView.setNotes(notes);
      this.searchBar.focus();
    });
    const sb = this.searchBar;
    sb.on('enterPressed', this.findNext);
    sb.on('navigate', this.navigateNoteList);
    sb.on('valueChanged', this.searchNotes);

    this.noteListView.on('noteClicked', path => {
      this.select(path);
    })
  }

  navigateNoteList = (direction) => {
    const path = this.noteListView.navigateNoteList(direction);
    this.select(path);
  }

  searchNotes = (value) => {
    const notes = this.notes = value ? docQuery.search(value) : docQuery.documents;
    this.noteListView.setNotes(notes);

    const note = notes[0];
    if (note) {
      this.select(note.filePath);
    }
  }

  select(path) {
    return this.openNote(path).then(e => {
      this.searchBar.focus();
      this.searchInNote();
    });
  }

  openNote(path, pending = true) {
    return atom.workspace.open(path, {pending});
  }
  focusEditor() {
    this.openNote(this.noteListView.selected, false);
  }

  constructor(serializedState) {
    this.createViews();
    this.loadNotes();
    this.lastEditor = null;
    atom.workspace.onDidChangeActivePaneItem(item => {
      if (atom.workspace.isTextEditor(item)) this.lastEditor = item;
    })
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
