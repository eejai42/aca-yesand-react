
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

export default class TopicComponent extends EffortlessBaseComponent<{ call: any, topic: any, changed: any },
    {
        call: any, topic: any, callCode: string, editDlgOpen: boolean,
        changed: any, relatedTopicSubject: string
    }> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            topic: props.topic,
            callCode: props.callCode,
            editDlgOpen: false,
            changed: props.changed,
            relatedTopicSubject: ""
        };
        this.handleClickToOpen = this.handleClickToOpen.bind(this);
        this.handleToClose = this.handleToClose.bind(this);
        this.handleToSave = this.handleToSave.bind(this);
        this.onTopicEnter = this.onTopicEnter.bind(this);
        this.onTopicLeave = this.onTopicLeave.bind(this);
        this.handleToDelete = this.handleToDelete.bind(this);        
        this.onChange = this.onChange.bind(this);
        this.addRelatedTopic = this.addRelatedTopic.bind(this);
        this.relatedTopicSubjectChanged = this.relatedTopicSubjectChanged.bind(this);
    }

    handleClickToOpen() {
        this.setState({ editDlgOpen: true });
    };

    handleToClose() {
        console.error('CLOSING TOPIC WITHOUT SAVING')
        this.setState({ editDlgOpen: false });
    };

    async handleToSave() {
        console.error('SAVING TOPIC', this.state.topic)
        var payload = this.context.createPayload();
        payload.CallTopic = this.state.topic;
        var reply = await this.context.moderator.UpdateCallTopic(payload);
        if (this.hasNoErrors(reply)) {
            this.setState({ editDlgOpen: false, topic: payload.CallTopic });
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

    async relatedTopicSubjectChanged(event: any) {
        this.setState({ relatedTopicSubject: event.target.value });
    }

    async addRelatedTopic() {
        this.state.changed({ relatedTopicSubject: this.state.relatedTopicSubject });
        this.setState({relatedTopicSubject:""});
    }

    render() {
        console.error('Rendering TOPIC');
        const { call, topic } = this.state;
        const childTopics = call?.Topics?.filter((childTopic: any) => childTopic.ParentTopic == topic.CallTopicId);
        const isActive = call.CurrentTopic == topic.CallTopicId;
        return (
            <div onMouseEnter={this.onTopicEnter} onMouseLeave={this.onTopicLeave}>
                {topic.inHover && <Button variant="outlined" color="primary" style={{ float: 'right' }}
                    onClick={this.handleClickToOpen}>
                    [Edit]
                </Button>}
                <h3>
                    <div>
                        <input type="radio" name="currentTopic" id={topic.CallTopicId} value={topic.CallTopicId}
                            checked={isActive} onChange={this.onChange} />
                        <label htmlFor={topic.CallTopicId}>{topic?.Subject}</label>
                    </div>
                </h3>
                {isActive && <div>
                    <div>
                        <div>
                            <label htmlFor="newSubTopic">Related topic</label>
                            <input type="text" name="newSubTopic" value={this.state.relatedTopicSubject} onChange={this.relatedTopicSubjectChanged} autoFocus />
                        </div>
                        <IonButton onClick={this.addRelatedTopic}>Add Sub-Topic</IonButton>
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