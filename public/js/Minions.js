app.factory('Minions', function($q) {
    var Minions = {};

    var TYPE_ID = {
        FEDERATION_NAVY_STASIS_WEBIFIER : 17559
    }

    var DD  = {
        VINDICATOR : 17740 ,
        ROKH : 24688 ,
        NIGHTMARE : 17736 ,
        MAELSTROM : 24694 ,
        HYPERION : 24690 ,
        MACHARIEL : 17738
    }

    var LL  = {
        SCIMITAR : 11978 ,
        BASILISK : 11985
    }

    function parseSlot(str){
        var arr = str.split(';');
        return {id: arr[0],n:arr[1]};
    }

    Minions.teardownShipFit = function(shipDNA){
        var slots = shipDNA.split(':')

        var type = slots.shift();
        var modules = slots.map(parseSlot);

        var ship = {type : type, modules : modules};
        return ship;
    }

    Minions.linkCharacter = function(id,name){
        return '<url=showinfo:1373\/\/' + id + '>' + name +'</url>'
    }

    Minions.linkFit = function(shipDNA,shipName){
        return '<url=fitting:' + shipDNA + '>' + shipName + '</url>'
    }

    Minions.waitlist2ascii = function(waitlist,head,foot){
        var list =  [];

        waitlist.waitlist.forEach(function (item) {
            item.fittings.forEach(function (fitting) {
                var char = item.characterName   // linkCharacter(item.characterId,item.characterName);
                var fit  = fitting.shipName        //linkFit(item.shipDNA,item.shipName)
                list.push(' * ' + fit + ' \t ' + char + '\n')
            })
        })
        list = list.join('');

        var ascii = '.\n';
        var prename = waitlist.ownerName.split(' ')[0];
        head = head.replace('%n',prename)
        ascii = ascii.concat(head);
        ascii = ascii.concat('\n');
        ascii = ascii.concat(list);
        ascii = ascii.concat(foot)
        return ascii;
    }

    return Minions;
});