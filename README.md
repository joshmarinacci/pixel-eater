# pixel-eater

Eat All The Pixels with this web-based pixel art editor. Try it out at [https://apps.josh.earth/pixel-eater/](https://apps.josh.earth/pixel-eater/)

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

 
 
