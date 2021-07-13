

export default function generateModeratorActor() {
    var smqModerator = {
    };
    
    smqModerator.defer = function() {
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

    smqModerator.connect = function (virtualHost, username, password, on_received, after_connect) {
        console.warn('set `smqModerator.showPingPongs = true` to get verbose logging.');
        smqModerator.virtualHost = virtualHost;
        smqModerator.username = username;
        smqModerator.password = password;
        smqModerator.rabbitEndpoint = smqModerator.rabbitEndpoint || window.rabbitEndpoint || 'ws://sassymq.anabstractlevel.com:15674/ws';
        smqModerator.Moderator_all_connection = {};
        smqModerator.messages = [];
        smqModerator.waitingReply = [];
        
        smqModerator.client = window.Stomp.client(smqModerator.rabbitEndpoint);

        smqModerator.client.debug = function (m, p) {
            if (((m == ">>> PING") || (m == "<<< PONG")) && !smqModerator.showPingPongs) return;
            else {
                if (m == "<<< ") m = ""
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

        smqModerator.checkMessage = function(msg) {
            
                if (smqModerator.onModeratorCallUpdated) {
                    if (msg.headers && (msg.headers.destination.includes('moderator.custom.moderator.callupdated'))) {
                        var rpayload = smqModerator.onModeratorCallUpdated(msg.body, msg);
                        if (rpayload) smqModerator.sendReply(rpayload, msg);
                    }
                }
            
               
        }

        var on_connect = function (x) {
            smqModerator.Moderator_all_connection = smqModerator.client.subscribe("/exchange/moderator.all/#",
                    function (d) {
                        if (d.body) d.body = JSON.parse(d.body);
                        smqModerator.messages.push(d);
                        smqModerator.checkMessage(d);
                        if (on_received) on_received(d);
                        if (smqModerator.showPingPongs) console.log('      --------  MESSAGE FOR smqModerator: ', d);
                    }, {
                        durable: false,
                        requeue: true
                    });
            smqModerator.client.onreceive =  function (d) {
                        var body = JSON.parse(d.body);
                        var corrID = d.headers["correlation-id"];
                        var waitingDeferred = smqModerator.waitingReply[corrID];

                        if (waitingDeferred && body.IsHandled) {
                            delete smqModerator.waitingReply[corrID];
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

        console.log('connecting to: ' + smqModerator.rabbitEndpoint + ', using ' + username + '/' + password);
        smqModerator.client.connect(smqModerator.username, smqModerator.password, on_connect, on_error, smqModerator.virtualHost);
    };

    smqModerator.disconnect = function() {
        if (smqModerator && smqModerator.client) 
        {
            smqModerator.client.disconnect();
        }
    }

    smqModerator.stringifyValue = function(value) {
        if (!value) value = '{}';
            if (typeof value == 'object') {
                value = JSON.stringify(value);
            }
        return value;
    };
    
    smqModerator.sendReply = function(replyPayload, msg) {
        if (replyPayload && msg && msg.headers && msg.headers['reply-to']) {
            replyPayload.IsHandled = true;
            smqModerator.client.send(msg.headers['reply-to'], 
                        { "content-type": "application/json", 
                          "reply-to":"/temp-queue/response-queue", 
                          "correlation-id":msg.headers['correlation-id'] 
                        }, JSON.stringify(replyPayload));
        }
    };

    
        
        smqModerator.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqModerator.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqModerator.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqModerator.CallUpdated = function() {
            smqModerator.CallUpdated('{}');
        }

        smqModerator.CallUpdated = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Call Updated - ');
            smqModerator.client.send('/exchange/moderatormic/moderator.custom.moderator.callupdated', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddEpisodeHost = function() {
            smqModerator.AddEpisodeHost('{}');
        }

        smqModerator.AddEpisodeHost = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Episode Host - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetEpisodeHosts = function() {
            smqModerator.GetEpisodeHosts('{}');
        }

        smqModerator.GetEpisodeHosts = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Episode Hosts - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getepisodehosts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateEpisodeHost = function() {
            smqModerator.UpdateEpisodeHost('{}');
        }

        smqModerator.UpdateEpisodeHost = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Episode Host - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteEpisodeHost = function() {
            smqModerator.DeleteEpisodeHost('{}');
        }

        smqModerator.DeleteEpisodeHost = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Episode Host - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddFallacy = function() {
            smqModerator.AddFallacy('{}');
        }

        smqModerator.AddFallacy = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Fallacy - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetFallacies = function() {
            smqModerator.GetFallacies('{}');
        }

        smqModerator.GetFallacies = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Fallacies - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateFallacy = function() {
            smqModerator.UpdateFallacy('{}');
        }

        smqModerator.UpdateFallacy = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Fallacy - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteFallacy = function() {
            smqModerator.DeleteFallacy('{}');
        }

        smqModerator.DeleteFallacy = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Fallacy - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddTopicAgreement = function() {
            smqModerator.AddTopicAgreement('{}');
        }

        smqModerator.AddTopicAgreement = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Topic Agreement - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addtopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetTopicAgreements = function() {
            smqModerator.GetTopicAgreements('{}');
        }

        smqModerator.GetTopicAgreements = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Topic Agreements - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.gettopicagreements', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateTopicAgreement = function() {
            smqModerator.UpdateTopicAgreement('{}');
        }

        smqModerator.UpdateTopicAgreement = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Topic Agreement - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteTopicAgreement = function() {
            smqModerator.DeleteTopicAgreement('{}');
        }

        smqModerator.DeleteTopicAgreement = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Topic Agreement - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddCallTopic = function() {
            smqModerator.AddCallTopic('{}');
        }

        smqModerator.AddCallTopic = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Call Topic - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addcalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetCallTopics = function() {
            smqModerator.GetCallTopics('{}');
        }

        smqModerator.GetCallTopics = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Call Topics - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getcalltopics', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateCallTopic = function() {
            smqModerator.UpdateCallTopic('{}');
        }

        smqModerator.UpdateCallTopic = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Call Topic - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteCallTopic = function() {
            smqModerator.DeleteCallTopic('{}');
        }

        smqModerator.DeleteCallTopic = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Call Topic - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddEpisodeCall = function() {
            smqModerator.AddEpisodeCall('{}');
        }

        smqModerator.AddEpisodeCall = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Episode Call - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetEpisodeCalls = function() {
            smqModerator.GetEpisodeCalls('{}');
        }

        smqModerator.GetEpisodeCalls = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Episode Calls - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getepisodecalls', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateEpisodeCall = function() {
            smqModerator.UpdateEpisodeCall('{}');
        }

        smqModerator.UpdateEpisodeCall = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Episode Call - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteEpisodeCall = function() {
            smqModerator.DeleteEpisodeCall('{}');
        }

        smqModerator.DeleteEpisodeCall = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Episode Call - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddOpenIssue = function() {
            smqModerator.AddOpenIssue('{}');
        }

        smqModerator.AddOpenIssue = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Open Issue - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetOpenIssues = function() {
            smqModerator.GetOpenIssues('{}');
        }

        smqModerator.GetOpenIssues = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Open Issues - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getopenissues', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateOpenIssue = function() {
            smqModerator.UpdateOpenIssue('{}');
        }

        smqModerator.UpdateOpenIssue = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Open Issue - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteOpenIssue = function() {
            smqModerator.DeleteOpenIssue('{}');
        }

        smqModerator.DeleteOpenIssue = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Open Issue - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddCallParticipant = function() {
            smqModerator.AddCallParticipant('{}');
        }

        smqModerator.AddCallParticipant = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Call Participant - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addcallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetCallParticipants = function() {
            smqModerator.GetCallParticipants('{}');
        }

        smqModerator.GetCallParticipants = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Call Participants - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getcallparticipants', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateCallParticipant = function() {
            smqModerator.UpdateCallParticipant('{}');
        }

        smqModerator.UpdateCallParticipant = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Call Participant - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteCallParticipant = function() {
            smqModerator.DeleteCallParticipant('{}');
        }

        smqModerator.DeleteCallParticipant = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Call Participant - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddPerson = function() {
            smqModerator.AddPerson('{}');
        }

        smqModerator.AddPerson = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Person - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetPeople = function() {
            smqModerator.GetPeople('{}');
        }

        smqModerator.GetPeople = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get People - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getpeople', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdatePerson = function() {
            smqModerator.UpdatePerson('{}');
        }

        smqModerator.UpdatePerson = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Person - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeletePerson = function() {
            smqModerator.DeletePerson('{}');
        }

        smqModerator.DeletePerson = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Person - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddTopicFallacy = function() {
            smqModerator.AddTopicFallacy('{}');
        }

        smqModerator.AddTopicFallacy = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Topic Fallacy - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addtopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetTopicFallacies = function() {
            smqModerator.GetTopicFallacies('{}');
        }

        smqModerator.GetTopicFallacies = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Topic Fallacies - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.gettopicfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateTopicFallacy = function() {
            smqModerator.UpdateTopicFallacy('{}');
        }

        smqModerator.UpdateTopicFallacy = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Topic Fallacy - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updatetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteTopicFallacy = function() {
            smqModerator.DeleteTopicFallacy('{}');
        }

        smqModerator.DeleteTopicFallacy = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Topic Fallacy - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deletetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddShowSeason = function() {
            smqModerator.AddShowSeason('{}');
        }

        smqModerator.AddShowSeason = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Show Season - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetShowSeasons = function() {
            smqModerator.GetShowSeasons('{}');
        }

        smqModerator.GetShowSeasons = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Show Seasons - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getshowseasons', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateShowSeason = function() {
            smqModerator.UpdateShowSeason('{}');
        }

        smqModerator.UpdateShowSeason = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Show Season - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteShowSeason = function() {
            smqModerator.DeleteShowSeason('{}');
        }

        smqModerator.DeleteShowSeason = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Show Season - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddShow = function() {
            smqModerator.AddShow('{}');
        }

        smqModerator.AddShow = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Show - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetShows = function() {
            smqModerator.GetShows('{}');
        }

        smqModerator.GetShows = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Shows - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getshows', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateShow = function() {
            smqModerator.UpdateShow('{}');
        }

        smqModerator.UpdateShow = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Show - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteShow = function() {
            smqModerator.DeleteShow('{}');
        }

        smqModerator.DeleteShow = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Show - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.AddSeasonEpisode = function() {
            smqModerator.AddSeasonEpisode('{}');
        }

        smqModerator.AddSeasonEpisode = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Add Season Episode - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.addseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.GetSeasonEpisodes = function() {
            smqModerator.GetSeasonEpisodes('{}');
        }

        smqModerator.GetSeasonEpisodes = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Get Season Episodes - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.getseasonepisodes', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.UpdateSeasonEpisode = function() {
            smqModerator.UpdateSeasonEpisode('{}');
        }

        smqModerator.UpdateSeasonEpisode = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Update Season Episode - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.updateseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqModerator.DeleteSeasonEpisode = function() {
            smqModerator.DeleteSeasonEpisode('{}');
        }

        smqModerator.DeleteSeasonEpisode = function(payload) {
            payload = smqModerator.stringifyValue(payload);
            var id = smqModerator.createUUID();
            var deferred = smqModerator.waitingReply[id] = smqModerator.defer();
            if (smqModerator.showPingPongs) console.log('Delete Season Episode - ');
            smqModerator.client.send('/exchange/moderatormic/crudcoordinator.crud.moderator.deleteseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqModerator.waitFor(id);
            
            return deferred.promise;
        }
        

    return smqModerator;
}

                    