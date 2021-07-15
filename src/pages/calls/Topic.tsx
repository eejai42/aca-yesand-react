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
import EditTopic from './EditTopic'
import TopicParticipant from './TopicParticipant'

export default class TopicComponent extends EffortlessBaseComponent<{ call: any, topic: any, topicChanged: any, participantChanged: any },
    {
        call: any, topic: any, callCode: string, editDlgOpen: boolean,
        topicChanged: any, addAgreementDlg: boolean, participantChanged: any
    }> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            topic: props.topic,
            callCode: props.callCode,
            editDlgOpen: false,
            addAgreementDlg: false,
            topicChanged: props.topicChanged,
            participantChanged: props.participantChanged
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

    render() {
        const { call, topic } = this.state;
        const childTopics = call?.Topics?.filter((childTopic: any) => childTopic.ParentTopic == topic.CallTopicId);
        const isActive = call.CurrentTopic == topic.CallTopicId;

        return (
            <div style={{ padding: '0.25em', paddingRight: 0, clear: 'both', borderTop: 'solid gray 1px', cursor: 'pointer' }} className={isActive ? 'activeTopic' : ''}>
                <div style={{ float: 'left' }}>
                    <div style={{ float: 'right' }}><img src={this.getTopicUrl(topic)} style={{ width: '2em', verticalAlign: 'middle', padding: '0.25em' }} />
                    </div>
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
                </div>
                <div onClick={() => this.topicChanged(topic)}>
                    <b>
                        <div className={topic?.HasDisagreement ? 'disagree' : (topic?.HasAgreement ? 'agree' : '')}>
                            <input type="radio" name="currentTopic" id={topic.CallTopicId} value={topic.CallTopicId}
                                checked={isActive} onChange={this.onChange} style={{ display: 'none' }} />
                            <label style={{ cursor: 'pointer' }} htmlFor={topic.CallTopicId}> -- {topic?.Subject}</label>
                        </div>
                    </b>
                </div>
                {isActive && <div>
                    <div>
                        <IonButton style={{ float: 'right' }}>Fallacies</IonButton>
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