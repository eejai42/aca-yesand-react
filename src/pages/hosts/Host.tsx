
import React from "react";
import {
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonRow,
} from '@ionic/react';
import { useHistory, useParams } from "react-router";
import { GlobalDataService } from "../../GlobalDataService";
import { GDS } from "../../services/gds.service";
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent'

export default class HostComponent extends EffortlessBaseComponent {

    constructor(props: any) {
        super(props);

        this.state = {
            host : undefined,
            hostCode : props.match.params.hostCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadHost = this.reloadHost.bind(this);
    }


    async onReady() {
        this.reloadHost();
    }

    async reloadHost() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "HostCode='" + this.state.hostCode +"'";
        var reply = await this.context.moderator.GetHosts(payload);
        if (this.hasNoErrors(reply) && reply.Hosts && reply.Hosts.length) {
            console.error('GOT SHOW: ', reply.Hosts[0]);
            var newState = { host: reply.Hosts[0], reloadRequested: true }
            this.setState(newState);
        }
    }

    shouldComponentUpdate() {
        return this.state.reloadRequested;
    }


    render() {
        console.error('rendering');
        const { host } = this.state;
        return (
            <div>
                <h1>Host - {this.state.hostCode}</h1>
                <div>
                    <button onClick={this.reloadHost}>Reload</button>

                </div>
                <div>
                    SHOW CODE: {this.props.hostCode}
                </div>

                <div>
                    <h3>{host?.Name}</h3>
                    
                </div>

            </div>
        );
    }
}