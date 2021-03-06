import BitmapModel, {floodFill} from './BitmapModel.js'
import {PALETTES} from './palettes.js'
import {Point} from './DrawingSurface.jsx'


it('fills', () => {
    let model = new BitmapModel(150,110,PALETTES.nes)
    let pt = Point.makePoint(0,0)
    let color0 = -1
    expect(model.getData(pt)).toEqual(color0)
    let color1 = 3
    model.setData(pt,color1,model.getCurrentLayer())
    expect(model.getData(pt)).toEqual(color1)
    pt.x++
    model.setData(pt,color1,model.getCurrentLayer())
    pt.y++
    model.setData(pt,color1,model.getCurrentLayer())

    //now fill at 10,10, should affect everything
    let color2 = 4
    pt.x = 10
    pt.y = 10
    floodFill(model,model.getCurrentLayer(),pt,-1, color2)
    expect(model.getData(Point.makePoint(3,0))).toEqual(color2)
    expect(model.getData(Point.makePoint(10,0))).toEqual(color2)
    expect(model.getData(Point.makePoint(0,10))).toEqual(color2)
});

it('fill-same-color-crash',()=>{
    let model = new BitmapModel(5,5,PALETTES.nes)
    model.setData(Point.makePoint(3,3),3,model.getCurrentLayer())
    model.setData(Point.makePoint(3,4),3,model.getCurrentLayer())
    floodFill(model,model.getCurrentLayer(),Point.makePoint(3,3),3, 3)
    expect(model.getData(Point.makePoint(3,3))).toEqual(3)
});


