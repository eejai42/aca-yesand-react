
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
import { thumbsDownOutline, thumbsUpOutline, thumbsUpSharp, addOutline } from "ionicons/icons";
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent'

export default class SeasonComponent extends EffortlessBaseComponent {

    constructor(props: any) {
        super(props);

        this.state = {
            season: undefined,
            dataReady: false
        };
    }

    async reloadSeason() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "Name='" + this.props.match.params.seasonCode + "'";
        var reply = await this.context.moderator.GetShowSeasons(payload);
        if (this.hasNoErrors(reply) && reply.ShowSeasons && reply.ShowSeasons.length) {
            console.error('GOT REPLY TO SEASONS REQUEST: ', reply);
            var season = reply.ShowSeasons[0];
            payload.AirtableWhere = `ShowSeason='${season.Name}'`;
            reply = await this.context.moderator.GetSeasonEpisodes(payload);
            if (this.hasNoErrors(reply)) {
                season.SeasonEpisodes = reply.SeasonEpisodes;
            }

            var newState = { season: season, reloadRequested: true }
            this.setState(newState);
        }
    }

    componentDidUpdate() {
        if (this.state.isReady && 
            (!this.state.season || (this.state.season.Name != this.props.match.params.seasonCode))) {
            this.reloadSeason();
        }
    }


    render() {
        console.error('rendering');
        const { season } = this.state;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <div style={{float: 'right'}}>
                            <button onClick={() => this.reloadSeason()}>Reload</button>
                        </div>
                        <IonTitle>{season?.ShowName || "..."} - Season {season?.SeasonNumber || '... loading ...'}</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <div>
                        <div>
                            <IonButton routerLink={"/show/" + season?.ShowCode} style={{float: 'right'}}>
                                {season?.ShowName || "..."}
                            </IonButton>
                            <div>
                                {season?.ShowLogo?.length && <div style={{float: 'left'}}>
                                    <img src={season.ShowLogo[0].url} style={{width: '5em'}} />
                                </div>}
                                <div>
                                    <b>Description:</b>
                                    {season?.Notes}
                                </div>
                                {season?.Attachments?.length ? <div>{season?.Attachments[0].url}<img src={season?.Attachments[0].url} style={{width: '3em', float: 'left'}} /></div> : undefined}
                                {season?.Description}
                            </div>

                            <h3>{season?.SeasonEpisodes?.length} Episodes</h3>
                            {season?.SeasonEpisodes
                                    ?.sort((a: any, b: any) => a.EpisodeNumber > b.EpisodeNumber ? 1 : -1)
                                    .map((episode: any) => {
                                return <div key={episode.SeasonEpisodeId}>
                                    <IonButton routerLink={"/episode/" + episode.Name} style={{float: 'left'}}> Episode {episode?.EpisodeNumber}</IonButton>
                                </div>
                            })}
                            <IonButton onClick={() => this.addEpisode()} color="success"><IonIcon icon={addOutline}></IonIcon>Add Episode</IonButton>
                        </div>

                    </div>
                </IonContent>
            </IonPage>

        );
    }
    async addEpisode() {
        var payload = this.context.createPayload();
        payload.SeasonEpisode = {
            ShowSeason : this.state.season.ShowSeasonId,
            EpisodeNumber : this.state.season.NextEpisodeNumber
        }
        var reply = await this.context.moderator.AddSeasonEpisode(payload);
        if (this.hasNoErrors(reply)) {        
            window.location.href = '/episode/' + reply.SeasonEpisode.Name;
        }
    }
}