
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

export default class CallComponent extends EffortlessBaseComponent<{callCode:string}, { call : any, reloadRequested: boolean, 
                                                                            dataReady: boolean, callCode : string }> {

    constructor(props: any) {
        super(props);

        this.state = {
            call : undefined,
            callCode : props.match.params.callCode,
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
        payload.AirtableWhere = "Name='" + this.state.callCode +"'";
        var reply = await this.context.moderator.GetEpisodeCalls(payload);
        if (this.hasNoErrors(reply) && reply.EpisodeCalls && reply.EpisodeCalls.length) {
            var call = reply.EpisodeCalls[0];
            payload.AirtableWhere = `EpisodeCall='${call.Name}'`
            reply = await this.context.moderator.GetCallTopics(payload);
            if (this.hasNoErrors(reply)) {
                call.Topics = reply.CallTopics;
            }

            var newState = { call: call, reloadRequested: true }
            this.setState(newState);
        }
    }

    shouldComponentUpdate() {
        return this.state.reloadRequested;
    }


    render() {
        console.error('rendering');
        const { call } = this.state;
        return (
            <div>
                <h1>Call - {this.state.callCode}</h1>
                <div>
                    <button onClick={this.reloadCall}>Reload</button>

                </div>
                <div>
                    CALL CODE: {this.props.callCode}
                </div>

                <div>
                    <h3>{call?.Name}</h3>
                    {call?.Topics?.map((topic : any) => {
                        return <div key={topic.CallTopicId}>
                            TOPIC: {topic.Name}
                        </div>     
                    })}
                </div>

            </div>
        );
    }
}