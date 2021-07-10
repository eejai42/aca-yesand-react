
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

export default class SeasonComponent extends EffortlessBaseComponent<{hostCode:string}, { host : any, reloadRequested: boolean, 
                                                                            dataReady: boolean, hostCode : string }> {

    constructor(props: any) {
        super(props);

        this.state = {
            host : undefined,
            hostCode : props.match.params.hostCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadSeason = this.reloadSeason.bind(this);
    }


    async onReady() {
        this.reloadSeason();
    }

    async reloadSeason() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "SeasonCode='" + this.state.hostCode +"'";
        var reply = await this.context.moderator.GetSeasons(payload);
        if (this.hasNoErrors(reply) && reply.Seasons && reply.Seasons.length) {
            console.error('GOT SHOW: ', reply.Seasons[0]);
            var newState = { host: reply.Seasons[0], reloadRequested: true }
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
                <h1>Season - {this.state.hostCode}</h1>
                <div>
                    <button onClick={this.reloadSeason}>Reload</button>

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