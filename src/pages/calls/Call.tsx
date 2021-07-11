
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
import Topic from './Topic'
import Participant from './Participant'

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
        this.participantChanged = this.participantChanged.bind(this);
        this.topicChanged = this.topicChanged.bind(this);
    }

    shouldComponentUpdate() {
        return this.state.reloadRequested;
    }


    async onReady() {
        this.reloadCall();
    }

    async reloadCall() {
        console.error('RELOADING CALL NOW');
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
            reply = await this.context.moderator.GetCallParticipants(payload);
            if (this.hasNoErrors(reply)) {
                call.Participants = reply.CallParticipants;
            }

            console.error('ABOUT TO RENDER CALL: ', call);
            var newState = { call: call, reloadRequested: true }
            this.setState(newState);
        } else {
            console.error('GOT ERROR RELOADING CALL NOW!');
        }
    }

    async participantChanged(participantId : any) {
        console.error('GOT RELOAD CALL REQUEST FROM EVENT', participantId);
        this.state.call.CurrentParticipant = participantId;
        var payload = this.context.createPayload();
        payload.EpisodeCall = JSON.parse(JSON.stringify(this.state.call));
        delete payload.EpisodeCall.Topics;
        delete payload.EpisodeCall.Participants;
        var reply = await this.context.moderator.UpdateEpisodeCall(payload);
        if (this.hasNoErrors(reply)) {
            reply.EpisodeCall.Topics = this.state.call.Topics;
            reply.EpisodeCall.Participants = this.state.call.Participants;
            this.setState({call: reply.EpisodeCall, reloadRequested: true});
        }
    }

    async topicChanged(topicId : any) {
        this.state.call.CurrentTopic = topicId;
        var payload = this.context.createPayload();
        payload.EpisodeCall = JSON.parse(JSON.stringify(this.state.call));
        delete payload.EpisodeCall.Topics;
        delete payload.EpisodeCall.Participants;
        var reply = await this.context.moderator.UpdateEpisodeCall(payload);
        if (this.hasNoErrors(reply)) {
            reply.EpisodeCall.Topics = this.state.call.Topics;
            reply.EpisodeCall.Participants = this.state.call.Participants;
            this.setState({call: reply.EpisodeCall, reloadRequested: true});
        }
    }


    render() {
        const { call } = this.state;
        console.error('rendering call', call);
        return (
            <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <div style={{float: 'right'}}>{call?.Name}</div>
                    <IonTitle>{call?.Subject || 'Loading call...'}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Call</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div style={{overflow:"scroll",height: "100%"}}>
                <div style={{float: 'right'}}>
                    <button onClick={this.reloadCall}>Reload</button>
                </div>
                <h3>
                Speaker: {call?.CurrentParticipantName || '...'}<br />
                Subject: {call?.CurrentTopicSubject || 'loading...'}
                </h3>
                <IonButton routerLink={"/episode/" + call?.ShortName}>{call?.ShortName}</IonButton>
                <h3>Participants</h3>
                <div>
                    {call?.Participants?.map((participant: any) => {
                        return <div key={participant.CallParticipantId + call.LastModifiedTime}>
                            <Participant call={call} participant={participant} changed={this.participantChanged} />
                        </div>
                    })}
                </div>


                <div>
                    {call?.Topics?.filter((topic : any) => !topic.ParentTopic).map((topic: any) => {
                        return <div key={topic.CallTopicId + call.LastModifiedTime}>
                            <Topic call={call} topic={topic} key={topic.CallTopicId} changed={this.topicChanged}/>
                        </div>
                    })}
                </div>
            </div>
            </IonContent>
        </IonPage>

        );
    }
}