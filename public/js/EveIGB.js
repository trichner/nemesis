/**
 * Created by Thomas on 13.04.2015.
 */
app.factory('EveIGB', function() {

    function notimplemented(){
        console.log('NOT IMPLEMENTED')
    }
    // stubs for all methods
    var EveIGB = {
        openEveMail : function(){},
        showInfo : function(){},
        showPreview : notimplemented,
        showRouteTo : notimplemented,
        showMap :     function(){},
        showFitting : function(){},
        showContract : notimplemented,
        showMarketDetails : notimplemented,
        requestTrust : function(){},
        setDestination : notimplemented,
        addWaypoint : notimplemented,
        joinChannel : notimplemented,
        joinMailingList : notimplemented,
        createContract :  notimplemented,
        buyType : notimplemented,
        findInContracts : notimplemented,
        addToMarketQuickBar : notimplemented,
        addContact : notimplemented,
        removeContact : notimplemented,
        addCorpContact : notimplemented,
        removeCorpContact : notimplemented,
        block : notimplemented,
        addBounty : notimplemented,
        inviteToFleet : function(){},
        startConversation : notimplemented,
        showContracts : notimplemented,
        showOnMap : notimplemented,
        editMember : notimplemented,
        awardDecoration : notimplemented,
        sendMail : notimplemented,
        showContents : notimplemented,
        bookmark : notimplemented
    };
    // If it is the IGB, attach the real methods
    if(typeof CCPEVE !== 'undefined'){
        // We need a lambda function because CCPEVE functions are native
        EveIGB.openEveMail = function(){CCPEVE.openEveMail()};
        EveIGB.showInfo = function(a,b){CCPEVE.showInfo(a,b)};
        EveIGB.showFitting = function(fit){CCPEVE.showFitting(fit)};
        EveIGB.requestTrust = function(url){CCPEVE.requestTrust(url)};
        EveIGB.inviteToFleet = function(arg){CCPEVE.inviteToFleet(arg)};

        //for(var m in CCPEVE) {
        //    if(typeof CCPEVE[m] == "function") {
        //        EveIGB[m] = CCPEVE[m];
        //    }
        //}

    }
    return EveIGB;
});