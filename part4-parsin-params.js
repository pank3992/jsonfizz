(function(){
'strict'

window.onload = function() {
    let queryString, queryStringParameter;

    queryString = getQueryString();
    document.querySelector('#queryStringParams p').innerHTML = queryString;

    queryStringParameter = parseQueryStringParams(queryString);
    console.log("URL query Parameters\n", queryStringParameter);
}


let json = new JSONFizz();


function getQueryString() {
    let params = /\?(.*)/g.exec(window.location.href);
    return (params)?params[1]:null;
}


function deserialize(str) {
    try {
        return json.parse(str);
    } catch(e) {
        return str
    };
}


function parseQueryStringParams(queryString) {
    
    if(!queryString) return null;

    let params = {};

    for (let pairs of queryString.split("&")) {
        let [k, v] = pairs.split("=");
        
        v = decodeURIComponent(v);

        // Try deserializing value (json.parse throws exception if its not a valid serialized data)
        try { v = json.parse(v) } catch(e) {};

        // If the parameter repeats create array else store normally
        if (k in params) {
            (params[k] instanceof Array) ? params[k].push(v) : params[k] = [params[k], v];
        } else {
            params[k] = v;
        }
    }
    return params;
}

})()