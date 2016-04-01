/**
 * Created by josh on 11/28/15.
 */

export function GET_JSON(path, cb) {
    console.log("GET_JSON fetch:",path)
    //throw new Error();
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(req.readyState == 4 && req.status === 200) {
            var json = JSON.parse(req.responseText);
            //console.log("GET_JSON return:",json);
            cb(json);
        }
        //console.log("status = ", req.status, req.responseText);
    };
    req.open("GET",path,true);
    req.setRequestHeader('Accept', 'application/json');
    req.withCredentials = true;
    req.send();
}

export function POST_JSON(path, payload, cb) {
    console.log("POSTING",path);
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if(req.readyState == 4 && req.status === 200) {
            try {
                var json = JSON.parse(req.responseText);
                cb(json);
            } catch (err) {
                cb(err);
            }
        }
        if(req.readyState == 4 && req.status == 400) {
            console.log("ERROR", req.responseText);
            try {
                var json = JSON.parse(req.responseText);
                cb(json);
            } catch (err) {
                cb(err);
            }
        }
    };
    req.open("POST",path,true);
    req.setRequestHeader('Accept', 'application/json');
    req.withCredentials = true;
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(payload));
}