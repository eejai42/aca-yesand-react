
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
import { curveNatural } from "d3";

export default class AddEpisodeCallComponent extends EffortlessBaseComponent<{ episodeCode: string }, {
    episode: any, reloadRequested: boolean, subject : string,
    dataReady: boolean, episodeCode: string, guestName : string
}> {

    constructor(props: any) {
        super(props);

        this.state = {
            episode: undefined,
            subject : "",   
            guestName : "",         
            episodeCode: props.match.params.episodeCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadEpisode = this.reloadEpisode.bind(this);
        this.subjectChanged = this.subjectChanged.bind(this);
        this.guestNameChanged = this.guestNameChanged.bind(this);
        this.addEpisode = this.addEpisode.bind(this);
    }


    async onReady() {
        this.reloadEpisode();
    }

    async reloadEpisode() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "Name='" + this.state.episodeCode + "'";
        var reply = await this.context.moderator.GetSeasonEpisodes(payload);
        if (this.hasNoErrors(reply) && reply.SeasonEpisodes && reply.SeasonEpisodes.length) {
            var episode = reply.SeasonEpisodes[0];
            var newState = { episode: episode, reloadRequested: true }
            this.setState(newState);
        }
    }

    subjectChanged(event : any) {
        this.setState({subject: event.target.value});
    }

    guestNameChanged(event : any) {
        this.setState({guestName: event.target.value});
    }

    shouldComponentUpdate() {
        return this.state.reloadRequested;
    }

    async addEpisode() {
        console.error('Adding episode', this.state.subject)
        var payload = this.context.createPayload();
        payload.EpisodeCall = {
            SeasonEpisode: this.state.episode.SeasonEpisodeId,
            Subject : this.state.subject
        };
        var reply = await this.context.moderator.AddEpisodeCall(payload);
        // add hosts and player
        if (this.hasNoErrors(reply)) {
            var call = reply.EpisodeCall;
            payload.AirtableWhere = `SeasonEpisode='${call.SeasonEpisodeName}'`
            var reply = await this.context.moderator.GetEpisodeHosts(payload)
            if (this.hasNoErrors(reply)) {
                reply.EpisodeHosts.forEach(async (host : any) => {
                    let chosenName = host.DisplayName;
                    let personId = host.ShowHost;
                    let role = host.Role;
                    await this.AddCallParticipant(call, chosenName, personId, role);
                });
            }
            this.AddCallParticipant(call, this.state.guestName, null, "Caller");
            payload.CallTopic = {
                EpisodeCall: call.EpisodeCallId,
                Subject : call.Subject
            };
            reply = await this.context.moderator.AddCallTopic(payload);
            if (this.hasNoErrors(reply)) {
                call.Topics = [reply.CallTopic];
                call.CallTopics = [reply.CallTopic.CallTopicId];
            }
        }
    }


    private async AddCallParticipant(call: any, chosenName: any, personId: any, role: any) {
        var payload = this.context.createPayload();
        payload.CallParticipant = {
            EpisodeCall: call.EpisodeCallId,
            ChosenName: chosenName,
            Person: personId,
            Role: role
        };
        var hostReply = await this.context.moderator.AddCallParticipant(payload);
        if (this.hasNoErrors(hostReply)) {
            var participant = hostReply.CallParticipant;
            call.Participants = call.Participants || [];
            call.Participants.push(participant);
            call.CallParticipants = call.CallParticipants || [];
            call.CallParticipants.push(participant.CallParticipantId);
        }
        return payload;
    }

    render() {
        console.error('rendering');
        const { episode } = this.state;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>{episode?.Name || 'Loading episode'}</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Episode</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <div>
                        <IonButton routerLink={"/episode/" + episode?.Name}>{episode?.Name}</IonButton>
                        <div style={{float: 'right'}}>
                            <button onClick={this.reloadEpisode}>Reload</button>
                        </div>
                        <div>
                            Add a Call
                        </div>
                        <input value={this.state.subject} onChange={this.subjectChanged} />
                        <div>
                            Guest
                        </div>
                        <input value={this.state.guestName} onChange={this.guestNameChanged} />
                    </div>

                    <div>
                        <IonButton onClick={this.addEpisode} disabled={this.state.subject.length < 4}>Add</IonButton>
                    </div>
                </IonContent>
            </IonPage>

        );
    }
}