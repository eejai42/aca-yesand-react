

function generateCustomerActor() {
    var smqCustomer = {
    };
    
    smqCustomer.defer = function() {
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

    smqCustomer.connect = function (virtualHost, username, password, on_received, after_connect) {
        console.warn('set `smqCustomer.showPingPongs = true` to get verbose logging.');
        smqCustomer.virtualHost = virtualHost;
        smqCustomer.username = username;
        smqCustomer.password = password;
        smqCustomer.rabbitEndpoint = smqCustomer.rabbitEndpoint || window.rabbitEndpoint || 'ws://sassymq.anabstractlevel.com:15674/ws';
        smqCustomer.Customer_all_connection = {};
        smqCustomer.messages = [];
        smqCustomer.waitingReply = [];
        
        smqCustomer.client = Stomp.client(smqCustomer.rabbitEndpoint);

        smqCustomer.client.debug = function (m, p) {
            if (((m == ">>> PING") || (m == "<<< PONG")) && !smqCustomer.showPingPongs) return;
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

        smqCustomer.checkMessage = function(msg) {
            
               
        }

        var on_connect = function (x) {
            smqCustomer.Customer_all_connection = smqCustomer.client.subscribe("/exchange/customer.all/#",
                    function (d) {
                        if (d.body) d.body = JSON.parse(d.body);
                        smqCustomer.messages.push(d);
                        smqCustomer.checkMessage(d);
                        if (on_received) on_received(d);
                        if (smqCustomer.showPingPongs) console.log('      --------  MESSAGE FOR smqCustomer: ', d);
                    }, {
                        durable: false,
                        requeue: true
                    });
            smqCustomer.client.onreceive =  function (d) {
                        var body = JSON.parse(d.body);
                        var corrID = d.headers["correlation-id"];
                        var waitingDeferred = smqCustomer.waitingReply[corrID];

                        if (waitingDeferred && body.IsHandled) {
                            delete smqCustomer.waitingReply[corrID];
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

        console.log('connecting to: ' + smqCustomer.rabbitEndpoint + ', using ' + username + '/' + password);
        smqCustomer.client.connect(smqCustomer.username, smqCustomer.password, on_connect, on_error, smqCustomer.virtualHost);
    };

    smqCustomer.disconnect = function() {
        if (smqCustomer && smqCustomer.client) 
        {
            smqCustomer.client.disconnect();
        }
    }

    smqCustomer.stringifyValue = function(value) {
        if (!value) value = '{}';
            if (typeof value == 'object') {
                value = JSON.stringify(value);
            }
        return value;
    };
    
    smqCustomer.sendReply = function(replyPayload, msg) {
        if (replyPayload && msg && msg.headers && msg.headers['reply-to']) {
            replyPayload.IsHandled = true;
            smqCustomer.client.send(msg.headers['reply-to'], 
                        { "content-type": "application/json", 
                          "reply-to":"/temp-queue/response-queue", 
                          "correlation-id":msg.headers['correlation-id'] 
                        }, JSON.stringify(replyPayload));
        }
    };

    
        
        smqCustomer.waitFor = function (id) {
            setTimeout(function () {
                var waiting = smqCustomer.waitingReply[id];
                if (waiting) {
                    waiting.reject("Timed out waiting for reply");
                }
            }, 30000)
        }
        
        smqCustomer.createUUID = function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }


        
        smqCustomer.Search = function() {
            smqCustomer.Search('{}');
        }

        smqCustomer.Search = function(payload) {
            payload = smqCustomer.stringifyValue(payload);
            var id = smqCustomer.createUUID();
            var deferred = smqCustomer.waitingReply[id] = smqCustomer.defer();
            if (smqCustomer.showPingPongs) console.log('Search - ');
            smqCustomer.client.send('/exchange/customermic/crudcoordinator.custom.customer.search', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCustomer.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCustomer.GetCIN7Contacts = function() {
            smqCustomer.GetCIN7Contacts('{}');
        }

        smqCustomer.GetCIN7Contacts = function(payload) {
            payload = smqCustomer.stringifyValue(payload);
            var id = smqCustomer.createUUID();
            var deferred = smqCustomer.waitingReply[id] = smqCustomer.defer();
            if (smqCustomer.showPingPongs) console.log('Get C I N7 Contacts - ');
            smqCustomer.client.send('/exchange/customermic/crudcoordinator.crud.customer.getcin7contacts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCustomer.waitFor(id);
            
            return deferred.promise;
        }
        

    return smqCustomer;
}

                    