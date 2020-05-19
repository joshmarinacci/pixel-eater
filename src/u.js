/**
 * Created by josh on 11/28/15.
 */

export function GET_JSON(path) {
    return new Promise((res,rej)=>{
        console.log("GET_JSON fetch:",path);
        let req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if(req.readyState === 4 && req.status === 200) {
                return res(JSON.parse(req.responseText));
            }
            if(req.status >= 400) {
                rej(req)
            }
        };
        req.open("GET",path,true);
        req.setRequestHeader('Accept', 'application/json');
        req.withCredentials = true;
        req.send();
    });
}

export const KEYBOARD = {
    E: 69,
    I: 73,
    P: 80,
    V: 86,
    L: 76,
    F: 70,
    S: 83,
    D:68,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40
};

export function POST_JSON(path, payload, cb) {
    return new Promise((res,rej)=>{
        console.log("POSTING",path);
        let req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if(req.readyState === 4 && req.status === 200) {
                return res(JSON.parse(req.responseText));
            }
            if(req.readyState === 4 && req.status === 400) {
                return rej(JSON.parse(req.responseText));
            }
        };
        req.open("POST",path,true);
        req.setRequestHeader('Accept', 'application/json');
        req.withCredentials = true;
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.send(JSON.stringify(payload));
    })
}

export const toRad = (deg) => Math.PI/180*deg
export const remap = (value, min1, max1, min2, max2) => {
    value = (value-min1)/(max1-min1)  // map from input range to 0->1
    value = min2 + (max2-min2)*value // map 0->1 to output range
    return value
}

