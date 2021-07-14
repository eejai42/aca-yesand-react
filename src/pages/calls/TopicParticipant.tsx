
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
import { thumbsDownOutline, thumbsUpOutline, thumbsUpSharp } from "ionicons/icons";

export default class TopicParticipantComponent extends EffortlessBaseComponent<{ call: any, callparticipant: any, topicChanged: any, participantChanged : any, topic: any },
    { call: any, callparticipant: any, topicChanged: any, participantChanged : any, topic: any }> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            callparticipant: props.callparticipant,
            topicChanged: props.topicChanged,
            participantChanged : props.participantChanged,
            topic: props.topic
        };

        this.reloadTopic = this.reloadTopic.bind(this);
    }


    async onReady() {
        this.reloadTopic();
    }

    async reloadTopic() {
        // do nothing on reload
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
        this.state.topicChanged({callTopicId: this.state.topic.CallTopicId});
    }

    getParticipantUrl(callparticipant:any) {
        return (callparticipant.ParticipantAvatar && callparticipant.ParticipantAvatar.length) ?
                    callparticipant.ParticipantAvatar[0].url : '/assets/avatar.png';
    }


    
    async relatedTopicSubjectChanged(event: any) {
        this.state.call.relatedTopicSubject = event.target.value;
        this.setState({ call: this.state.call });
    }

    keyPressed(event:any) {
        if (event?.code == 'Enter') {
            this.state.topicChanged({relatedTopicSubject: this.state.call.relatedTopicSubject});
            this.state.call.relatedTopicSubject = "";

            this.setState({topic: this.state.topic});
        }
    }

    render() {
        const { call, callparticipant } = this.state;
        console.error('Rendering Participant', call, callparticipant);
        return (
            <div style={{ clear: 'both' }} className={(call.CurrentParticipant == callparticipant.CallParticipantId) ? 'speaking' : 'notspeaking'}>
                <div style={{ float: 'right', width: '25%', padding: '0.4em' }}>
                    <IonButton size="small" color="success  " style={{ float: 'right' }} onClick={() => this.addAgreement()}><IonIcon slot="start" icon={thumbsUpOutline} /></IonButton>
                    <IonButton size="small" color="danger" style={{ float: 'right' }} onClick={() => this.addDisagreement()}><IonIcon slot="start" icon={thumbsDownOutline} /> </IonButton>
                </div>
                <div style={{ fontSize: '1.25em', padding: '0.25em' }} onClick={() => this.state.participantChanged(callparticipant.CallParticipantId)}>
                    <label><img style={{ width: '2em', verticalAlign: 'middle', padding: '0.1em' }} src={this.getParticipantUrl(callparticipant)} />
                            {callparticipant?.DisplayName}</label>
                </div>

                {call.CurrentParticipant == callparticipant.CallParticipantId && <div style={{margin: '0.5em', marginLeft: '2em'}}>
                                        <label>Add Sub Topic: </label>
                                        <input type="text" name="newSubTopic" value={call.relatedTopicSubject} onKeyDown={(event:any) => this.keyPressed(event)}
                                                style={{width: '50%'}} onChange={(event) => this.relatedTopicSubjectChanged(event)}  />
                                                <div style={{clear: 'both'}}>&nbsp;</div>
                                    </div>}

            </div>
        );
    }
}