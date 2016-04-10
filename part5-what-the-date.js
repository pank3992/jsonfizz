(function(){
'strict'

let SampleJSON = {
    d1: 1501308597,
    d2: 921240720,
    d3: -11231231,
    d4: 2147483647,
    d5: 750853447,
    d6: 3147483847,
    d7: [750162247, 847483847],
    servletclass: "org.cofax.cds.CDSServlet",
    initparam: {
        searchEngineRobotsDb: "WEBINF/robots.db",
        useDataStore: true,
        dataStore: 10.12321,
    }
}


function timeDelta(d, delta) {
    d.setDate(d.getDate() + delta);
    return d;
}

let UNIXDateParser = function(key, value) {
    if (typeof value === "number"
        && value === parseFloat(value)
        && value > 0
        && value < 2**31 - 1) {
        // Here I've considered dates between 1 Jan 1970 - 19 Jan 1938 only
        // due to limitation of 32bit systems
        
        let year, secondSatJune, thirdSundayJune;

        value = 1000*value;  // Javascript takes unix time in milliseconds
        year = (new Date(value)).getFullYear();
        secondSatJune = new Date(year + '-06-01');
        thirdSunOct = new Date(year + '-10-01');
        
        secondSatJune = timeDelta( secondSatJune, 14 - secondSatJune.getDay() - 1).getTime();
        thirdSunOct = timeDelta(thirdSunOct, 21 - thirdSunOct.getDay()).getTime();
        thirdSunOct += 24*60*60*1000-1 // end of Sunday

        if (value > secondSatJune && value < thirdSunOct) {
            // date happens to fall between second Saturday of June and third Sunday
            // of October
            value += 60*60*1000;  // Shift by 1hr
        }

        value = (new Date(value)).toUTCString();
    }

    return value;
}

let json = new JSONFizz();

let temp = json.stringify(SampleJSON);
console.log('Sample JSON Input\n', temp);

json.decoder.addHook(UNIXDateParser);
console.log('JSON Fizz output with hooks\n', json.parse(temp));

json.decoder.removeHook(UNIXDateParser);
console.log('JSON Fizz output without hooks\n', json.parse(temp));

})()