
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

export default class EpisodeComponent extends EffortlessBaseComponent<{ episodeCode: string }, {
    episode: any, reloadRequested: boolean,
    dataReady: boolean, episodeCode: string
}> {

    constructor(props: any) {
        super(props);

        this.state = {
            episode: undefined,
            episodeCode: props.match.params.episodeCode,
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
        payload.AirtableWhere = "Name='" + this.state.episodeCode + "'";
        var reply = await this.context.moderator.GetSeasonEpisodes(payload);
        if (this.hasNoErrors(reply) && reply.SeasonEpisodes && reply.SeasonEpisodes.length) {
            var episode = reply.SeasonEpisodes[0];
            payload.AirtableWhere = `SeasonEpisode='${episode.Name}'`
            reply = await this.context.moderator.GetEpisodeCalls(payload);
            if (this.hasNoErrors(reply)) {
                episode.Calls = reply.EpisodeCalls;
            }

            var reply = await this.context.moderator.GetEpisodeHosts(payload)
            if (this.hasNoErrors(reply)) {
                episode.Hosts = reply.EpisodeHosts;
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
                        <IonButton routerLink={"/season/" + episode?.SeasonName}>{episode?.SeasonName}</IonButton>
                        <div style={{float: 'right'}}>
                            <button onClick={this.reloadEpisode}>Reload</button>
                        </div>

                        <div>
                            <h2>Hosts ({episode?.Hosts?.length})</h2>
                            {episode?.Hosts.map((host : any) => {
                                return <div>{host.HostName} - {host.Role}</div>
                            })}
                        </div>
                        <div>
                            <h3>{episode?.Name} Calls</h3>
                            {episode?.Calls
                                    ?.sort((a: any, b: any) => a.AutoNumber > b.AutoNumber ? 1 : -1)
                                    ?.map((call: any) => {
                                        return <div key={call.EpisodeCallId}>
                                            <IonButton routerLink={"/call/" + call.Name}> {call?.Subject}</IonButton>
                                        </div>
                                    })}
                        </div>
                        <div>
                        <IonButton routerLink={"/episode/" + episode?.Name + "/addcall"}>Add Call Now</IonButton>
                        </div>
                        
                    </div>
                </IonContent>
            </IonPage>

        );
    }
}