

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


        
        smqAdmin.AddCIN7ProductStockLevel = function() {
            smqAdmin.AddCIN7ProductStockLevel('{}');
        }

        smqAdmin.AddCIN7ProductStockLevel = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 Product Stock Level - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7productstocklevel', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetCIN7ProductStockLevels = function() {
            smqAdmin.GetCIN7ProductStockLevels('{}');
        }

        smqAdmin.GetCIN7ProductStockLevels = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Product Stock Levels - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7productstocklevels', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateCIN7ProductStockLevel = function() {
            smqAdmin.UpdateCIN7ProductStockLevel('{}');
        }

        smqAdmin.UpdateCIN7ProductStockLevel = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 Product Stock Level - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7productstocklevel', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteCIN7ProductStockLevel = function() {
            smqAdmin.DeleteCIN7ProductStockLevel('{}');
        }

        smqAdmin.DeleteCIN7ProductStockLevel = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 Product Stock Level - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7productstocklevel', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddCIN7User = function() {
            smqAdmin.AddCIN7User('{}');
        }

        smqAdmin.AddCIN7User = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 User - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7user', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetCIN7Users = function() {
            smqAdmin.GetCIN7Users('{}');
        }

        smqAdmin.GetCIN7Users = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Users - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7users', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateCIN7User = function() {
            smqAdmin.UpdateCIN7User('{}');
        }

        smqAdmin.UpdateCIN7User = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 User - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7user', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteCIN7User = function() {
            smqAdmin.DeleteCIN7User('{}');
        }

        smqAdmin.DeleteCIN7User = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 User - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7user', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddCIN7Contact = function() {
            smqAdmin.AddCIN7Contact('{}');
        }

        smqAdmin.AddCIN7Contact = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 Contact - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7contact', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetCIN7Contacts = function() {
            smqAdmin.GetCIN7Contacts('{}');
        }

        smqAdmin.GetCIN7Contacts = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Contacts - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7contacts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateCIN7Contact = function() {
            smqAdmin.UpdateCIN7Contact('{}');
        }

        smqAdmin.UpdateCIN7Contact = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 Contact - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7contact', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteCIN7Contact = function() {
            smqAdmin.DeleteCIN7Contact('{}');
        }

        smqAdmin.DeleteCIN7Contact = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 Contact - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7contact', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.AddCIN7Branch = function() {
            smqAdmin.AddCIN7Branch('{}');
        }

        smqAdmin.AddCIN7Branch = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 Branch - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7branch', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.GetCIN7Branches = function() {
            smqAdmin.GetCIN7Branches('{}');
        }

        smqAdmin.GetCIN7Branches = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Branches - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7branches', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.UpdateCIN7Branch = function() {
            smqAdmin.UpdateCIN7Branch('{}');
        }

        smqAdmin.UpdateCIN7Branch = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 Branch - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7branch', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        
        smqAdmin.DeleteCIN7Branch = function() {
            smqAdmin.DeleteCIN7Branch('{}');
        }

        smqAdmin.DeleteCIN7Branch = function(payload) {
            payload = smqAdmin.stringifyValue(payload);
            var id = smqAdmin.createUUID();
            var deferred = smqAdmin.waitingReply[id] = smqAdmin.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 Branch - ');
            smqAdmin.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7branch', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqAdmin.waitFor(id);
            
            return deferred.promise;
        }
        

    return smqAdmin;
}

                    