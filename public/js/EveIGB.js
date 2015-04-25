/**
 * Created by Thomas on 13.04.2015.
 */
app.factory('EveIGB', function() {

    // stubs for all methods
    var EveIGB = {
        openEveMail : function(){},
        showInfo : function(){},
        showPreview : function(){},
        showRouteTo : function(){},
        showMap : function(){},
        showFitting : function(){},
        showContract : function(){},
        showMarketDetails : function(){},
        requestTrust : function(){},
        setDestination : function(){},
        addWaypoint : function(){},
        joinChannel : function(){},
        joinMailingList : function(){},
        createContract : function(){},
        buyType : function(){},
        findInContracts : function(){},
        addToMarketQuickBar : function(){},
        addContact : function(){},
        removeContact : function(){},
        addCorpContact : function(){},
        removeCorpContact : function(){},
        block : function(){},
        addBounty : function(){},
        inviteToFleet : function(){},
        startConversation : function(){},
        showContracts : function(){},
        showOnMap : function(){},
        editMember : function(){},
        awardDecoration : function(){},
        sendMail : function(){},
        showContents : function(){},
        bookmark : function(){}
    };

    // If it is the IGB, attach the real methods
    if(typeof CCPEVE !== 'undefined'){
        EveIGB.openEveMail = CCPEVE.openEveMail;
        EveIGB.showInfo = CCPEVE.showInfo;
        EveIGB.showFitting = CCPEVE.showFitting;
        //for(var m in CCPEVE) {
        //    if(typeof CCPEVE[m] == "function") {
        //        EveIGB[m] = CCPEVE[m];
        //    }
        //}

    }
    return EveIGB;
});