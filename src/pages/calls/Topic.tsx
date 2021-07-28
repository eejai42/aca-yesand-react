import './Call.css'
import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonPopover,
    IonRow,
    IonSearchbar,
} from '@ionic/react';
import { useHistory, useParams } from "react-router";
import { GlobalDataService } from "../../GlobalDataService";
import { GDS } from "../../services/gds.service";
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent'
import EditTopic from './EditTopic'
import TopicParticipant from './TopicParticipant'
import { NONAME } from 'dns';
import { threadId } from 'worker_threads';

export default class TopicComponent extends EffortlessBaseComponent {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            topic: props.topic,
            callCode: props.callCode,
            editDlgOpen: false,
            addAgreementDlg: false,
            topicChanged: props.topicChanged,
            participantChanged: props.participantChanged,
            fallacyPopOverEvent: undefined,
            showFallacyPopOver: false,
            searchText: null
        };
        this.handleClickToOpen = this.handleClickToOpen.bind(this);
        this.handleToClose = this.handleToClose.bind(this);
        this.handleToSave = this.handleToSave.bind(this);
        this.onTopicEnter = this.onTopicEnter.bind(this);
        this.onTopicLeave = this.onTopicLeave.bind(this);
        this.handleToDelete = this.handleToDelete.bind(this);
        this.onChange = this.onChange.bind(this);
        this.showAgreementDlg = this.showAgreementDlg.bind(this);
        this.handleCloseAgreementDlg = this.handleCloseAgreementDlg.bind(this);
    }

    handleClickToOpen() {
        delete this.state.topic.relatedTopicSubject;
        this.setState({ editDlgOpen: true });
    };

    handleToClose() {
        this.setState({ editDlgOpen: false });
    };

    handleCloseAgreementDlg() {
        this.setState({ addAgreementDlg: false });
    };

    async handleToSave() {
        console.error('TOPIC SAVED :: ', this.state.topic, this.state.topic.relatedTopicSubject, 'foo')
        if (this.state.topic.relatedTopicSubject) {
            this.state.topicChanged({ relatedTopicSubject: this.state.topic.relatedTopicSubject });
            this.setState({ editDlgOpen: false });
        } else {

            var payload = this.context.createPayload();
            payload.CallTopic = this.state.topic;
            var reply = await this.context.moderator.UpdateCallTopic(payload);
            if (this.hasNoErrors(reply)) {
                this.setState({ editDlgOpen: false, topic: payload.CallTopic });
            }
        }
    }

    async handleToDelete() {
        console.error('DELETING TOPIC', this.state.topic)
        var payload = this.context.createPayload();
        payload.CallTopic = this.state.topic;
        var reply = await this.context.moderator.DeleteCallTopic(payload);
        if (this.hasNoErrors(reply)) {
            this.setState({ editDlgOpen: false, topic: payload.CallTopic });
        }
    }

    onTopicEnter(event: any) {
        var topic = this.state.topic;
        topic.inHover = true;
        this.setState({ topic: topic })
    }

    onTopicLeave(event: any) {
        var topic = this.state.topic;
        topic.inHover = false;
        this.setState({ topic: topic })
    }

    async onChange(event: any) {
        this.state.topicChanged({ callTopicId: event.target.value });
    }

    showAgreementDlg() {
        this.setState({ addAgreementDlg: true });
    }

    async removeAgreement(agreement: any) {
        console.error('REMOVING AGREEMENT', agreement);
        var payload = this.context.createPayload();
        payload.TopicAgreement = agreement;
        var reply = await this.context.moderator.DeleteTopicAgreement(payload);
        if (this.hasNoErrors(reply)) {
            var index = this.state.call.Agreements.indexOf(agreement);
            if (index >= 0) this.state.call.Agreements.splice(index, 1);
            this.state.topicChanged({ callTopicId: this.state.topic.CallTopicId })
        }
    }
    async removeFallacy(fallacy: any) {
        console.error('REMOVING AGREEMENT', fallacy);
        var payload = this.context.createPayload();
        payload.TopicFallacy = fallacy;
        var reply = await this.context.moderator.DeleteTopicFallacy(payload);
        if (this.hasNoErrors(reply)) {
            var index = this.state.call.Fallacies.indexOf(fallacy);
            if (index >= 0) this.state.call.Fallacies.splice(index, 1);
            this.state.topicChanged({ callTopicId: this.state.topic.CallTopicId })
        }
    }
    getAgreementUrl(agreement: any) {
        return (agreement.CallParticipantAvatar && agreement.CallParticipantAvatar.length) ?
            agreement.CallParticipantAvatar[0].url : '/assets/avatar.png';
    }

    getTopicUrl(topic: any) {
        return (topic.CallParticipantAvatar && topic.CallParticipantAvatar.length) ?
            topic.CallParticipantAvatar[0].url : '/assets/avatar.png';
    }

    async relatedTopicSubjectChanged(event: any) {
        this.state.topic.relatedTopicSubject = event.target.value;
        this.setState({ topic: this.state.topic });
    }

    topicChanged(topic: any) {
        console.error('TOPIC CHANGED: ', topic);
        if (topic.CallTopicId != this.state.call.CurrentTopic) {
            this.state.topicChanged({ callTopicId: topic.CallTopicId });
        }
    }

    keyPressed(event: any) {
        if (event?.code == 'Enter') {
            this.handleToSave();
            this.state.topic.relatedTopicSubject = "";

            this.setState({ topic: this.state.topic });
        }
    }

    async addFallacy(fallacy: any, status: any) {
        await this.setFallacy(fallacy, status);
        this.setState({ showFallacyPopOver: false })
    }

    private async setFallacy(fallacy: any, status: string) {
        // console.error('Updating Agreement: ', status, this.state.call.Agreements);
        var existingFallacies = this.lookForExistingFallacy(fallacy);

        var existingFallacy = (existingFallacies && existingFallacies.length) ? existingFallacies[0] : null;
        var reply = null;

        if (existingFallacy) {
            reply = await this.updateExistingTopicFallacy(existingFallacy, status);
        } else {
            reply = await this.addTopicFallacy(fallacy, status);
        }

        if (this.hasNoErrors(reply)) {
            await this.state.call.Fallacies.push(reply.TopicFallacy);
        }
        this.state.topicChanged({ callTopicId: this.state.topic.CallTopicId });
    }

    private async addTopicFallacy(fallacy: any, status: string,) {
        var payload = this.context.createPayload();
        console.error('Adding new Fallacy');
        payload.TopicFallacy = payload.TopicFallacy || {
            CallTopic: this.state.topic.CallTopicId,
            Fallacy: fallacy.FallacyId
        };
        payload.TopicFallacy.Status = status;
        return await this.context.moderator.AddTopicFallacy(payload);

    }

    private async updateExistingTopicFallacy(existingFallacy: any, status: string) {
        var payload = this.context.createPayload();
        console.error('Updating existing Fallacy');
        var index = this.state.call.Fallacies.indexOf(existingFallacy);
        this.state.call.Fallacies.splice(index, 1);
        payload.TopicFallacies = existingFallacy;
        existingFallacy.Status = status;
        return await this.context.moderator.UpdateTopicFallacy(payload);

    }

    private lookForExistingFallacy(fallacy: any) {
        console.error("Fallacies::", this.state.call.Fallacies)

        return this.state.call.Fallacies.filter((topicFallacy: any) => (
            (topicFallacy?.CallTopic == this.state.topic.CallTopicId) &&
            (topicFallacy?.Fallacy == fallacy?.FallacyId)));
    }

    fallacyTabs(call: any, topic: any) {
        return (
            <div>
                {call?.Fallacies?.filter((fallacy: any) => fallacy?.CallTopic == topic.CallTopicId).map((fallacy: any) =>
                    <IonButton key={fallacy} size="small" color="white"
                        onClick={() => { this.removeFallacy(fallacy) }}>
                        <img style={{ width: '2em', verticalAlign: 'middle', padding: '0.1em' }} src={fallacy.FallacyIcon[0] ? fallacy.FallacyIcon[0].url : ""} />
                    </IonButton>
                )}
            </div>
        )
    }

    render() {
        const { call, topic } = this.state;
        const childTopics = call?.Topics?.filter((childTopic: any) => childTopic.ParentTopic == topic.CallTopicId);
        const isActive = call.CurrentTopic == topic.CallTopicId;

        // console.error("Call Fallacies: " ,call.Fallacies)

        // const fallacies = JSON.parse(localStorage.getItem("fallacies") || "[]");

        return (
            <div style={{ padding: '0.25em', paddingRight: 0, clear: 'both', borderTop: 'solid gray 1px', cursor: 'pointer' }} className={isActive ? 'activeTopic' : ''}>
                <div style={{ float: 'left' }}>
                    <div style={{ float: 'right' }}><img src={this.getTopicUrl(topic)} style={{ width: '2em', verticalAlign: 'middle', padding: '0.25em' }} />
                    </div>
                </div>
                <span>
                    <div style={{ float: 'right' }}>
                        {call?.Agreements?.filter((agreement: any) => agreement.Topic == topic.CallTopicId)
                            .map((agreement: any) =>
                                <div className={(agreement.Status + '').toLowerCase()} style={{ float: 'right' }}>
                                    <div style={{ clear: 'both', display: 'table' }}>
                                        <IonButton color={agreement.Status == 'Agree' ? 'success' : 'danger'} size="small"
                                            onClick={() => this.removeAgreement(agreement)}>
                                            <img src={this.getAgreementUrl(agreement)} style={{ width: '2em', verticalAlign: 'middle', padding: '0.25em' }} />
                                            x</IonButton>
                                    </div>
                                </div>)}

                        {this.fallacyTabs(call, topic)}

                        {isActive && <>
                            <IonPopover
                                cssClass='my-custom-class'
                                event={this.state.fallacyPopOverEvent}
                                isOpen={this.state.showFallacyPopOver}
                                onDidDismiss={() => this.setState({ fallacyPopOverEvent: undefined, showFallacyPopOver: false })}
                            >
                                <IonList>
                                    {this.context.fallacies ? this.context.fallacies.map((fallacy: any) =>
                                        <IonItem button key={fallacy.FallacyId} onClick={() => this.addFallacy(fallacy, "Proposed")}>
                                            <IonLabel>
                                                <span>
                                                    <img src={fallacy.Icon?.length ? fallacy.Icon[0].url : ""} style={{ width: '2em', verticalAlign: 'middle', padding: '0.25em' }} />
                                                </span> {fallacy.Name}
                                            </IonLabel>
                                        </IonItem>
                                    ) : <IonItem >
                                        <IonLabel>Empty</IonLabel>
                                    </IonItem>}
                                </IonList>
                            </IonPopover>
                            {/* <IonButton size="small">Fallacies</IonButton> */}
                            <IonButton size="small" color="medium" onClick={
                                (e: any) => {
                                    e.persist();
                                    this.setState({ fallacyPopOverEvent: e, showFallacyPopOver: true });
                                }}
                            >
                                Fallacies
                            </IonButton>
                        </>}
                    </div>
                </span>
                <div onClick={() => this.topicChanged(topic)}>
                    <b>
                        <div className={topic?.HasDisagreement ? 'disagree' : (topic?.HasAgreement ? 'agree' : '')}>
                            <input type="radio" name="currentTopic" id={topic.CallTopicId} value={topic.CallTopicId}
                                checked={isActive} onChange={this.onChange} style={{ display: 'none' }} />
                            <label style={{ cursor: 'pointer' }} htmlFor={topic.CallTopicId}> {topic?.Subject}</label>
                        </div>
                    </b>
                </div>
                {isActive && <div>
                    <div>
                        <div style={{ padding: '0.75em' }}>
                            {call?.Participants?.map((callparticipant: any) => {
                                return <div key={callparticipant.CallParticipantId + call.LastModifiedTime} >
                                    <TopicParticipant call={call} callparticipant={callparticipant}
                                        topic={topic} topicChanged={(event: any) => this.state.topicChanged(event)}
                                        participantChanged={(participantId: any) => this.state.participantChanged(participantId)} />
                                </div>
                            })}
                        </div>
                    </div>
                </div>}

                {(childTopics.length > 0) && <div>
                    <div style={{ marginLeft: "1.5em" }}>
                        {childTopics.map((childTopic: any) => {
                            return <div key={childTopic.CallTopicId}>
                                <TopicComponent call={call} topic={childTopic} topicChanged={this.state.topicChanged}
                                    participantChanged={this.state.participantChanged} />
                            </div>
                        })}
                    </div>
                </div>}


                <Dialog open={this.state.editDlgOpen} onClose={this.handleToClose}>
                    <DialogTitle>{topic?.Subject}</DialogTitle>
                    <DialogContent >
                        <EditTopic call={call} topic={topic} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleToDelete} color="primary" autoFocus>
                            Delete
                        </Button>
                        <Button onClick={this.handleToClose} color="primary" autoFocus>
                            Cancel
                        </Button>
                        <Button onClick={this.handleToSave} disabled={topic?.subject?.length < 4} color="primary" autoFocus>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}