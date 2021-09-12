import bmp from '@wokwi/bmp-ts'
import fs from 'fs'

let id = {
    width:4,
    height:5,
    // data: new Array(5*5*4),
}
id.data = new Array(id.width*id.height*4)
id.data.fill(0)
function set_pixel(x,y,r,g,b) {
    let n = (x + id.width * y)*4
    console.log("n",n)
    id.data[n+0] = 0 //A
    id.data[n+1] = b //B
    id.data[n+2] = g //G
    id.data[n+3] = r //R
}
// id.data[0] = 255
// id.data[1] = 0
// id.data[2] = 255
// id.data[3] = 0

// for(let i=0; i<30; i+=4) {
    // id.data[i+1] = 255
// }

set_pixel(0,0,255,0,0)
set_pixel(1,1,255,255,0)
set_pixel(2,2, 255,0,255)
set_pixel(3,3, 255,0,0)
const encode = bmp.default.encode

const rawData = encode({
    data:id.data,
    bitPP: 4,
    width:id.width,
    height:id.height,
    palette: [
        { red: 255, green: 255, blue: 255, quad: 0 },
        { red: 255, green: 255, blue: 0, quad: 0 },
        { red: 255, green: 0, blue: 255, quad: 0 },
        { red: 255, green: 0, blue: 0, quad: 0 },
        { red: 0, green: 255, blue: 255, quad: 0 },
        { red: 0, green: 255, blue: 0, quad: 0 },
        { red: 0, green: 0, blue: 255, quad: 0 },
        { red: 0, green: 0, blue: 0, quad: 0 }
    ]
});
console.log(rawData)
// console.log("got a raw buffer",rawData)
// let blob = new Blob(rawData.data)
// function forceDownloadBlob(title,blob) {
//     console.log("forcing download of",title)
//     const a = document.createElement('a')
//     a.href = URL.createObjectURL(blob)
//     a.download = title
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
// }
// forceDownloadBlob(`${doc.title}@${scale}.bmp`,blob)

fs.writeFileSync("output.bmp",rawData.data)
