export function drawSprite(store,palette,c,sprite,scale) {
    sprite.get('layers').forEach((layer) => {
        if(!layer.get('visible')) return;
        c.save();
        const w = store.getTileWidth(sprite)
        const h = store.getTileHeight(sprite)
        c.globalAlpha = layer.opacity;
        for(let y=0; y<h; y++) {
            for (let x = 0; x < w; x++) {
                const val = store.getPixelOnLayer(layer, x, y);
                if(val === -1) continue;
                c.fillStyle = store.lookupPaletteColor(palette, val);
                c.fillRect(x * scale, y * scale, scale, scale);
            }
        }
        c.restore();
    })
}
