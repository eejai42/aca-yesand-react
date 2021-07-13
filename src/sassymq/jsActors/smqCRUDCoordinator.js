

function generateCRUDCoordinatorActor() {
    var smqCRUDCoordinator = {
    };
    
    smqCRUDCoordinator.defer = function() {
        var deferred = {
            promise: null,
            resolve: null,
            reject: null
        };
        
        deferred.promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        
        return deferred;
    }

    smqCRUDCoordinator.connect = function (virtualHost, username, password, on_received, after_connect) {
        console.warn('set `smqCRUDCoordinator.showPingPongs = true` to get verbose logging.');
        smqCRUDCoordinator.virtualHost = virtualHost;
        smqCRUDCoordinator.username = username;
        smqCRUDCoordinator.password = password;
        smqCRUDCoordinator.rabbitEndpoint = smqCRUDCoordinator.rabbitEndpoint || window.rabbitEndpoint || 'ws://sassymq.anabstractlevel.com:15674/ws';
        smqCRUDCoordinator.CRUDCoordinator_all_connection = {};
        smqCRUDCoordinator.messages = [];
        smqCRUDCoordinator.waitingReply = [];
        
        smqCRUDCoordinator.client = Stomp.client(smqCRUDCoordinator.rabbitEndpoint);

        smqCRUDCoordinator.client.debug = function (m, p) {
            if (((m == ">>> PING") || (m == "<<< PONG")) && !smqCRUDCoordinator.showPingPongs) return;
            else {
                if (m == "<<< ") delete m;
                let data = p || m || "STRING"; 
                let indexOfContentLength = data.indexOf("content-length:");
                let dataStart = data.indexOf("\n\n");
                if ((dataStart > indexOfContentLength) && (indexOfContentLength > 1)) {
                    data = (data.substring(dataStart, data.length - 1) || '');
                    if (data.startsWith('"')) data = data.substring(1);
                    if (data.endsWith('"')) data = data.substring(0, data.length - 1);
                    data = data.substring(data.indexOf('{'));
                    data = data.substring(0, data.lastIndexOf('}') + 1);
                    try {
                        data = JSON.parse(data);
                        if (data.AccessToken) data.AccessToken = 'ay_******xyz';
                    } catch(ex) {
                        console.error('ERROR PARSING DATA for debug output', ex, data);
                    }
                    m = m.substring(0, m.indexOf('\n\n'));
                }
                console.log("DEBUG: ", m, data || p); 
            }
        }

        smqCRUDCoordinator.checkMessage = function(msg) {
            
                if (smqCRUDCoordinator.onGuestRequestToken) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.general.guest.requesttoken'))) {
                        var rpayload = smqCRUDCoordinator.onGuestRequestToken(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onGuestValidateTemporaryAccessToken) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.general.guest.validatetemporaryaccesstoken'))) {
                        var rpayload = smqCRUDCoordinator.onGuestValidateTemporaryAccessToken(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onGuestWhoAmI) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.general.guest.whoami'))) {
                        var rpayload = smqCRUDCoordinator.onGuestWhoAmI(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onGuestWhoAreYou) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.general.guest.whoareyou'))) {
                        var rpayload = smqCRUDCoordinator.onGuestWhoAreYou(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onGuestStoreTempFile) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.utlity.guest.storetempfile'))) {
                        var rpayload = smqCRUDCoordinator.onGuestStoreTempFile(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onCRUDCoordinatorResetRabbitSassyMQConfiguration) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.general.crudcoordinator.resetrabbitsassymqconfiguration'))) {
                        var rpayload = smqCRUDCoordinator.onCRUDCoordinatorResetRabbitSassyMQConfiguration(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onCRUDCoordinatorResetJWTSecretKey) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.general.crudcoordinator.resetjwtsecretkey'))) {
                        var rpayload = smqCRUDCoordinator.onCRUDCoordinatorResetJWTSecretKey(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddEpisodeHost) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addepisodehost'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddEpisodeHost(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetEpisodeHosts) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getepisodehosts'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetEpisodeHosts(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateEpisodeHost) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updateepisodehost'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateEpisodeHost(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteEpisodeHost) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deleteepisodehost'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteEpisodeHost(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddEpisodeHost) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addepisodehost'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddEpisodeHost(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetEpisodeHosts) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getepisodehosts'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetEpisodeHosts(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateEpisodeHost) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updateepisodehost'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateEpisodeHost(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteEpisodeHost) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deleteepisodehost'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteEpisodeHost(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetFallacies) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getfallacies'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetFallacies(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatefallacy'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletefallacy'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetFallacies) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getfallacies'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetFallacies(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updatefallacy'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deletefallacy'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddTopicAgreement) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addtopicagreement'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddTopicAgreement(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetTopicAgreements) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.gettopicagreements'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetTopicAgreements(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateTopicAgreement) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatetopicagreement'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateTopicAgreement(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteTopicAgreement) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletetopicagreement'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteTopicAgreement(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddTopicAgreement) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addtopicagreement'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddTopicAgreement(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetTopicAgreements) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.gettopicagreements'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetTopicAgreements(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateTopicAgreement) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updatetopicagreement'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateTopicAgreement(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteTopicAgreement) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deletetopicagreement'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteTopicAgreement(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddCallTopic) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addcalltopic'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddCallTopic(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetCallTopics) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getcalltopics'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetCallTopics(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateCallTopic) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatecalltopic'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateCallTopic(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteCallTopic) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletecalltopic'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteCallTopic(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddCallTopic) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addcalltopic'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddCallTopic(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetCallTopics) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getcalltopics'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetCallTopics(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateCallTopic) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updatecalltopic'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateCallTopic(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteCallTopic) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deletecalltopic'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteCallTopic(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddEpisodeCall) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addepisodecall'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddEpisodeCall(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetEpisodeCalls) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getepisodecalls'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetEpisodeCalls(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateEpisodeCall) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updateepisodecall'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateEpisodeCall(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteEpisodeCall) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deleteepisodecall'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteEpisodeCall(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddEpisodeCall) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addepisodecall'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddEpisodeCall(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetEpisodeCalls) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getepisodecalls'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetEpisodeCalls(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateEpisodeCall) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updateepisodecall'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateEpisodeCall(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteEpisodeCall) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deleteepisodecall'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteEpisodeCall(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddOpenIssue) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addopenissue'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddOpenIssue(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetOpenIssues) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getopenissues'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetOpenIssues(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateOpenIssue) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updateopenissue'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateOpenIssue(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteOpenIssue) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deleteopenissue'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteOpenIssue(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddOpenIssue) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addopenissue'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddOpenIssue(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetOpenIssues) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getopenissues'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetOpenIssues(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateOpenIssue) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updateopenissue'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateOpenIssue(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteOpenIssue) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deleteopenissue'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteOpenIssue(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddCallParticipant) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addcallparticipant'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddCallParticipant(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetCallParticipants) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getcallparticipants'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetCallParticipants(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateCallParticipant) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatecallparticipant'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateCallParticipant(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteCallParticipant) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletecallparticipant'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteCallParticipant(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddCallParticipant) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addcallparticipant'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddCallParticipant(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetCallParticipants) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getcallparticipants'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetCallParticipants(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateCallParticipant) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updatecallparticipant'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateCallParticipant(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteCallParticipant) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deletecallparticipant'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteCallParticipant(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddPerson) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addperson'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddPerson(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetPeople) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getpeople'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetPeople(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdatePerson) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updateperson'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdatePerson(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeletePerson) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deleteperson'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeletePerson(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddPerson) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addperson'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddPerson(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetPeople) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getpeople'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetPeople(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdatePerson) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updateperson'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdatePerson(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeletePerson) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deleteperson'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeletePerson(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddTopicFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addtopicfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddTopicFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetTopicFallacies) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.gettopicfallacies'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetTopicFallacies(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateTopicFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatetopicfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateTopicFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteTopicFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletetopicfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteTopicFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddTopicFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addtopicfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddTopicFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetTopicFallacies) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.gettopicfallacies'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetTopicFallacies(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateTopicFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updatetopicfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateTopicFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteTopicFallacy) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deletetopicfallacy'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteTopicFallacy(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddShowSeason) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addshowseason'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddShowSeason(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetShowSeasons) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getshowseasons'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetShowSeasons(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateShowSeason) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updateshowseason'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateShowSeason(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteShowSeason) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deleteshowseason'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteShowSeason(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddShowSeason) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addshowseason'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddShowSeason(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetShowSeasons) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getshowseasons'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetShowSeasons(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateShowSeason) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updateshowseason'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateShowSeason(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteShowSeason) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deleteshowseason'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteShowSeason(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onGuestGetShows) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.guest.getshows'))) {
                        var rpayload = smqCRUDCoordinator.onGuestGetShows(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddShow) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addshow'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddShow(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetShows) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getshows'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetShows(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateShow) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updateshow'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateShow(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteShow) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deleteshow'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteShow(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddShow) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addshow'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddShow(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetShows) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getshows'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetShows(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateShow) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updateshow'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateShow(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteShow) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deleteshow'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteShow(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddSeasonEpisode) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addseasonepisode'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddSeasonEpisode(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetSeasonEpisodes) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getseasonepisodes'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetSeasonEpisodes(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateSeasonEpisode) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updateseasonepisode'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateSeasonEpisode(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteSeasonEpisode) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deleteseasonepisode'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteSeasonEpisode(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorAddSeasonEpisode) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.addseasonepisode'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorAddSeasonEpisode(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorGetSeasonEpisodes) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.getseasonepisodes'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorGetSeasonEpisodes(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorUpdateSeasonEpisode) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.updateseasonepisode'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorUpdateSeasonEpisode(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onModeratorDeleteSeasonEpisode) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.moderator.deleteseasonepisode'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorDeleteSeasonEpisode(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                // Can also hear what 'Guest' can hear.
                
                // Can also hear what 'Moderator' can hear.
                
                if (smqCRUDCoordinator.onModeratorCallUpdated) {
                    if (msg.headers && (msg.headers.destination.includes('moderator.custom.moderator.callupdated'))) {
                        var rpayload = smqCRUDCoordinator.onModeratorCallUpdated(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                // Can also hear what 'Admin' can hear.
                
               
        }

        var on_connect = function (x) {
            smqCRUDCoordinator.CRUDCoordinator_all_connection = smqCRUDCoordinator.client.subscribe("/exchange/crudcoordinator.all/#",
                    function (d) {
                        if (d.body) d.body = JSON.parse(d.body);
                        smqCRUDCoordinator.messages.push(d);
                        smqCRUDCoordinator.checkMessage(d);
                        if (on_received) on_received(d);
                        if (smqCRUDCoordinator.showPingPongs) console.log('      --------  MESSAGE FOR smqCRUDCoordinator: ', d);
                    }, {
                        durable: false,
                        requeue: true
                    });
            smqCRUDCoordinator.client.onreceive =  function (d) {
                        var body = JSON.parse(d.body);
                        var corrID = d.headers["correlation-id"];
                        var waitingDeferred = smqCRUDCoordinator.waitingReply[corrID];

                        if (waitingDeferred && body.IsHandled) {
                            delete smqCRUDCoordinator.waitingReply[corrID];
                            if (body && body.ErrorMessage) console.error("ERROR RECEIVED: " + body.ErrorMessage);
                            waitingDeferred.resolve(body, d);
                        }
                    };
                    if (after_connect) after_connect(x);
                };

        var on_error = function (frame) {
            frame = frame || { 'error': 'unspecified error' };
            console.error('ERROR On STOMP Client: ', frame.error, frame);
        };

        console.log('connecting to: ' + smqCRUDCoordinator.rabbitEndpoint + ', using ' + username + '/' + password);
        smqCRUDCoordinator.client.connect(smqCRUDCoordinator.username, smqCRUDCoordinator.password, on_connect, on_error, smqCRUDCoordinator.virtualHost);
    };

    smqCRUDCoordinator.disconnect = function() {
        if (smqCRUDCoordinator && smqCRUDCoordinator.client) 
        {
            smqCRUDCoordinator.client.disconnect();
        }
    }

    smqCRUDCoordinator.stringifyValue = function(value) {
        if (!value) value = '{}';
            if (typeof value == 'object') {
                value = JSON.stringify(value);
            }
        return value;
    };
    
    smqCRUDCoordinator.sendReply = function(replyPayload, msg) {
        if (replyPayload && msg && msg.headers && msg.headers['reply-to']) {
            replyPayload.IsHandled = true;
            smqCRUDCoordinator.client.send(msg.headers['reply-to'], 
                        { "content-type": "application/json", 
                          "reply-to":"/temp-queue/response-queue", 
                          "correlation-id":msg.headers['correlation-id'] 
                        }, JSON.stringify(replyPayload));
        }
    };

    
        
        smqCRUDCoordinator.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqCRUDCoordinator.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqCRUDCoordinator.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqCRUDCoordinator.ResetRabbitSassyMQConfiguration = function() {
            smqCRUDCoordinator.ResetRabbitSassyMQConfiguration('{}');
        }

        smqCRUDCoordinator.ResetRabbitSassyMQConfiguration = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqCRUDCoordinator.showPingPongs) console.log('Reset Rabbit Sassy M Q Configuration - ');
            smqCRUDCoordinator.client.send('/exchange/crudcoordinatormic/crudcoordinator.general.crudcoordinator.resetrabbitsassymqconfiguration', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ResetJWTSecretKey = function() {
            smqCRUDCoordinator.ResetJWTSecretKey('{}');
        }

        smqCRUDCoordinator.ResetJWTSecretKey = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqCRUDCoordinator.showPingPongs) console.log('Reset J W T Secret Key - ');
            smqCRUDCoordinator.client.send('/exchange/crudcoordinatormic/crudcoordinator.general.crudcoordinator.resetjwtsecretkey', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
            // Can also say what 'Guest' can say.
            
        
        smqCRUDCoordinator.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqCRUDCoordinator.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqCRUDCoordinator.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqCRUDCoordinator.GuestRequestToken = function() {
            smqCRUDCoordinator.GuestRequestToken('{}');
        }

        smqCRUDCoordinator.GuestRequestToken = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Request Token - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.general.guest.requesttoken', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.GuestValidateTemporaryAccessToken = function() {
            smqCRUDCoordinator.GuestValidateTemporaryAccessToken('{}');
        }

        smqCRUDCoordinator.GuestValidateTemporaryAccessToken = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Validate Temporary Access Token - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.general.guest.validatetemporaryaccesstoken', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.GuestWhoAmI = function() {
            smqCRUDCoordinator.GuestWhoAmI('{}');
        }

        smqCRUDCoordinator.GuestWhoAmI = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Who Am I - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.general.guest.whoami', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.GuestWhoAreYou = function() {
            smqCRUDCoordinator.GuestWhoAreYou('{}');
        }

        smqCRUDCoordinator.GuestWhoAreYou = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Who Are You - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.general.guest.whoareyou', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.GuestStoreTempFile = function() {
            smqCRUDCoordinator.GuestStoreTempFile('{}');
        }

        smqCRUDCoordinator.GuestStoreTempFile = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Store Temp File - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.utlity.guest.storetempfile', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.GuestGetShows = function() {
            smqCRUDCoordinator.GuestGetShows('{}');
        }

        smqCRUDCoordinator.GuestGetShows = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Get Shows - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.crud.guest.getshows', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
            // Can also say what 'Moderator' can say.
            
        
        smqCRUDCoordinator.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqCRUDCoordinator.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqCRUDCoordinator.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqCRUDCoordinator.ModeratorCallUpdated = function() {
            smqCRUDCoordinator.ModeratorCallUpdated('{}');
        }

        smqCRUDCoordinator.ModeratorCallUpdated = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Call Updated - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/moderator.custom.moderator.callupdated', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddEpisodeHost = function() {
            smqCRUDCoordinator.ModeratorAddEpisodeHost('{}');
        }

        smqCRUDCoordinator.ModeratorAddEpisodeHost = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Episode Host - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetEpisodeHosts = function() {
            smqCRUDCoordinator.ModeratorGetEpisodeHosts('{}');
        }

        smqCRUDCoordinator.ModeratorGetEpisodeHosts = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Episode Hosts - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getepisodehosts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateEpisodeHost = function() {
            smqCRUDCoordinator.ModeratorUpdateEpisodeHost('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateEpisodeHost = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Episode Host - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteEpisodeHost = function() {
            smqCRUDCoordinator.ModeratorDeleteEpisodeHost('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteEpisodeHost = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Episode Host - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddFallacy = function() {
            smqCRUDCoordinator.ModeratorAddFallacy('{}');
        }

        smqCRUDCoordinator.ModeratorAddFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetFallacies = function() {
            smqCRUDCoordinator.ModeratorGetFallacies('{}');
        }

        smqCRUDCoordinator.ModeratorGetFallacies = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Fallacies - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateFallacy = function() {
            smqCRUDCoordinator.ModeratorUpdateFallacy('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteFallacy = function() {
            smqCRUDCoordinator.ModeratorDeleteFallacy('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddTopicAgreement = function() {
            smqCRUDCoordinator.ModeratorAddTopicAgreement('{}');
        }

        smqCRUDCoordinator.ModeratorAddTopicAgreement = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Topic Agreement - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addtopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetTopicAgreements = function() {
            smqCRUDCoordinator.ModeratorGetTopicAgreements('{}');
        }

        smqCRUDCoordinator.ModeratorGetTopicAgreements = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Topic Agreements - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.gettopicagreements', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateTopicAgreement = function() {
            smqCRUDCoordinator.ModeratorUpdateTopicAgreement('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateTopicAgreement = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Topic Agreement - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteTopicAgreement = function() {
            smqCRUDCoordinator.ModeratorDeleteTopicAgreement('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteTopicAgreement = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Topic Agreement - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddCallTopic = function() {
            smqCRUDCoordinator.ModeratorAddCallTopic('{}');
        }

        smqCRUDCoordinator.ModeratorAddCallTopic = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Call Topic - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addcalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetCallTopics = function() {
            smqCRUDCoordinator.ModeratorGetCallTopics('{}');
        }

        smqCRUDCoordinator.ModeratorGetCallTopics = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Call Topics - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getcalltopics', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateCallTopic = function() {
            smqCRUDCoordinator.ModeratorUpdateCallTopic('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateCallTopic = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Call Topic - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteCallTopic = function() {
            smqCRUDCoordinator.ModeratorDeleteCallTopic('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteCallTopic = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Call Topic - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddEpisodeCall = function() {
            smqCRUDCoordinator.ModeratorAddEpisodeCall('{}');
        }

        smqCRUDCoordinator.ModeratorAddEpisodeCall = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Episode Call - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetEpisodeCalls = function() {
            smqCRUDCoordinator.ModeratorGetEpisodeCalls('{}');
        }

        smqCRUDCoordinator.ModeratorGetEpisodeCalls = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Episode Calls - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getepisodecalls', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateEpisodeCall = function() {
            smqCRUDCoordinator.ModeratorUpdateEpisodeCall('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateEpisodeCall = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Episode Call - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteEpisodeCall = function() {
            smqCRUDCoordinator.ModeratorDeleteEpisodeCall('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteEpisodeCall = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Episode Call - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddOpenIssue = function() {
            smqCRUDCoordinator.ModeratorAddOpenIssue('{}');
        }

        smqCRUDCoordinator.ModeratorAddOpenIssue = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Open Issue - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetOpenIssues = function() {
            smqCRUDCoordinator.ModeratorGetOpenIssues('{}');
        }

        smqCRUDCoordinator.ModeratorGetOpenIssues = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Open Issues - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getopenissues', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateOpenIssue = function() {
            smqCRUDCoordinator.ModeratorUpdateOpenIssue('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateOpenIssue = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Open Issue - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteOpenIssue = function() {
            smqCRUDCoordinator.ModeratorDeleteOpenIssue('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteOpenIssue = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Open Issue - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddCallParticipant = function() {
            smqCRUDCoordinator.ModeratorAddCallParticipant('{}');
        }

        smqCRUDCoordinator.ModeratorAddCallParticipant = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Call Participant - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addcallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetCallParticipants = function() {
            smqCRUDCoordinator.ModeratorGetCallParticipants('{}');
        }

        smqCRUDCoordinator.ModeratorGetCallParticipants = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Call Participants - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getcallparticipants', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateCallParticipant = function() {
            smqCRUDCoordinator.ModeratorUpdateCallParticipant('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateCallParticipant = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Call Participant - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteCallParticipant = function() {
            smqCRUDCoordinator.ModeratorDeleteCallParticipant('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteCallParticipant = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Call Participant - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddPerson = function() {
            smqCRUDCoordinator.ModeratorAddPerson('{}');
        }

        smqCRUDCoordinator.ModeratorAddPerson = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Person - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetPeople = function() {
            smqCRUDCoordinator.ModeratorGetPeople('{}');
        }

        smqCRUDCoordinator.ModeratorGetPeople = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get People - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getpeople', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdatePerson = function() {
            smqCRUDCoordinator.ModeratorUpdatePerson('{}');
        }

        smqCRUDCoordinator.ModeratorUpdatePerson = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Person - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeletePerson = function() {
            smqCRUDCoordinator.ModeratorDeletePerson('{}');
        }

        smqCRUDCoordinator.ModeratorDeletePerson = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Person - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddTopicFallacy = function() {
            smqCRUDCoordinator.ModeratorAddTopicFallacy('{}');
        }

        smqCRUDCoordinator.ModeratorAddTopicFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Topic Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addtopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetTopicFallacies = function() {
            smqCRUDCoordinator.ModeratorGetTopicFallacies('{}');
        }

        smqCRUDCoordinator.ModeratorGetTopicFallacies = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Topic Fallacies - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.gettopicfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateTopicFallacy = function() {
            smqCRUDCoordinator.ModeratorUpdateTopicFallacy('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateTopicFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Topic Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteTopicFallacy = function() {
            smqCRUDCoordinator.ModeratorDeleteTopicFallacy('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteTopicFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Topic Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddShowSeason = function() {
            smqCRUDCoordinator.ModeratorAddShowSeason('{}');
        }

        smqCRUDCoordinator.ModeratorAddShowSeason = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Show Season - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetShowSeasons = function() {
            smqCRUDCoordinator.ModeratorGetShowSeasons('{}');
        }

        smqCRUDCoordinator.ModeratorGetShowSeasons = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Show Seasons - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getshowseasons', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateShowSeason = function() {
            smqCRUDCoordinator.ModeratorUpdateShowSeason('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateShowSeason = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Show Season - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteShowSeason = function() {
            smqCRUDCoordinator.ModeratorDeleteShowSeason('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteShowSeason = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Show Season - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddShow = function() {
            smqCRUDCoordinator.ModeratorAddShow('{}');
        }

        smqCRUDCoordinator.ModeratorAddShow = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Show - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetShows = function() {
            smqCRUDCoordinator.ModeratorGetShows('{}');
        }

        smqCRUDCoordinator.ModeratorGetShows = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Shows - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getshows', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateShow = function() {
            smqCRUDCoordinator.ModeratorUpdateShow('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateShow = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Show - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteShow = function() {
            smqCRUDCoordinator.ModeratorDeleteShow('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteShow = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Show - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorAddSeasonEpisode = function() {
            smqCRUDCoordinator.ModeratorAddSeasonEpisode('{}');
        }

        smqCRUDCoordinator.ModeratorAddSeasonEpisode = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Add Season Episode - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorGetSeasonEpisodes = function() {
            smqCRUDCoordinator.ModeratorGetSeasonEpisodes('{}');
        }

        smqCRUDCoordinator.ModeratorGetSeasonEpisodes = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Get Season Episodes - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getseasonepisodes', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorUpdateSeasonEpisode = function() {
            smqCRUDCoordinator.ModeratorUpdateSeasonEpisode('{}');
        }

        smqCRUDCoordinator.ModeratorUpdateSeasonEpisode = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Update Season Episode - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.ModeratorDeleteSeasonEpisode = function() {
            smqCRUDCoordinator.ModeratorDeleteSeasonEpisode('{}');
        }

        smqCRUDCoordinator.ModeratorDeleteSeasonEpisode = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Season Episode - ');
            smqCRUDCoordinator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
            // Can also say what 'Admin' can say.
            
        
        smqCRUDCoordinator.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqCRUDCoordinator.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqCRUDCoordinator.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqCRUDCoordinator.AdminAddEpisodeHost = function() {
            smqCRUDCoordinator.AdminAddEpisodeHost('{}');
        }

        smqCRUDCoordinator.AdminAddEpisodeHost = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Episode Host - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetEpisodeHosts = function() {
            smqCRUDCoordinator.AdminGetEpisodeHosts('{}');
        }

        smqCRUDCoordinator.AdminGetEpisodeHosts = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Episode Hosts - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getepisodehosts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateEpisodeHost = function() {
            smqCRUDCoordinator.AdminUpdateEpisodeHost('{}');
        }

        smqCRUDCoordinator.AdminUpdateEpisodeHost = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Episode Host - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteEpisodeHost = function() {
            smqCRUDCoordinator.AdminDeleteEpisodeHost('{}');
        }

        smqCRUDCoordinator.AdminDeleteEpisodeHost = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Episode Host - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddFallacy = function() {
            smqCRUDCoordinator.AdminAddFallacy('{}');
        }

        smqCRUDCoordinator.AdminAddFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetFallacies = function() {
            smqCRUDCoordinator.AdminGetFallacies('{}');
        }

        smqCRUDCoordinator.AdminGetFallacies = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Fallacies - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateFallacy = function() {
            smqCRUDCoordinator.AdminUpdateFallacy('{}');
        }

        smqCRUDCoordinator.AdminUpdateFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteFallacy = function() {
            smqCRUDCoordinator.AdminDeleteFallacy('{}');
        }

        smqCRUDCoordinator.AdminDeleteFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddTopicAgreement = function() {
            smqCRUDCoordinator.AdminAddTopicAgreement('{}');
        }

        smqCRUDCoordinator.AdminAddTopicAgreement = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Topic Agreement - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addtopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetTopicAgreements = function() {
            smqCRUDCoordinator.AdminGetTopicAgreements('{}');
        }

        smqCRUDCoordinator.AdminGetTopicAgreements = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Topic Agreements - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.gettopicagreements', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateTopicAgreement = function() {
            smqCRUDCoordinator.AdminUpdateTopicAgreement('{}');
        }

        smqCRUDCoordinator.AdminUpdateTopicAgreement = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Topic Agreement - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteTopicAgreement = function() {
            smqCRUDCoordinator.AdminDeleteTopicAgreement('{}');
        }

        smqCRUDCoordinator.AdminDeleteTopicAgreement = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Topic Agreement - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddCallTopic = function() {
            smqCRUDCoordinator.AdminAddCallTopic('{}');
        }

        smqCRUDCoordinator.AdminAddCallTopic = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Call Topic - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetCallTopics = function() {
            smqCRUDCoordinator.AdminGetCallTopics('{}');
        }

        smqCRUDCoordinator.AdminGetCallTopics = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Call Topics - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcalltopics', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateCallTopic = function() {
            smqCRUDCoordinator.AdminUpdateCallTopic('{}');
        }

        smqCRUDCoordinator.AdminUpdateCallTopic = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Call Topic - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteCallTopic = function() {
            smqCRUDCoordinator.AdminDeleteCallTopic('{}');
        }

        smqCRUDCoordinator.AdminDeleteCallTopic = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Call Topic - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddEpisodeCall = function() {
            smqCRUDCoordinator.AdminAddEpisodeCall('{}');
        }

        smqCRUDCoordinator.AdminAddEpisodeCall = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Episode Call - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetEpisodeCalls = function() {
            smqCRUDCoordinator.AdminGetEpisodeCalls('{}');
        }

        smqCRUDCoordinator.AdminGetEpisodeCalls = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Episode Calls - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getepisodecalls', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateEpisodeCall = function() {
            smqCRUDCoordinator.AdminUpdateEpisodeCall('{}');
        }

        smqCRUDCoordinator.AdminUpdateEpisodeCall = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Episode Call - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteEpisodeCall = function() {
            smqCRUDCoordinator.AdminDeleteEpisodeCall('{}');
        }

        smqCRUDCoordinator.AdminDeleteEpisodeCall = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Episode Call - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddOpenIssue = function() {
            smqCRUDCoordinator.AdminAddOpenIssue('{}');
        }

        smqCRUDCoordinator.AdminAddOpenIssue = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Open Issue - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetOpenIssues = function() {
            smqCRUDCoordinator.AdminGetOpenIssues('{}');
        }

        smqCRUDCoordinator.AdminGetOpenIssues = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Open Issues - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getopenissues', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateOpenIssue = function() {
            smqCRUDCoordinator.AdminUpdateOpenIssue('{}');
        }

        smqCRUDCoordinator.AdminUpdateOpenIssue = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Open Issue - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteOpenIssue = function() {
            smqCRUDCoordinator.AdminDeleteOpenIssue('{}');
        }

        smqCRUDCoordinator.AdminDeleteOpenIssue = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Open Issue - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddCallParticipant = function() {
            smqCRUDCoordinator.AdminAddCallParticipant('{}');
        }

        smqCRUDCoordinator.AdminAddCallParticipant = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Call Participant - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetCallParticipants = function() {
            smqCRUDCoordinator.AdminGetCallParticipants('{}');
        }

        smqCRUDCoordinator.AdminGetCallParticipants = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Call Participants - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcallparticipants', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateCallParticipant = function() {
            smqCRUDCoordinator.AdminUpdateCallParticipant('{}');
        }

        smqCRUDCoordinator.AdminUpdateCallParticipant = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Call Participant - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteCallParticipant = function() {
            smqCRUDCoordinator.AdminDeleteCallParticipant('{}');
        }

        smqCRUDCoordinator.AdminDeleteCallParticipant = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Call Participant - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddPerson = function() {
            smqCRUDCoordinator.AdminAddPerson('{}');
        }

        smqCRUDCoordinator.AdminAddPerson = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Person - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetPeople = function() {
            smqCRUDCoordinator.AdminGetPeople('{}');
        }

        smqCRUDCoordinator.AdminGetPeople = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get People - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getpeople', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdatePerson = function() {
            smqCRUDCoordinator.AdminUpdatePerson('{}');
        }

        smqCRUDCoordinator.AdminUpdatePerson = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Person - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeletePerson = function() {
            smqCRUDCoordinator.AdminDeletePerson('{}');
        }

        smqCRUDCoordinator.AdminDeletePerson = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Person - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddTopicFallacy = function() {
            smqCRUDCoordinator.AdminAddTopicFallacy('{}');
        }

        smqCRUDCoordinator.AdminAddTopicFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Topic Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addtopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetTopicFallacies = function() {
            smqCRUDCoordinator.AdminGetTopicFallacies('{}');
        }

        smqCRUDCoordinator.AdminGetTopicFallacies = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Topic Fallacies - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.gettopicfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateTopicFallacy = function() {
            smqCRUDCoordinator.AdminUpdateTopicFallacy('{}');
        }

        smqCRUDCoordinator.AdminUpdateTopicFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Topic Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteTopicFallacy = function() {
            smqCRUDCoordinator.AdminDeleteTopicFallacy('{}');
        }

        smqCRUDCoordinator.AdminDeleteTopicFallacy = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Topic Fallacy - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddShowSeason = function() {
            smqCRUDCoordinator.AdminAddShowSeason('{}');
        }

        smqCRUDCoordinator.AdminAddShowSeason = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Show Season - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetShowSeasons = function() {
            smqCRUDCoordinator.AdminGetShowSeasons('{}');
        }

        smqCRUDCoordinator.AdminGetShowSeasons = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Show Seasons - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getshowseasons', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateShowSeason = function() {
            smqCRUDCoordinator.AdminUpdateShowSeason('{}');
        }

        smqCRUDCoordinator.AdminUpdateShowSeason = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Show Season - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteShowSeason = function() {
            smqCRUDCoordinator.AdminDeleteShowSeason('{}');
        }

        smqCRUDCoordinator.AdminDeleteShowSeason = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Show Season - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddShow = function() {
            smqCRUDCoordinator.AdminAddShow('{}');
        }

        smqCRUDCoordinator.AdminAddShow = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Show - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetShows = function() {
            smqCRUDCoordinator.AdminGetShows('{}');
        }

        smqCRUDCoordinator.AdminGetShows = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Shows - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getshows', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateShow = function() {
            smqCRUDCoordinator.AdminUpdateShow('{}');
        }

        smqCRUDCoordinator.AdminUpdateShow = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Show - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteShow = function() {
            smqCRUDCoordinator.AdminDeleteShow('{}');
        }

        smqCRUDCoordinator.AdminDeleteShow = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Show - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddSeasonEpisode = function() {
            smqCRUDCoordinator.AdminAddSeasonEpisode('{}');
        }

        smqCRUDCoordinator.AdminAddSeasonEpisode = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add Season Episode - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetSeasonEpisodes = function() {
            smqCRUDCoordinator.AdminGetSeasonEpisodes('{}');
        }

        smqCRUDCoordinator.AdminGetSeasonEpisodes = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get Season Episodes - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getseasonepisodes', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateSeasonEpisode = function() {
            smqCRUDCoordinator.AdminUpdateSeasonEpisode('{}');
        }

        smqCRUDCoordinator.AdminUpdateSeasonEpisode = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update Season Episode - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteSeasonEpisode = function() {
            smqCRUDCoordinator.AdminDeleteSeasonEpisode('{}');
        }

        smqCRUDCoordinator.AdminDeleteSeasonEpisode = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Season Episode - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        

    return smqCRUDCoordinator;
}

                    