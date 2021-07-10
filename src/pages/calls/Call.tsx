
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

export default class CallComponent extends EffortlessBaseComponent<{hostCode:string}, { host : any, reloadRequested: boolean, 
                                                                            dataReady: boolean, hostCode : string }> {

    constructor(props: any) {
        super(props);

        this.state = {
            host : undefined,
            hostCode : props.match.params.hostCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadCall = this.reloadCall.bind(this);
    }


    async onReady() {
        this.reloadCall();
    }

    async reloadCall() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "CallCode='" + this.state.hostCode +"'";
        var reply = await this.context.moderator.GetCalls(payload);
        if (this.hasNoErrors(reply) && reply.Calls && reply.Calls.length) {
            console.error('GOT SHOW: ', reply.Calls[0]);
            var newState = { host: reply.Calls[0], reloadRequested: true }
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
                <h1>Call - {this.state.hostCode}</h1>
                <div>
                    <button onClick={this.reloadCall}>Reload</button>

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