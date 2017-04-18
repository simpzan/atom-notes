'use babel';
const log = console.info.bind(console, "EditorView");

const EventEmitter = require('events').EventEmitter;

const markerLayers = new WeakMap;
function getMarkerLayer(editor) {
  let layer = markerLayers.get(editor);
  if (!layer) {
    layer = editor.addMarkerLayer({maintainHistory: false});
    markerLayers.set(editor, layer);

    const resultsLayerDecoration = editor.decorateMarkerLayer(layer, {type: 'highlight', class: 'find-result'});
  }
  return layer;
}


class EditorView extends EventEmitter {
    constructor() {
        super();
        this.lastEditor = null;
        atom.workspace.onDidChangeActivePaneItem(item => {
            if (atom.workspace.isTextEditor(item)) this.lastEditor = item;
        })
    }
    focus() {

        // this.openNote(this.noteListView.selected, false);
    }

    _getCleanMarkerLayer() {
        const layer = getMarkerLayer(this.lastEditor);
        layer.getMarkers().forEach(marker => marker.destroy());
        return layer;
    }

    _getMarkers(value) {
        const ranges = [];
        this.lastEditor.scan(new RegExp(value, 'g'), obj => {
            ranges.push(obj.computedRange);
        });
        this.markers = ranges;
        return ranges;
    }

    searchNote(value) {
        const layer = this._getCleanMarkerLayer();
        const ranges = this._getMarkers(value);
        ranges.forEach(range => {
            layer.markBufferRange(range, {invalidate: 'inside'});
        });

        this.current = 0;
        const range = ranges[0];
        if (range) this.lastEditor.scrollToBufferPosition(range.start)
    }

    findNavigate(direction) {
        const ranges = this.markers, count = ranges.length;
        if (count === 0) {
            return log("not found");
        }
        const index = (this.current + direction + count) % count;
        log("findNext", this.current, index, ranges);
        this.current = index;
        const range = ranges[index];
        this.lastEditor.scrollToBufferPosition(range.start);
    }
    findNext() {
        this.findNavigate(1);
    }
    findPrevious() {
        this.findNavigate(-1);
    }
}

module.exports = EditorView;
