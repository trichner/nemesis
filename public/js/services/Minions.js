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
            var char = item.characterName
            var line = ' * ' + char + ' \t ';
            item.fittings.forEach(function (fitting) {
                line += fitting.role;
                line += ', ';
            })
            line += '\n';
            list.push(line);
        })
        list = list.join('');

        var ascii = '.\n';
        var prename = waitlist.owner.characterName.split(' ')[0];
        head = head.replace('%n',prename)
        ascii = ascii.concat(head);
        ascii = ascii.concat('\n');
        ascii = ascii.concat(list);
        ascii = ascii.concat(foot)
        return ascii;
    }

    Minions.waitlistStats = function (waitlistVO) {
        var count = {};
        waitlistVO.waitlist.forEach(function (item) {
            var pilotCount = {}
            item.fittings.forEach(function (fitting) {
                if(fitting.role){
                    var type = fitting.role[0];
                    pilotCount[type] = 1;
                }else{
                    pilotCount.u = 1;
                }
            })
            for (var key in pilotCount) {
                if (pilotCount.hasOwnProperty(key)) {
                    if(!count[key]){
                        count[key] = 0;
                    }
                    count[key] += pilotCount[key];
                }
            }
        })
        return count;
    };

    Minions.waitlistStatsTxt = function(waitlistVO){
        var count = Minions.waitlistStats(waitlistVO)
        var str = '';
        for (var key in count) {
            if (count.hasOwnProperty(key)) {
                var line = ' / ' + key + ': '+  count[key]
                str = str.concat(line);
            }
        }
        return str;
    }

    Minions.getQueryParam = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    return Minions;
});