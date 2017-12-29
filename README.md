# pixel-eater

Eat All The Pixels with this web-based pixel art editor

There is a server for saving, loading, and rendering images. All drawing is done in the browser.
The entire UI is in React with custom components.  The UI supports layers and different cursor 
tools (eyedropper, pencil, eraser, move, etc.)

After you draw something you can save it by creating an account with an arbitrary username and 
password. You can download what you've drawn using the 'share' button in the upper right of the 
main drawing area. (it looks like a right turned arrow).


# Instructions

start the server with `npm run server`

build with `npm run build`

open the editor with the file `dist/index.html` in your browser

# future work

* make the data model more immutable
* add keybindings

 
 -----------------
 
new immutable data model.
 
we now have a document which is a hierarchy like this:

 * document
  * sheets
   * tiles
   * scenes
  * palettes
  
using immutable js inside the store. outside the store all access is through store methods.
asdf
## store
 
 * listDocuments() list docs from the remote server, includes proxies including thumbnails and other metadata
 * getDocument(proxy) get particular doc by proxy, loads from server if needed.
 * isDocumentDirty(doc) returns true or false if anything in it is dirty
 * setDocument(x)  not allowed currently

  
 * Sheet[] getSheetsForDocument(doc) get list of sheets for the document as an array of sheets (immutable)
 * Tile createTileForSheet(sheet) creates a new tile using the size specified for the sheet
 * appendTileToSheet(sheet, tile) adds tile to the sheet
 * setPixelOnTile(tile,x,y,index) sets index at particular pixel in the tile using palette for the sheet
 * getPaletteForTile(tile) returns palette for the tile, which is based on for sheet, which is based on for document
 * getPalettesForDocument returns list of palettes on the document
 * appendPaletteToDocument adds a new palette to the document
 
 * getSelectedDocument()  should this be in the model or not?
 * getSelectedSheet()
 * getSelectedTile()
 
 * getSelectedSceneTile()
 * Scene[] getScenesForSheet(sheet)
 * setTileOnScene(scene,x,y,tile)
 
 * Command[] getCommands()
 * undoCommand(command)
 * redoCommand(command)
  
 


comment out old stuff. just have single selected tile that you can edit
add spritesheet viewer/selector w/ plus/minus buttons
add doc list
