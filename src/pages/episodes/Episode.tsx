
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
import { chevronBackOutline, fastFood } from "ionicons/icons";

export default class EpisodeComponent extends EffortlessBaseComponent {
    isReady: boolean = false;

    constructor(props: any) {
        super(props);

        this.state = {
            episode: undefined
        };
    }

    componentDidUpdate(prevProps: any) {
        if (this.state.isReady) {
            if (!this.state.episode || (this.state.episode.Name != this.props.match.params.episodeCode)) {
                this.reloadEpisode();
            }
        }
    }

    async reloadEpisode() {
        console.error("Componet Reload", this.props, this.state);

        let payload = this.context.createPayload()
        payload.AirtableWhere = "Name='" + this.props.match.params.episodeCode + "'";
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

            console.error("Ep: ", episode)

            var newState = { episode: episode, reloadRequested: true }
            console.error('NEW STATE: ', newState);
            this.setState(newState);
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
                        <IonTitle>
                            <div style={{ float: 'right' }}>
                                <button onClick={() => this.reloadEpisode()}>Reload</button>
                            </div>
                            {episode?.DisplayName || 'Loading episode'}
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <div>
                        <IonButton routerLink={"/season/" + episode?.SeasonName}><IonIcon icon={chevronBackOutline}></IonIcon>{episode?.SeasonDisplayName}</IonButton>
                        <div>
                            <h2>Hosts ({episode?.Hosts?.length})</h2>
                            {episode?.Hosts.map((host: any) => {
                                return <div style={{ clear: 'both' }}>
                                    {host.HostAvatar && host.HostAvatar.length &&
                                        <img src={host.HostAvatar[0].url} style={{ width: '3em', verticalAlign: 'middle' }} />}
                                    {host.HostName} - {host.Role}
                                </div>
                            })}
                        </div>
                        <div>
                            <h3>Episode {episode?.EpisodeNumber} Calls</h3>
                            <ol>
                                {episode?.Calls?.sort((a: any, b: any) => a.AutoNumber > b.AutoNumber ? 1 : -1)
                                    ?.map((call: any) => {
                                        return <div key={call.EpisodeCallId}>
                                            <li>
                                                <IonButton size="small" routerLink={"/call/" + call.Name}> {call?.Subject}</IonButton>
                                            </li>
                                        </div>
                                    })}
                            </ol>
                        </div>
                        <hr />
                        <div>
                            <IonButton routerLink={"/episode/" + episode?.Name + "/addcall"}>Add Call Now</IonButton>
                        </div>
                    </div>
                </IonContent>
            </IonPage>

        );
    }
}