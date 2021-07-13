

function generateAdminActor() {
    var smqAdmin = {
    };
    
    smqAdmin.defer = function() {
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

    smqAdmin.connect = function (virtualHost, username, password, on_received, after_connect) {
        console.warn('set `smqAdmin.showPingPongs = true` to get verbose logging.');
        smqAdmin.virtualHost = virtualHost;
        smqAdmin.username = username;
        smqAdmin.password = password;
        smqAdmin.rabbitEndpoint = smqAdmin.rabbitEndpoint || window.rabbitEndpoint || 'ws://sassymq.anabstractlevel.com:15674/ws';
        smqAdmin.Admin_all_connection = {};
        smqAdmin.messages = [];
        smqAdmin.waitingReply = [];
        
        smqAdmin.client = Stomp.client(smqAdmin.rabbitEndpoint);

        smqAdmin.client.debug = function (m, p) {
            if (((m == ">>> PING") || (m == "<<< PONG")) && !smqAdmin.showPingPongs) return;
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

        smqAdmin.checkMessage = function(msg) {
            
               
        }

        var on_connect = function (x) {
            smqAdmin.Admin_all_connection = smqAdmin.client.subscribe("/exchange/admin.all/#",
                    function (d) {
                        if (d.body) d.body = JSON.parse(d.body);
                        smqAdmin.messages.push(d);
                        smqAdmin.checkMessage(d);
                        if (on_received) on_received(d);
                        if (smqAdmin.showPingPongs) console.log('      --------  MESSAGE FOR smqAdmin: ', d);
                    }, {
                        durable: false,
                        requeue: true
                    });
            smqAdmin.client.onreceive =  function (d) {
                        var body = JSON.parse(d.body);
                        var corrID = d.headers["correlation-id"];
                        var waitingDeferred = smqAdmin.waitingReply[corrID];

                        if (waitingDeferred && body.IsHandled) {
                            delete smqAdmin.waitingReply[corrID];
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

        console.log('connecting to: ' + smqAdmin.rabbitEndpoint + ', using ' + username + '/' + password);
        smqAdmin.client.connect(smqAdmin.username, smqAdmin.password, on_connect, on_error, smqAdmin.virtualHost);
    };

    smqAdmin.disconnect = function() {
        if (smqAdmin && smqAdmin.client) 
        {
            smqAdmin.client.disconnect();
        }
    }

    smqAdmin.stringifyValue = function(value) {
        if (!value) value = '{}';
            if (typeof value == 'object') {
                value = JSON.stringify(value);
            }
        return value;
    };
    
    smqAdmin.sendReply = function(replyPayload, msg) {
        if (replyPayload && msg && msg.headers && msg.headers['reply-to']) {
            replyPayload.IsHandled = true;
            smqAdmin.client.send(msg.headers['reply-to'], 
                        { "content-type": "application/json", 
                          "reply-to":"/temp-queue/response-queue", 
                          "correlation-id":msg.headers['correlation-id'] 
                        }, JSON.stringify(replyPayload));
        }
    };

    
        
        smqAdmin.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqAdmin.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqAdmin.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqAdmin.AddEpisodeHost = function() {
            smqAdmin.AddEpisodeHost('{}');
        }

        smqAdmin.AddEpisodeHost = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Episode Host - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetEpisodeHosts = function() {
            smqAdmin.GetEpisodeHosts('{}');
        }

        smqAdmin.GetEpisodeHosts = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Episode Hosts - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getepisodehosts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateEpisodeHost = function() {
            smqAdmin.UpdateEpisodeHost('{}');
        }

        smqAdmin.UpdateEpisodeHost = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Episode Host - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteEpisodeHost = function() {
            smqAdmin.DeleteEpisodeHost('{}');
        }

        smqAdmin.DeleteEpisodeHost = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Episode Host - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteepisodehost', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddFallacy = function() {
            smqAdmin.AddFallacy('{}');
        }

        smqAdmin.AddFallacy = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Fallacy - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetFallacies = function() {
            smqAdmin.GetFallacies('{}');
        }

        smqAdmin.GetFallacies = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Fallacies - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateFallacy = function() {
            smqAdmin.UpdateFallacy('{}');
        }

        smqAdmin.UpdateFallacy = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Fallacy - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteFallacy = function() {
            smqAdmin.DeleteFallacy('{}');
        }

        smqAdmin.DeleteFallacy = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Fallacy - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletefallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddTopicAgreement = function() {
            smqAdmin.AddTopicAgreement('{}');
        }

        smqAdmin.AddTopicAgreement = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Topic Agreement - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addtopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetTopicAgreements = function() {
            smqAdmin.GetTopicAgreements('{}');
        }

        smqAdmin.GetTopicAgreements = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Topic Agreements - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.gettopicagreements', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateTopicAgreement = function() {
            smqAdmin.UpdateTopicAgreement('{}');
        }

        smqAdmin.UpdateTopicAgreement = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Topic Agreement - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteTopicAgreement = function() {
            smqAdmin.DeleteTopicAgreement('{}');
        }

        smqAdmin.DeleteTopicAgreement = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Topic Agreement - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletetopicagreement', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddCallTopic = function() {
            smqAdmin.AddCallTopic('{}');
        }

        smqAdmin.AddCallTopic = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Call Topic - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetCallTopics = function() {
            smqAdmin.GetCallTopics('{}');
        }

        smqAdmin.GetCallTopics = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Call Topics - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcalltopics', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateCallTopic = function() {
            smqAdmin.UpdateCallTopic('{}');
        }

        smqAdmin.UpdateCallTopic = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Call Topic - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteCallTopic = function() {
            smqAdmin.DeleteCallTopic('{}');
        }

        smqAdmin.DeleteCallTopic = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Call Topic - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecalltopic', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddEpisodeCall = function() {
            smqAdmin.AddEpisodeCall('{}');
        }

        smqAdmin.AddEpisodeCall = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Episode Call - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetEpisodeCalls = function() {
            smqAdmin.GetEpisodeCalls('{}');
        }

        smqAdmin.GetEpisodeCalls = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Episode Calls - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getepisodecalls', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateEpisodeCall = function() {
            smqAdmin.UpdateEpisodeCall('{}');
        }

        smqAdmin.UpdateEpisodeCall = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Episode Call - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteEpisodeCall = function() {
            smqAdmin.DeleteEpisodeCall('{}');
        }

        smqAdmin.DeleteEpisodeCall = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Episode Call - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteepisodecall', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddOpenIssue = function() {
            smqAdmin.AddOpenIssue('{}');
        }

        smqAdmin.AddOpenIssue = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Open Issue - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetOpenIssues = function() {
            smqAdmin.GetOpenIssues('{}');
        }

        smqAdmin.GetOpenIssues = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Open Issues - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getopenissues', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateOpenIssue = function() {
            smqAdmin.UpdateOpenIssue('{}');
        }

        smqAdmin.UpdateOpenIssue = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Open Issue - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteOpenIssue = function() {
            smqAdmin.DeleteOpenIssue('{}');
        }

        smqAdmin.DeleteOpenIssue = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Open Issue - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteopenissue', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddCallParticipant = function() {
            smqAdmin.AddCallParticipant('{}');
        }

        smqAdmin.AddCallParticipant = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Call Participant - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetCallParticipants = function() {
            smqAdmin.GetCallParticipants('{}');
        }

        smqAdmin.GetCallParticipants = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Call Participants - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcallparticipants', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateCallParticipant = function() {
            smqAdmin.UpdateCallParticipant('{}');
        }

        smqAdmin.UpdateCallParticipant = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Call Participant - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteCallParticipant = function() {
            smqAdmin.DeleteCallParticipant('{}');
        }

        smqAdmin.DeleteCallParticipant = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Call Participant - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecallparticipant', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddPerson = function() {
            smqAdmin.AddPerson('{}');
        }

        smqAdmin.AddPerson = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Person - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetPeople = function() {
            smqAdmin.GetPeople('{}');
        }

        smqAdmin.GetPeople = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get People - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getpeople', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdatePerson = function() {
            smqAdmin.UpdatePerson('{}');
        }

        smqAdmin.UpdatePerson = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Person - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeletePerson = function() {
            smqAdmin.DeletePerson('{}');
        }

        smqAdmin.DeletePerson = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Person - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteperson', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddTopicFallacy = function() {
            smqAdmin.AddTopicFallacy('{}');
        }

        smqAdmin.AddTopicFallacy = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Topic Fallacy - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addtopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetTopicFallacies = function() {
            smqAdmin.GetTopicFallacies('{}');
        }

        smqAdmin.GetTopicFallacies = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Topic Fallacies - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.gettopicfallacies', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateTopicFallacy = function() {
            smqAdmin.UpdateTopicFallacy('{}');
        }

        smqAdmin.UpdateTopicFallacy = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Topic Fallacy - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteTopicFallacy = function() {
            smqAdmin.DeleteTopicFallacy('{}');
        }

        smqAdmin.DeleteTopicFallacy = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Topic Fallacy - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletetopicfallacy', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddShowSeason = function() {
            smqAdmin.AddShowSeason('{}');
        }

        smqAdmin.AddShowSeason = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Show Season - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetShowSeasons = function() {
            smqAdmin.GetShowSeasons('{}');
        }

        smqAdmin.GetShowSeasons = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Show Seasons - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getshowseasons', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateShowSeason = function() {
            smqAdmin.UpdateShowSeason('{}');
        }

        smqAdmin.UpdateShowSeason = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Show Season - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteShowSeason = function() {
            smqAdmin.DeleteShowSeason('{}');
        }

        smqAdmin.DeleteShowSeason = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Show Season - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteshowseason', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddShow = function() {
            smqAdmin.AddShow('{}');
        }

        smqAdmin.AddShow = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Show - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetShows = function() {
            smqAdmin.GetShows('{}');
        }

        smqAdmin.GetShows = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Shows - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getshows', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateShow = function() {
            smqAdmin.UpdateShow('{}');
        }

        smqAdmin.UpdateShow = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Show - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteShow = function() {
            smqAdmin.DeleteShow('{}');
        }

        smqAdmin.DeleteShow = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Show - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteshow', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddSeasonEpisode = function() {
            smqAdmin.AddSeasonEpisode('{}');
        }

        smqAdmin.AddSeasonEpisode = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add Season Episode - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetSeasonEpisodes = function() {
            smqAdmin.GetSeasonEpisodes('{}');
        }

        smqAdmin.GetSeasonEpisodes = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get Season Episodes - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getseasonepisodes', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateSeasonEpisode = function() {
            smqAdmin.UpdateSeasonEpisode('{}');
        }

        smqAdmin.UpdateSeasonEpisode = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update Season Episode - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updateseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteSeasonEpisode = function() {
            smqAdmin.DeleteSeasonEpisode('{}');
        }

        smqAdmin.DeleteSeasonEpisode = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete Season Episode - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deleteseasonepisode', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        

    return smqAdmin;
}

                    