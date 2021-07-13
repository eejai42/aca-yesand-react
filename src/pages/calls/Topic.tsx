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

export default class TopicComponent extends EffortlessBaseComponent<{ call: any, topic: any, changed: any },
    {
        call: any, topic: any, callCode: string, editDlgOpen: boolean,
        changed: any, addAgreementDlg: boolean
    }> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            topic: props.topic,
            callCode: props.callCode,
            editDlgOpen: false,
            addAgreementDlg: false,
            changed: props.changed
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
            this.state.changed({ relatedTopicSubject: this.state.topic.relatedTopicSubject });
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
        this.state.changed({ callTopicId: event.target.value });
    }


    participantChanged() {
        this.state.changed({ callTopicId: this.state.topic.CallTopicId });
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
            this.state.changed({callTopicId: this.state.topic.CallTopicId})
        }
    }

    render() {
        console.error('Rendering TOPIC');
        const { call, topic } = this.state;
        const childTopics = call?.Topics?.filter((childTopic: any) => childTopic.ParentTopic == topic.CallTopicId);
        const isActive = call.CurrentTopic == topic.CallTopicId;

        return (
            <div style={{ padding: '0.25em' }}>
                {isActive && <div>
                    <div>
                        <Button variant="outlined" color="primary" style={{ float: 'right' }}
                            onClick={this.handleClickToOpen}>[Edit]</Button>
                    </div>
                </div>}

                <b>
                    <div className={topic?.HasDisagreement ? 'disagree' : (topic?.HasAgreement ? 'agree' : '')}>
                        <input type="radio" name="currentTopic" id={topic.CallTopicId} value={topic.CallTopicId}
                            checked={isActive} onChange={this.onChange} />
                        <label htmlFor={topic.CallTopicId}>{topic?.Subject}</label>
                    </div>
                </b>
                {call?.Agreements?.filter((agreement: any) => agreement.Topic == topic.CallTopicId)
                    .map((agreement: any) => <div className={(agreement.Status + '').toLowerCase()}>
                        {agreement.CallParticipantAvatar && agreement.CallParticipantAvatar.length && <div style={{ clear: 'both', display: 'table' }}>
                            <img src={agreement.CallParticipantAvatar[0].url} style={{ width: '2em', verticalAlign: 'middle' }} />
                            {agreement.CallParticipantDisplayName} <IonButton size="small" onClick={() => this.removeAgreement(agreement)}>x</IonButton>
                        </div>}
                    </div>)}

                {isActive && <div>
                    <div>
                        <div style={{ padding: '0.75em' }}>
                            {call?.Participants?.map((callparticipant: any) => {
                                return <div key={callparticipant.CallParticipantId + call.LastModifiedTime} >
                                    <TopicParticipant call={call} callparticipant={callparticipant}
                                        topic={topic} changed={() => this.participantChanged()}  />
                                </div>
                            })}
                        </div>
                    </div>
                </div>}

                {(childTopics.length > 0) && <div>
                    <div style={{ marginLeft: "1.5em" }}>
                        {childTopics.map((childTopic: any) => {
                            return <div key={childTopic.CallTopicId}>
                                <TopicComponent call={call} topic={childTopic} changed={this.state.changed} />
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