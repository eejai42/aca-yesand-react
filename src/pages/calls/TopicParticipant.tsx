
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
import { BehaviorSubject } from "rxjs";
import { thumbsUpSharp } from "ionicons/icons";

export default class TopicParticipantComponent extends EffortlessBaseComponent<{ call: any, callparticipant: any, changed: any, topic: any },
    { call: any, callparticipant: any, changed: any, topic: any }> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            callparticipant: props.callparticipant,
            changed: props.changed,
            topic: props.topic
        };

        this.reloadTopic = this.reloadTopic.bind(this);
        this.onChange = this.onChange.bind(this);
    }


    async onReady() {
        this.reloadTopic();
    }

    async reloadTopic() {
        // do nothing on reload
    }

    async onChange(event: any) {
        this.state.changed(event.target.value);
    }


    shouldComponentUpdate() {
        return true;
    }

    async addAgreement() {
        await this.setAgreement('Agree');
    }

    async addDisagreement() {
        await this.setAgreement('Disagree');
    }

    private async setAgreement(status: string) {
        console.error('Updating Agreement: ', status, this.state.call.Agreements);
        var payload = this.context.createPayload();
        var existingAgreements = this.state.call.Agreements.filter((agreement: any) => (
            (agreement.Topic == this.state.topic.CallTopicId) &&
            (agreement.CallParticipant == this.state.callparticipant.CallParticipantId)));
        
        var existingAgreement = (existingAgreements && existingAgreements.length) ? existingAgreements[0] : null;
        var reply = null;

        if (existingAgreement) {
            console.error('Updating existing agreement');
            var index = this.state.call.Agreements.indexOf(existingAgreement);
            this.state.call.Agreements.splice(index, 1);
            payload.TopicAgreement = existingAgreement;
            existingAgreement.Status = status;
            reply = await this.context.moderator.UpdateTopicAgreement(payload);
        } else {
            console.error('Adding new agreement');
            payload.TopicAgreement = payload.TopicAgreement || {
                Topic: this.state.topic.CallTopicId,
                CallParticipant: this.state.callparticipant.CallParticipantId
            };
            payload.TopicAgreement.Status = status;
            reply = await this.context.moderator.AddTopicAgreement(payload);
        }

        if (this.hasNoErrors(reply)) {
            this.state.call.Agreements.push(reply.TopicAgreement);
        }
        this.state.changed({callTopicId: this.state.topic.CallTopicId});
    }

    render() {
        const { call, callparticipant } = this.state;
        console.error('Rendering Participant', call, callparticipant);
        return (
            <div style={{ clear: 'both' }}>
                <div style={{ float: 'right', width: '25%' }}>
                    <IonButton size="small" color="secondary" style={{ float: 'left' }} onClick={() => this.addAgreement()}>Agree</IonButton>
                    <IonButton size="small" color="danger" style={{ float: 'left' }} onClick={() => this.addDisagreement()}>Disagree </IonButton>
                </div>
                <div style={{ fontSize: '1.25em', padding: '0.25em' }}>
                    <label>
                        {(callparticipant?.ParticipantAvatar && callparticipant?.ParticipantAvatar.length) ?
                            <img style={{ width: '2em' }} src={callparticipant?.ParticipantAvatar[0].url} /> :
                            <div style={{ width: '2em', float: 'left', backgroundColor: 'red' }}></div>}{callparticipant?.DisplayName}</label>
                </div>
            </div>
        );
    }
}