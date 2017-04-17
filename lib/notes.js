const DocQuery = require("docquery");
const log = console.info.bind(console, "Notes");

const docQuery = this.docQuery = new DocQuery('/Users/simpzan/repo/notes.git', {recursive: true});
docQuery.on('ready', () => {
  const items = docQuery.documents.map(doc => doc.fileName);
  log("items", items);
const shell = docQuery.search('ev').map(doc => doc.fileName);
log("shell", shell)
    process.exit();
});

