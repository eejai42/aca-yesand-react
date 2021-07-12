
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
    dataReady: boolean, episodeCode: string
}> {

    constructor(props: any) {
        super(props);

        this.state = {
            episode: undefined,
            subject : "",            
            episodeCode: props.match.params.episodeCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadEpisode = this.reloadEpisode.bind(this);
        this.onChange = this.onChange.bind(this);
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

    onChange(event : any) {
        this.setState({subject: event.target.value});
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
                    payload = this.context.createPayload();
                    payload.CallParticipant = {
                        EpisodeCall: call.EpisodeCallId,
                        ChosenName: host.DisplayName,
                        Person: host.ShowHost,
                        Role: host.Role
                    };
                    var hostReply = await this.context.moderator.AddCallParticipant(payload);
                    if (this.hasNoErrors(hostReply)) {
                        var participant = hostReply.CallParticipant;
                        call.Participants = call.Participants || [];
                        call.Participants.push(participant);
                        call.CallParticipants = call.CallParticipants || [];
                        call.CallParticipants.push(participant.CallParticipantId);
                    }
                });
            }
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
                        <input value={this.state.subject} onChange={this.onChange} />
                        <div>
                            Guest
                        </div>
                        <input value={this.state.subject} onChange={this.onChange} />
                    </div>

                    <div>
                        <IonButton onClick={this.addEpisode} disabled={this.state.subject.length < 4}>Add</IonButton>
                    </div>
                </IonContent>
            </IonPage>

        );
    }
}