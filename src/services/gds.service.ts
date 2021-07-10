import * as React from 'react';
import { Observable, BehaviorSubject, Subscription, timer, combineLatest } from 'rxjs';
import { filter, share, map, catchError, take, tap } from 'rxjs/operators';
import generateGuestActor from '../sassymq/jsActors/smqGuest.js';
import generateModeratorActor from '../sassymq/jsActors/smqModerator.js';

declare global {
  interface Window {
    GDS:any;
  }
}

export class GDS {
  guest: any;

  public readiness$: BehaviorSubject<any> = new BehaviorSubject(false);
  public d3event$: BehaviorSubject<any> = new BehaviorSubject(false);
  accessToken: string = "";
  smqGuest: any = "";
  whoAmI: any = null;
  isCustomer: boolean = false;
  isAdmin: boolean = false;
  isEmployee: boolean = false;
  isManager: boolean = false;
  role: string = "Guest";
  vhost: string = "";
  smqUsername: string = "";
  smqPassword: string = "";
  smqUser: any = null;
  rabbitEndpoint: string = "";
  isGuestConnected: boolean = false;
  firstLoad: boolean = false;
  shows: any;
  moderator: any;
  isReady: boolean = false;


  constructor() {
    var self = this;
    window.GDS = this;
    this.guest  = generateGuestActor();
    this.guest.rabbitEndpoint = 'wss://effortlessapi-rmq.ssot.me:15673/ws'
    this.guest.connect('ej-aca-yesand', 'smqPublic', 'smqPublic', (msg : any) => {
      console.error('MESSAGE', msg);
    }, (connected : any) => {
      self.loginModerator();
    });
    console.error('connected', this.guest);
  }
  async loginModerator() {
    var payload = {
      EmailAddress : 'ej@ssot.me'
    }
    var reply = await this.guest.ValidateTemporaryAccessToken(payload)
    if (this.hasNoErrors(reply)) {
      this.saveAccessToken(reply.AccessToken);
    }
  }

  groupBy = (key : any) => (array : any) =>
    array.reduce((objectsByKeyValue : any, obj : any) => {
      const value = obj[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});

  hasNoErrors(reply: any) {
    if (!reply) {
      console.error('ERROR: ', 'Missing payload response', { status: 'danger' });
      return false;
    }
    else if (reply.ErrorMessage) {
      console.error('ERROR: ', reply.ErrorMessage, { status: 'danger' });
      return false;
    }

    return true;
  }

  async loadData(guest: any) {
    var reply = await guest.GetShows({});
    console.error('CONNECTED GUEST', reply);
    this.shows = reply.Shows;
    return reply.Shows;
  }  

  dontConnect() {
    console.error('NOT Connecting now');
    setTimeout(() => {
      this.readiness$.next(true);
    }, 1000);
  }
 
  getDate(date: any) {
    if (date && date.getDate) return date;
    else if (typeof date === "string") {
      var dtString = date.substring(0, 19) + 'Z';
      return new Date(dtString);
    }
    else if (date.toISOString) return date;
    else return new Date(date);
  }

  async saveAccessToken(accessToken: string) {
    if (!accessToken) return;
    var gds = this;
    gds.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
    var waiReply = await gds.guest.WhoAmI(gds.createPayload());
    gds.whoAmI = waiReply.SingletonAppUser;
    gds.connect();
  }

  connect() {
    this.moderator = generateModeratorActor();
    this.moderator.rabbitEndpoint = 'wss://effortlessapi-rmq.ssot.me:15673/ws'
    this.moderator.connect('ej-aca-yesand', 'smqPublic', 'smqPublic', (msg : any) => {}, () => {
      this.isReady = true;
      this.readiness$.next(true);
    });
}
  createPayload(): any {
    return { AccessToken : this.accessToken };
  }

  public logout() {
    this.isCustomer = false;
    this.isAdmin = false;
    this.isEmployee = false;
    this.whoAmI = null;
  }
}
