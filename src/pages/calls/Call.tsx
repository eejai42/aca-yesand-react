
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
import { easeLinear } from "d3";

export default class CallComponent extends EffortlessBaseComponent {

    constructor(props: any) {
        super(props);
        // SOMETHING LIKE THIS: this.state.reloadMatch();
        this.state = {
            call: undefined
        };

        this.reloadCall = this.reloadCall.bind(this);
        this.participantChanged = this.participantChanged.bind(this);
        this.topicChanged = this.topicChanged.bind(this);
    }

    componentDidUpdate() {
        console.error('COMPONENT DID LOAD: ', this.state);
        if (this.state.isReady && (!this.state.call || (this.state.call.Name != this.props.match.params.callCode))) {
            this.reloadCall();
            
        }
    }

    async reloadCall() {
        console.error('RELOADING CALL NOW');
        let payload = this.context.createPayload()
        payload.AirtableWhere = "Name='" + this.props.match.params.callCode + "'";
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
            reply = await this.context.moderator.GetTopicAgreements(payload);
            if (this.hasNoErrors(reply)) {
                call.Agreements = reply.TopicAgreements;
            }
            console.error("ABOUT TO CHECK FALLACIES:: ", reply)

            reply = await this.context.moderator.GetTopicFallacies(payload);
            if (this.hasNoErrors(reply)) {
                console.error("Loading Fallacies in Call", reply.TopicFallacies)
                call.Fallacies = reply.TopicFallacies;
            } else {
                console.error("ERROR:: ", reply)
                
            }

            console.error('ABOUT TO RENDER CALL: ', call);
            var newState = { call: call,  reloadRequested: true }
            this.setState(newState);
        } else {
            console.error('GOT ERROR RELOADING CALL NOW!', reply);
        }
    }

    async participantChanged(participantId: any) {
        console.error('GOT RELOAD CALL REQUEST FROM EVENT', participantId);
        this.state.call.CurrentParticipant = participantId;
        var payload = this.context.createPayload();
        payload.EpisodeCall = JSON.parse(JSON.stringify(this.state.call));
        delete payload.EpisodeCall.Topics;
        delete payload.EpisodeCall.Participants;
        delete payload.EpisodeCall.Agreements;
        delete payload.EpisodeCall.Fallacies;

        payload.EpisodeCall.Status = payload.EpisodeCall.Status == "On" ? "Off" : "On";

        var reply = await this.context.moderator.UpdateEpisodeCall(payload);
        if (this.hasNoErrors(reply)) {
            reply.EpisodeCall.Topics = this.state.call.Topics;
            reply.EpisodeCall.Participants = this.state.call.Participants;
            reply.EpisodeCall.Agreements = this.state.call.Agreements;
            reply.EpisodeCall.Fallacies = this.state.call.Fallacies;
            this.setState({ call: reply.EpisodeCall, reloadRequested: true });
        }
    }

    async topicChanged(changeRequest : any) {
        let relatedTopicSubject = changeRequest.relatedTopicSubject;
        let callTopicId = changeRequest.callTopicId;
        console.error('Change Request: ', changeRequest);
        if (callTopicId)  {
            await this.setCurrentTopic(callTopicId);
        } else if (relatedTopicSubject) {
            await this.addRelatedTopic(relatedTopicSubject);
        }
    }
    async addRelatedTopic(relatedTopicSubject: any) {
        var payload = this.context.createPayload();
        payload.CallTopic = {
            EpisodeCall: this.state.call.EpisodeCallId,
            ParentTopic : this.state.call.CurrentTopic,
            CallParticipant : this.state.call.CurrentParticipant,
            Subject: relatedTopicSubject
        }
        var reply = await this.context.moderator.AddCallTopic(payload);
        if (this.hasNoErrors(reply)) {
            console.error('UPDATING CALL', reply);
            var newTopic = reply.CallTopic;
            this.state.call.Topics.push(newTopic);
            this.state.call.CallTopics.push(newTopic.CallTopicId);
            this.state.call.LastModified = new Date();
            this.setState({call: this.state.call});
        }
    }


    private async setCurrentTopic(callTopicId: any) {
        this.state.call.CurrentTopic = callTopicId;
        var payload = this.context.createPayload();
        payload.EpisodeCall = JSON.parse(JSON.stringify(this.state.call));
        delete payload.EpisodeCall.Topics;
        delete payload.EpisodeCall.Participants;
        delete payload.EpisodeCall.Agreements;
        delete payload.EpisodeCall.Fallacies;

        payload.EpisodeCall.Status = payload.EpisodeCall.Status == "On" ? "Off" : "On";
        
        var reply = await this.context.moderator.UpdateEpisodeCall(payload);
        if (this.hasNoErrors(reply)) {
            var episodeCall = reply.EpisodeCall;
            episodeCall.Topics = this.state.call.Topics;
            episodeCall.Participants = this.state.call.Participants;
            episodeCall.Agreements = this.state.call.Agreements;
            episodeCall.Fallacies = this.state.call.Fallacies;

            payload.AirtableWhere = `RECORD_ID()='${callTopicId}'`;
            reply = await this.context.moderator.GetCallTopics(payload);
            if (this.hasNoErrors(reply)) {
                var newTopic = reply.CallTopics[0];
                var existingTopic = episodeCall.Topics.filter((topic:any) => topic.CallTopicId == callTopicId)[0];
                var index = episodeCall.Topics.indexOf(existingTopic);
                console.error('GOT UPDATED VERSION OF TOPIC: ', reply, existingTopic, index);
                episodeCall.Topics[index] = newTopic;
                this.setState({ call: episodeCall, reloadRequested: true });
            }
        }
    }

    render() {
        const { call } = this.state;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <div style={{ float: 'right' }}>{call?.Name}</div>
                        <IonTitle>{call?.Subject || 'Loading call...'}</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
          
                    <div style={{ overflow: "scroll", height: "100%" }}>
                        <div style={{ float: 'right' }}>
                            <button onClick={this.reloadCall}>Reload</button>
                        </div>

                        <IonButton routerLink={"/episode/" + call?.ShortName}>{call?.ShortName}</IonButton>

                        <div style={{clear: 'both', borderTop: 'solid black 1px'}}>
                            {/* <h2 style={{clear: 'both', textAlign: 'center'}}>{call?.CurrentTopicSubject || 'loading...'}</h2>
                            <hr /> */}
                            <div>
                                {call?.Topics?.filter((topic: any) => !topic.ParentTopic).map((topic: any) => {
                                    return <div key={topic.CallTopicId + call.LastModifiedTime}>
                                        <Topic call={call} topic={topic} key={topic.CallTopicId} topicChanged={(callTopicId:any) => this.topicChanged(callTopicId)}
                                        participantChanged={this.participantChanged} />
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                </IonContent>
            </IonPage>

        );
    }
}