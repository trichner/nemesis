app.factory('Minions', function($q) {
    var Minions = {};

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

    Minions.waitlist2ascii = function(waitlist){
        var list = waitlist.waitlist.map(function (item) {
            var char = item.characterName   // linkCharacter(item.characterId,item.characterName);
            var fit  = item.shipName        //linkFit(item.shipDNA,item.shipName)
            return ' * ' + fit + ' \t ' + char + '\n';
        })
        list = list.join('');

        var ascii = '.\n';
        var prename = mapped.ownerName.split(' ')[0];
        ascii = ascii.concat('-=   <b>' + prename + "'s Fleet </b>   =-\n")
        ascii = ascii.concat(list);
        ascii = ascii.concat('-==              ==-\n')
        return ascii;
    }

    return Minions;
});