'use babel';
const log = console.info.bind(console, "EditorView");

const EventEmitter = require('events').EventEmitter;
import { CompositeDisposable } from 'atom';

const markerLayers = new WeakMap;
function getMarkerLayer(editor) {
  let layer = markerLayers.get(editor);
  if (!layer) {
    layer = editor.addMarkerLayer({maintainHistory: false});
    markerLayers.set(editor, layer);
  }
  return layer;
}

class EditorView extends EventEmitter {
    editor = null
    markers = []
    current = -1
    highlightedMarker = null

    constructor() {
        super();
        const ws = atom.workspace
        ws.onDidChangeActivePaneItem(item => {
            if (ws.isTextEditor(item)) this.setEditor(item)
        })
    }
    setEditor(editor) {
        if (this.editor === editor || !editor) return
        this.editor = editor;

        log("setEditor")
        if (this.subscriptions) this.subscriptions.dispose();
        this.subscriptions = new CompositeDisposable;
        this.subscriptions.add(this.editor.onDidAddSelection(this.highlightSelection.bind(this)));
        this.subscriptions.add(this.editor.onDidChangeSelectionRange(this.highlightSelection.bind(this)));
        const layer = this.layer = getMarkerLayer(editor);
        this.resultsLayerDecoration = editor.decorateMarkerLayer(layer, {type: 'highlight', class: 'find-result'});
    }
    focus() {

        // this.openNote(this.noteListView.selected, false);
    }

    _getRanges(value) {
        const ranges = [];
        this.editor.scan(new RegExp(value, 'g'), obj => {
            ranges.push(obj.computedRange);
        });
        return ranges;
    }
    _createMarkers(ranges) {
        const layer = this.layer
        layer.clear()
        this.markers = ranges.map(range => {
            return layer.markBufferRange(range, {invalidate: 'inside'})
        })
    }

    searchNote(value) {
        if (!value) return
        log('searchNote', value)
        const ranges = this._getRanges(value)
        this._createMarkers(ranges)

        if (ranges[0]) this._selectAndScrollToMarkerAtIndex(0)
    }

    highlightSelection() {
        if (!this.markers) return
        const decoration = this.resultsLayerDecoration

        const previousMarker = this.highlightedMarker
        if (previousMarker) {
            log('deselect marker', previousMarker.getBufferRange().start.row)
            decoration.setPropertiesForMarker(previousMarker, null)
        }

        const currentMarker = this.markers[this.current]
        log('select marker', currentMarker.getBufferRange().start.row)
        decoration.setPropertiesForMarker(currentMarker, {type: 'highlight', class: 'current-result'})
        this.highlightedMarker = currentMarker
    }

    _selectAndScrollToMarkerAtIndex(index) {
        this.current = index;
        const range = this.markers[index].getBufferRange();
        this.editor.setSelectedBufferRange(range, {flash: true});
        this.editor.scrollToCursorPosition({center: true});
    }
    _findNavigate(direction) {
        const count = this.markers.length;
        if (count === 0) {
            return log("not found");
        }
        const index = (this.current + direction + count) % count;
        log("findNext", this.current, index, count-1);
        this._selectAndScrollToMarkerAtIndex(index)
    }

    findNext() {
        this._findNavigate(1);
    }
    findPrevious() {
        this._findNavigate(-1);
    }
}

module.exports = EditorView;
