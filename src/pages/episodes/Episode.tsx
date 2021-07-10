
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

export default class EpisodeComponent extends EffortlessBaseComponent<{hostCode:string}, { host : any, reloadRequested: boolean, 
                                                                            dataReady: boolean, hostCode : string }> {

    constructor(props: any) {
        super(props);

        this.state = {
            host : undefined,
            hostCode : props.match.params.hostCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadEpisode = this.reloadEpisode.bind(this);
    }


    async onReady() {
        this.reloadEpisode();
    }

    async reloadEpisode() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "EpisodeCode='" + this.state.hostCode +"'";
        var reply = await this.context.moderator.GetEpisodes(payload);
        if (this.hasNoErrors(reply) && reply.Episodes && reply.Episodes.length) {
            console.error('GOT SHOW: ', reply.Episodes[0]);
            var newState = { host: reply.Episodes[0], reloadRequested: true }
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
                <h1>Episode - {this.state.hostCode}</h1>
                <div>
                    <button onClick={this.reloadEpisode}>Reload</button>

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