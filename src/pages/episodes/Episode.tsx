
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

export default class EpisodeComponent extends EffortlessBaseComponent<{episodeCode:string}, { episode : any, reloadRequested: boolean, 
                                                                            dataReady: boolean, episodeCode : string }> {

    constructor(props: any) {
        super(props);

        this.state = {
            episode : undefined,
            episodeCode : props.match.params.episodeCode,
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
        payload.AirtableWhere = "Name='" + this.state.episodeCode +"'";
        var reply = await this.context.moderator.GetSeasonEpisodes(payload);
        if (this.hasNoErrors(reply) && reply.SeasonEpisodes && reply.SeasonEpisodes.length) {
            var episode = reply.SeasonEpisodes[0];
            payload.AirtableWhere = `SeasonEpisode='${episode.Name}'`
            reply = await this.context.moderator.GetEpisodeCalls(payload);
            if (this.hasNoErrors(reply)) {
                episode.Calls = reply.EpisodeCalls;
            }
            var newState = { episode: episode, reloadRequested: true }
            console.error('NEW STATE: ', newState);
            this.setState(newState);
        }
    }

    shouldComponentUpdate() {
        return this.state.reloadRequested;
    }


    render() {
        console.error('rendering');
        const { episode } = this.state;
        return (
            <div>
                <h1>Episode - {this.state.episodeCode}</h1>
                <div>
                    <button onClick={this.reloadEpisode}>Reload</button>

                </div>
                <div>
                    SHOW CODE: {this.props.episodeCode}
                </div>

                <div>
                    <h3>{episode?.Name}</h3>
                    {episode?.Calls?.map((call:any) => {
                        return <div key={call.EpisodeCallId}>
                            <IonButton routerLink={"/calls/" + call.Name}> {call?.Name}</IonButton>
                        </div>
                    })}
                </div>

            </div>
        );
    }
}