(function(){
'strict'

// http://json.org/example.html

let sampleJSON = {
    secretId: "1234abcdef",
    date: new Date(),
    servlet: [
        {
            servletclass: "org.cofax.cds.CDSServlet",
            initparam: { useDataStore: true, dataStore: 10.12321 }
        },
        {
            servletname: "cofaxTools",
            servletclass: "org.cofax.cms.CofaxToolsServlet",
            initparam: {
                templatePath: "toolstemplates/",
                logLocation: "/usr/local/tomcat/logs/CofaxTools.log",
                dataLogMaxSize: "",
                lookInContext: 1.12321,
                adminGroupID: 4,
            }
        }
    ],
    servletmapping: { cofaxEmail: "/cofaxutil/aemail/", cofaxTools: "/tools/" },
    taglib: { tagliburi: "cofax.tld", tagliblocation: "/WEB-INF/tlds/cofax.tld" },
    cost: [
        {"sessionTime": 1,"cost": 20.123},
        {"sessionTime": 1.5,"cost": 25.543},
        {"sessionTime": 2.2,"cost": 40.123},
        {"sessionTime": 8,"cost": 34.876}
    ]
}

let json = new JSONFizz();


let unixTime = function(key, value) {
    if (value instanceof Date) {
        value = Math.round(value.getTime()/1000);
    }
    return value;
}
json.encoder.addHook(unixTime);


let base64Conversion = function(key, value) {
    if (key === "secretId") {
        value = btoa(value);
    }
    return value;
}
json.encoder.addHook(base64Conversion);


let calcTotalCost = function(key, value) {

    if (key === "cost") {
        let totalCost=0;
        for (e of value) {
            totalCost += e['cost'] * e['sessionTime'];
        }
        value = totalCost;
    }

    return value;
}
json.encoder.addHook(calcTotalCost);

let roundOffNumber = function(key, value) {
    if (typeof value === "number") {
        value =  Math.round(100 * value)/100;
    }

    return value;
}
json.encoder.addHook(roundOffNumber);


console.log("Input:\n", sampleJSON);
console.log("JSON Fizzle with hooks:\n", json.stringify(sampleJSON));

json.encoder.resetHooks();
console.log("JSON Fizzle without hooks:\n", json.stringify(sampleJSON));

console.log("Native JSON:\n", JSON.stringify(sampleJSON));

})()