


var fittingPattern  = /.*<url=fitting:([0-9:;]*)>(.*)<\/url>.*/i;
var shipTypePattern = /.*fitting:([0-9]*):.*/i;


module.exports = {
    extractFit : function (str) {
        return extractFit(str);
    }
}

function extractFit(str){
    var matches = fittingPattern.exec(str);
    var shipDNA,shipName,shipType;
    if(matches){
        shipDNA  = matches[0];
        shipName = matches[1];
    }

    var matches = shipTypePattern.exec(str);
    if(matches){
        shipType  = matches[0];
    }
    return {
        dna : shipDNA,
        name: shipName,
        type: shipType
    }
}