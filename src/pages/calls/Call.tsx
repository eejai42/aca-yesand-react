
import React from "react";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonNote,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { useHistory, useParams } from "react-router";
import { GlobalDataService } from "../../GlobalDataService";
import { GDS } from "../../services/gds.service";
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent'
import TopicComponent from './Topic'

export default class CallComponent extends EffortlessBaseComponent<{ callCode: string }, {
    call: any, reloadRequested: boolean,
    dataReady: boolean, callCode: string
}> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: undefined,
            callCode: props.match.params.callCode,
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
        payload.AirtableWhere = "Name='" + this.state.callCode + "'";
        var reply = await this.context.moderator.GetEpisodeCalls(payload);
        if (this.hasNoErrors(reply) && reply.EpisodeCalls && reply.EpisodeCalls.length) {
            var call = reply.EpisodeCalls[0];
            payload.AirtableWhere = `EpisodeCall='${call.Name}'`
            reply = await this.context.moderator.GetCallTopics(payload);
            if (this.hasNoErrors(reply)) {
                call.Topics = reply.CallTopics;
            }

            console.error('ABOUT TO RENDER CALL: ', call);
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
            <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>{call?.Name}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Episode</IonTitle>
                    </IonToolbar>
                </IonHeader>
              
                <IonButton routerLink={"/episode/" + call?.ShortName}>{call?.ShortName}</IonButton>
            <div style={{overflow:"scroll",height: "100%"}}>
                <h1>Call - {this.state.callCode}</h1>
                <div>
                    <button onClick={this.reloadCall}>Reload</button>

                </div>
                <div>
                    <h3>{call?.Name}</h3>
                    {call?.Topics?.filter((topic : any) => !topic.ParentTopic).map((topic: any) => {
                        return <div key={topic.CallTopicId}>
                            <TopicComponent call={call} topic={topic} key={topic.CallTopicId}/>
                        </div>
                    })}
                </div>

            </div>
            </IonContent>
        </IonPage>

        );
    }
}