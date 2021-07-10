
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

export default class SeasonComponent extends EffortlessBaseComponent<{ seasonCode: string }, {
    season: any, reloadRequested: boolean,
    dataReady: boolean, seasonCode: string
}> {

    constructor(props: any) {
        super(props);

        this.state = {
            season: undefined,
            seasonCode: props.match.params.seasonCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadSeason = this.reloadSeason.bind(this);
    }


    async onReady() {
        this.reloadSeason();
    }

    async reloadSeason() {
        console.error('LOADING SEASON', this.state.seasonCode);
        let payload = this.context.createPayload()
        payload.AirtableWhere = "Name='" + this.state.seasonCode + "'";
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

    shouldComponentUpdate() {
        return this.state.reloadRequested;
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
                        <IonTitle>{season?.Name}</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Season</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <div>
                        <IonButton routerLink={"/show/" + season?.ShowCode}>{season?.ShowName}</IonButton>
                        <h1>Season - {this.state.seasonCode}</h1>
                        <div>
                            <button onClick={this.reloadSeason}>Reload</button>
                        </div>
                        <div>
                            <h3>Episodes</h3>
                            {season?.SeasonEpisodes.map((episode: any) => {
                                return <div key={episode.SeasonEpisodeId}>
                                    <IonButton routerLink={"/episode/" + episode.Name}> {episode?.Name}</IonButton>
                                </div>
                            })}
                        </div>

                    </div>
                </IonContent>
            </IonPage>

        );
    }
}