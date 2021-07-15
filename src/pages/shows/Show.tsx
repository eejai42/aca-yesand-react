
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
import { addOutline } from "ionicons/icons";

export default class ShowComponent extends EffortlessBaseComponent {
    didMount: boolean = false;

    constructor(props: any) {
        super(props);

        this.state = {
            show: undefined
        };
    }

    async reloadShow() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "ShowCode='" + this.props.match.params.showCode + "'";
        var reply = await this.context.moderator.GetShows(payload);
        if (this.hasNoErrors(reply) && reply.Shows && reply.Shows.length) {
            var show = reply.Shows[0];
            console.error('GOT SHOW: ', show);
            payload.AirtableWhere = `Show='${show.Name.replace("'", "\\'")}'`;
            reply = await this.context.moderator.GetShowSeasons(payload);
            if (this.hasNoErrors(reply)) {
                show.ShowSeasons = reply.ShowSeasons;
            }
            var newState = { show: show }
            this.setState(newState);
        }
    }

    componentDidUpdate(){
        console.error('Checking Show: ', this.state.show)
        if (this.state.isReady && (!this.state.show || (this.state.show.ShowCode != this.props.match.params.showCode))) {
            this.reloadShow();
        }
    }


    render() {
        console.error('rendering');
        const { show } = this.state;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <div style={{float: 'right'}}>
                            <button onClick={() => this.reloadShow()}>Reload</button>
                        </div>
                        <IonTitle>{show?.Name || 'Loading show...'}</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <div>
                        <div>
                            {show?.Attachments?.length ? <div><img src={show?.Attachments[0].url} style={{width: '6em', float: 'left'}} /></div> : undefined}
                            <h3>{show?.ShowSeasons?.length} Seasons </h3>
                            <div>
                                <b>Description: </b>
                            </div>
                            <div>
                                {show?.Notes || 'no description yet...'}
                            </div>
                            <div style={{clear: 'both'}}>
                                {show?.ShowSeasons
                                    ?.sort((a: any, b: any) => a.SeasonNumber > b.SeasonNumber ? 1 : -1)
                                    .map((season: any) => {
                                        return <div key={season.Name}>
                                            <IonButton routerLink={"/season/" + season.Name} style={{float:'left'}}> Season {season?.SeasonNumber}</IonButton>
                                        </div>
                                    })}
                                    <IonButton color="success" onClick={() => this.addSeason()}><IonIcon icon={addOutline}></IonIcon> Add Season {this.state?.show?.CurrentSeasonNumber + 1}</IonButton>
                            </div>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
    async addSeason() {
        var payload = this.context.createPayload();
        payload.ShowSeason = {
            Show : this.state.show.ShowId,
            SeasonNumber : this.state.show.CurrentSeasonNumber + 1
        }
        var reply = await this.context.moderator.AddShowSeason(payload)
        if (this.hasNoErrors(reply)) {
            var showSeason = reply.ShowSeason;
            this.state.show.ShowSeasons.push(showSeason);
            this.state.show.CurrentSeason = reply.ShowSeason.ShowSeasonId;
            payload = this.context.createPayload();
            payload.Show = JSON.parse(JSON.stringify(this.state.show));
            delete payload.Show.ShowSeasons;
            reply = await this.context.moderator.UpdateShow(payload);
            console.error('UPDATED SHOW WITH LATEST SEASON INFO');
            if (this.hasNoErrors(reply)) {
                reply.Show.ShowSeasons = this.state.show.ShowSeasons;
                this.setState({show: reply.Show});
            }
        }
    }
}