(function(){
'strict'

// http://json.org/example.html

let sampleJSON = {
    webapp: {
        secretId: "oiujsad8712313a",
        date: new Date(),
        servlet: [
            {
                servletclass: "org.cofax.cds.CDSServlet",
                initparam: {
                    searchEngineRobotsDb: "WEBINF/robots.db",
                    useDataStore: true,
                    dataStore: 10.12321,
                }
            },
            {
                servletname: "cofaxTools",
                servletclass: "org.cofax.cms.CofaxToolsServlet",
                initparam: {
                    templatePath: "toolstemplates/",
                    log: 1,
                    logLocation: "/usr/local/tomcat/logs/CofaxTools.log",
                    dataLog: 1,
                    dataLogMaxSize: "",
                    lookInContext: 1.12321,
                    adminGroupID: 4,
                    betaServer: true
                }
            }],
        servletmapping: {
            cofaxEmail: "/cofaxutil/aemail/",
            cofaxAdmin: "/admin/",
            fileServlet: "/static/",
            cofaxTools: "/tools/"
        },
        taglib: {
            tagliburi: "cofax.tld",
            tagliblocation: "/WEB-INF/tlds/cofax.tld"
        }
    }
}

let json = new JSONFizz();

console.log("Input:\n", sampleJSON);
console.log("JSON Fizzle Output:\n", json.stringify(sampleJSON));
console.log("Native JSON Output:\n", JSON.stringify(sampleJSON));

})()