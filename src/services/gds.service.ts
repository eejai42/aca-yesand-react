declare var generateAdminActor: any;
declare var generateEmployeeActor: any;
declare var generateManagerActor: any;
declare var generateCustomerActor: any;

import { Observable, BehaviorSubject, Subscription, timer, combineLatest } from 'rxjs';
import { filter, share, map, catchError, take, tap } from 'rxjs/operators';
import {generateAdminActor} from '../../public/assets/sassymq/jsActors/smqAdmin.js'; 

export class GDS {
  private readiness$: BehaviorSubject<{}> = new BehaviorSubject(null);
  accessToken: string;
  smqGuest: any;
  whoAmI: any;
  isCustomer: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isManager: boolean;
  role: string;
  vhost: string;
  smqUsername: string;
  smqPassword: string;
  smqUser: any;
  rabbitEndpoint: string;
  isGuestConnected: boolean;
  firstLoad: boolean;


  constructor() {
  }

  groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
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

  dontConnect() {
    console.error('NOT Connecting now');
    setTimeout(() => {
      this.readiness$.next({});
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

  saveAccessToken(accessToken: string) {
    if (!accessToken) return;
    var gds = this;
    gds.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
    gds.smqGuest.WhoAmI(gds.createPayload())
      .then(function (waiReply) {
        gds.whoAmI = waiReply.SingletonAppUser;
        gds.connect();
      });
  }
  createPayload(): any {
    throw new Error('Method not implemented.');
  }

  public logout() {
    this.isCustomer = false;
    this.isAdmin = false;
    this.isEmployee = false;
    this.whoAmI = null;
  }

  connect() {
    console.error("LOADING ALL DATA");
    var gds = this;
    gds.isAdmin = false;
    gds.isEmployee = false;
    gds.isCustomer = false;
    gds.isManager = false;

    if (gds.whoAmI && gds.whoAmI.Roles) {
      if (gds.whoAmI.Roles.indexOf("Customer") >= 0) {
        gds.role = 'Customer';
        gds.isCustomer = true;
        gds.smqUser = generateCustomerActor();
      }
      else if (gds.whoAmI.Roles.indexOf("Admin") >= 0) {
        gds.role = 'Admin';
        gds.isEmployee = true;
        gds.isAdmin = true;
        //gds.smqPayroll = generatePayrollActor();
        gds.smqUser = generateAdminActor();
      }

      if (gds.smqUser) {
        gds.smqUser.rabbitEndpoint = gds.rabbitEndpoint;

        gds.smqUser.connect(gds.vhost, gds.smqUsername, gds.smqPassword, function () { }, function () {
          gds.isGuestConnected = true;
          gds.readiness$.next({});
        });
      } else {
        gds.readiness$.next({});
      }
    } else {
      gds.readiness$.next({});
    }
  }
}
