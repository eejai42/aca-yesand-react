

function generateGuestActor() {
    var smqGuest = {
    };
    
    smqGuest.defer = function() {
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

    smqGuest.connect = function (virtualHost, username, password, on_received, after_connect) {
        console.warn('set `smqGuest.showPingPongs = true` to get verbose logging.');
        smqGuest.virtualHost = virtualHost;
        smqGuest.username = username;
        smqGuest.password = password;
        smqGuest.rabbitEndpoint = smqGuest.rabbitEndpoint || window.rabbitEndpoint || 'ws://sassymq.anabstractlevel.com:15674/ws';
        smqGuest.Guest_all_connection = {};
        smqGuest.messages = [];
        smqGuest.waitingReply = [];
        
        smqGuest.client = Stomp.client(smqGuest.rabbitEndpoint);

        smqGuest.client.debug = function (m, p) {
            if (((m == ">>> PING") || (m == "<<< PONG")) && !smqGuest.showPingPongs) return;
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

        smqGuest.checkMessage = function(msg) {
            
               
        }

        var on_connect = function (x) {
            smqGuest.Guest_all_connection = smqGuest.client.subscribe("/exchange/guest.all/#",
                    function (d) {
                        if (d.body) d.body = JSON.parse(d.body);
                        smqGuest.messages.push(d);
                        smqGuest.checkMessage(d);
                        if (on_received) on_received(d);
                        if (smqGuest.showPingPongs) console.log('      --------  MESSAGE FOR smqGuest: ', d);
                    }, {
                        durable: false,
                        requeue: true
                    });
            smqGuest.client.onreceive =  function (d) {
                        var body = JSON.parse(d.body);
                        var corrID = d.headers["correlation-id"];
                        var waitingDeferred = smqGuest.waitingReply[corrID];

                        if (waitingDeferred && body.IsHandled) {
                            delete smqGuest.waitingReply[corrID];
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

        console.log('connecting to: ' + smqGuest.rabbitEndpoint + ', using ' + username + '/' + password);
        smqGuest.client.connect(smqGuest.username, smqGuest.password, on_connect, on_error, smqGuest.virtualHost);
    };

    smqGuest.disconnect = function() {
        if (smqGuest && smqGuest.client) 
        {
            smqGuest.client.disconnect();
        }
    }

    smqGuest.stringifyValue = function(value) {
        if (!value) value = '{}';
            if (typeof value == 'object') {
                value = JSON.stringify(value);
            }
        return value;
    };
    
    smqGuest.sendReply = function(replyPayload, msg) {
        if (replyPayload && msg && msg.headers && msg.headers['reply-to']) {
            replyPayload.IsHandled = true;
            smqGuest.client.send(msg.headers['reply-to'], 
                        { "content-type": "application/json", 
                          "reply-to":"/temp-queue/response-queue", 
                          "correlation-id":msg.headers['correlation-id'] 
                        }, JSON.stringify(replyPayload));
        }
    };

    
        
        smqGuest.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqGuest.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqGuest.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqGuest.RequestToken = function() {
            smqGuest.RequestToken('{}');
        }

        smqGuest.RequestToken = function(payload) {
            payload = smqGuest.stringifyValue(payload);
            var id = smqGuest.createUUID();
            var deferred = smqGuest.waitingReply[id] = smqGuest.defer();
            if (smqGuest.showPingPongs) console.log('Request Token - ');
            smqGuest.client.send('/exchange/guestmic/crudcoordinator.general.guest.requesttoken', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqGuest.waitFor(id);
            
            return deferred.promise;
        }
        
        smqGuest.ValidateTemporaryAccessToken = function() {
            smqGuest.ValidateTemporaryAccessToken('{}');
        }

        smqGuest.ValidateTemporaryAccessToken = function(payload) {
            payload = smqGuest.stringifyValue(payload);
            var id = smqGuest.createUUID();
            var deferred = smqGuest.waitingReply[id] = smqGuest.defer();
            if (smqGuest.showPingPongs) console.log('Validate Temporary Access Token - ');
            smqGuest.client.send('/exchange/guestmic/crudcoordinator.general.guest.validatetemporaryaccesstoken', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqGuest.waitFor(id);
            
            return deferred.promise;
        }
        
        smqGuest.WhoAmI = function() {
            smqGuest.WhoAmI('{}');
        }

        smqGuest.WhoAmI = function(payload) {
            payload = smqGuest.stringifyValue(payload);
            var id = smqGuest.createUUID();
            var deferred = smqGuest.waitingReply[id] = smqGuest.defer();
            if (smqGuest.showPingPongs) console.log('Who Am I - ');
            smqGuest.client.send('/exchange/guestmic/crudcoordinator.general.guest.whoami', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqGuest.waitFor(id);
            
            return deferred.promise;
        }
        
        smqGuest.WhoAreYou = function() {
            smqGuest.WhoAreYou('{}');
        }

        smqGuest.WhoAreYou = function(payload) {
            payload = smqGuest.stringifyValue(payload);
            var id = smqGuest.createUUID();
            var deferred = smqGuest.waitingReply[id] = smqGuest.defer();
            if (smqGuest.showPingPongs) console.log('Who Are You - ');
            smqGuest.client.send('/exchange/guestmic/crudcoordinator.general.guest.whoareyou', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqGuest.waitFor(id);
            
            return deferred.promise;
        }
        
        smqGuest.StoreTempFile = function() {
            smqGuest.StoreTempFile('{}');
        }

        smqGuest.StoreTempFile = function(payload) {
            payload = smqGuest.stringifyValue(payload);
            var id = smqGuest.createUUID();
            var deferred = smqGuest.waitingReply[id] = smqGuest.defer();
            if (smqGuest.showPingPongs) console.log('Store Temp File - ');
            smqGuest.client.send('/exchange/guestmic/crudcoordinator.utlity.guest.storetempfile', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqGuest.waitFor(id);
            
            return deferred.promise;
        }
        
        smqGuest.Search = function() {
            smqGuest.Search('{}');
        }

        smqGuest.Search = function(payload) {
            payload = smqGuest.stringifyValue(payload);
            var id = smqGuest.createUUID();
            var deferred = smqGuest.waitingReply[id] = smqGuest.defer();
            if (smqGuest.showPingPongs) console.log('Search - ');
            smqGuest.client.send('/exchange/guestmic/crudcoordinator.custom.guest.search', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqGuest.waitFor(id);
            
            return deferred.promise;
        }
        
        smqGuest.GetCategories = function() {
            smqGuest.GetCategories('{}');
        }

        smqGuest.GetCategories = function(payload) {
            payload = smqGuest.stringifyValue(payload);
            var id = smqGuest.createUUID();
            var deferred = smqGuest.waitingReply[id] = smqGuest.defer();
            if (smqGuest.showPingPongs) console.log('Get Categories - ');
            smqGuest.client.send('/exchange/guestmic/crudcoordinator.custom.guest.getcategories', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqGuest.waitFor(id);
            
            return deferred.promise;
        }
        

    return smqGuest;
}

                    