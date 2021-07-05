

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
            
                if (smqCRUDCoordinator.onCustomerSearch) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.custom.customer.search'))) {
                        var rpayload = smqCRUDCoordinator.onCustomerSearch(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onGuestSearch) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.custom.guest.search'))) {
                        var rpayload = smqCRUDCoordinator.onGuestSearch(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onGuestGetCategories) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.custom.guest.getcategories'))) {
                        var rpayload = smqCRUDCoordinator.onGuestGetCategories(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddCIN7ProductStockLevel) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addcin7productstocklevel'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddCIN7ProductStockLevel(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetCIN7ProductStockLevels) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getcin7productstocklevels'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetCIN7ProductStockLevels(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateCIN7ProductStockLevel) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatecin7productstocklevel'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateCIN7ProductStockLevel(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteCIN7ProductStockLevel) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletecin7productstocklevel'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteCIN7ProductStockLevel(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddCIN7User) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addcin7user'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddCIN7User(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetCIN7Users) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getcin7users'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetCIN7Users(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateCIN7User) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatecin7user'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateCIN7User(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteCIN7User) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletecin7user'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteCIN7User(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onCustomerGetCIN7Contacts) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.customer.getcin7contacts'))) {
                        var rpayload = smqCRUDCoordinator.onCustomerGetCIN7Contacts(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddCIN7Contact) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addcin7contact'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddCIN7Contact(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetCIN7Contacts) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getcin7contacts'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetCIN7Contacts(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateCIN7Contact) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatecin7contact'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateCIN7Contact(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteCIN7Contact) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletecin7contact'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteCIN7Contact(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminAddCIN7Branch) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.addcin7branch'))) {
                        var rpayload = smqCRUDCoordinator.onAdminAddCIN7Branch(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminGetCIN7Branches) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.getcin7branches'))) {
                        var rpayload = smqCRUDCoordinator.onAdminGetCIN7Branches(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminUpdateCIN7Branch) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.updatecin7branch'))) {
                        var rpayload = smqCRUDCoordinator.onAdminUpdateCIN7Branch(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                if (smqCRUDCoordinator.onAdminDeleteCIN7Branch) {
                    if (msg.headers && (msg.headers.destination.includes('crudcoordinator.crud.admin.deletecin7branch'))) {
                        var rpayload = smqCRUDCoordinator.onAdminDeleteCIN7Branch(msg.body, msg);
                        if (rpayload) smqCRUDCoordinator.sendReply(rpayload, msg);
                    }
                }
            
                // Can also hear what 'Guest' can hear.
                
                // Can also hear what 'Customer' can hear.
                
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
        
        smqCRUDCoordinator.GuestSearch = function() {
            smqCRUDCoordinator.GuestSearch('{}');
        }

        smqCRUDCoordinator.GuestSearch = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Search - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.custom.guest.search', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.GuestGetCategories = function() {
            smqCRUDCoordinator.GuestGetCategories('{}');
        }

        smqCRUDCoordinator.GuestGetCategories = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqGuest.showPingPongs) console.log('Get Categories - ');
            smqCRUDCoordinator.client.send('/exchange/guestmic/crudcoordinator.custom.guest.getcategories', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
            // Can also say what 'Customer' can say.
            
        
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


        
        smqCRUDCoordinator.CustomerSearch = function() {
            smqCRUDCoordinator.CustomerSearch('{}');
        }

        smqCRUDCoordinator.CustomerSearch = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqCustomer.showPingPongs) console.log('Search - ');
            smqCRUDCoordinator.client.send('/exchange/customermic/crudcoordinator.custom.customer.search', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.CustomerGetCIN7Contacts = function() {
            smqCRUDCoordinator.CustomerGetCIN7Contacts('{}');
        }

        smqCRUDCoordinator.CustomerGetCIN7Contacts = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqCustomer.showPingPongs) console.log('Get C I N7 Contacts - ');
            smqCRUDCoordinator.client.send('/exchange/customermic/crudcoordinator.crud.customer.getcin7contacts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
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


        
        smqCRUDCoordinator.AdminAddCIN7ProductStockLevel = function() {
            smqCRUDCoordinator.AdminAddCIN7ProductStockLevel('{}');
        }

        smqCRUDCoordinator.AdminAddCIN7ProductStockLevel = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 Product Stock Level - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7productstocklevel', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetCIN7ProductStockLevels = function() {
            smqCRUDCoordinator.AdminGetCIN7ProductStockLevels('{}');
        }

        smqCRUDCoordinator.AdminGetCIN7ProductStockLevels = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Product Stock Levels - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7productstocklevels', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateCIN7ProductStockLevel = function() {
            smqCRUDCoordinator.AdminUpdateCIN7ProductStockLevel('{}');
        }

        smqCRUDCoordinator.AdminUpdateCIN7ProductStockLevel = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 Product Stock Level - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7productstocklevel', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteCIN7ProductStockLevel = function() {
            smqCRUDCoordinator.AdminDeleteCIN7ProductStockLevel('{}');
        }

        smqCRUDCoordinator.AdminDeleteCIN7ProductStockLevel = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 Product Stock Level - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7productstocklevel', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddCIN7User = function() {
            smqCRUDCoordinator.AdminAddCIN7User('{}');
        }

        smqCRUDCoordinator.AdminAddCIN7User = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 User - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7user', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetCIN7Users = function() {
            smqCRUDCoordinator.AdminGetCIN7Users('{}');
        }

        smqCRUDCoordinator.AdminGetCIN7Users = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Users - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7users', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateCIN7User = function() {
            smqCRUDCoordinator.AdminUpdateCIN7User('{}');
        }

        smqCRUDCoordinator.AdminUpdateCIN7User = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 User - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7user', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteCIN7User = function() {
            smqCRUDCoordinator.AdminDeleteCIN7User('{}');
        }

        smqCRUDCoordinator.AdminDeleteCIN7User = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 User - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7user', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddCIN7Contact = function() {
            smqCRUDCoordinator.AdminAddCIN7Contact('{}');
        }

        smqCRUDCoordinator.AdminAddCIN7Contact = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 Contact - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7contact', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetCIN7Contacts = function() {
            smqCRUDCoordinator.AdminGetCIN7Contacts('{}');
        }

        smqCRUDCoordinator.AdminGetCIN7Contacts = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Contacts - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7contacts', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateCIN7Contact = function() {
            smqCRUDCoordinator.AdminUpdateCIN7Contact('{}');
        }

        smqCRUDCoordinator.AdminUpdateCIN7Contact = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 Contact - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7contact', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteCIN7Contact = function() {
            smqCRUDCoordinator.AdminDeleteCIN7Contact('{}');
        }

        smqCRUDCoordinator.AdminDeleteCIN7Contact = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 Contact - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7contact', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminAddCIN7Branch = function() {
            smqCRUDCoordinator.AdminAddCIN7Branch('{}');
        }

        smqCRUDCoordinator.AdminAddCIN7Branch = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Add C I N7 Branch - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.addcin7branch', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminGetCIN7Branches = function() {
            smqCRUDCoordinator.AdminGetCIN7Branches('{}');
        }

        smqCRUDCoordinator.AdminGetCIN7Branches = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Get C I N7 Branches - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.getcin7branches', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminUpdateCIN7Branch = function() {
            smqCRUDCoordinator.AdminUpdateCIN7Branch('{}');
        }

        smqCRUDCoordinator.AdminUpdateCIN7Branch = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Update C I N7 Branch - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.updatecin7branch', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        
        smqCRUDCoordinator.AdminDeleteCIN7Branch = function() {
            smqCRUDCoordinator.AdminDeleteCIN7Branch('{}');
        }

        smqCRUDCoordinator.AdminDeleteCIN7Branch = function(payload) {
            payload = smqCRUDCoordinator.stringifyValue(payload);
            var id = smqCRUDCoordinator.createUUID();
            var deferred = smqCRUDCoordinator.waitingReply[id] = smqCRUDCoordinator.defer();
            if (smqAdmin.showPingPongs) console.log('Delete C I N7 Branch - ');
            smqCRUDCoordinator.client.send('/exchange/adminmic/crudcoordinator.crud.admin.deletecin7branch', { "content-type": "text/plain", "reply-to":"/temp-queue/response-queue", "correlation-id":id }, payload);
            
            smqCRUDCoordinator.waitFor(id);
            
            return deferred.promise;
        }
        

    return smqCRUDCoordinator;
}

                    