import React from "react";
import {IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import { GDS } from "../../services/gds.service";
import { GlobalDataService } from "../../GlobalDataService";

export class Profile extends React.Component {

    constructor(props : any) {
        super(props);
    }
    static contextType = GlobalDataService;
    context!: React.ContextType<typeof GlobalDataService>;

    componentDidMount() {
        console.error('COMPONENT MOUNTED...');
        var self = this;
        self.context.readiness$.subscribe((ready) => {
            if (ready) self.setState({});
        });
    }

    render() {
        let context = this.context;
        
    
        return (
            <IonPage>
                <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                    <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Profile</IonTitle>
                </IonToolbar>
                </IonHeader>
        
                <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                    <IonTitle size="large">Profile</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div>
                    Content goes here...
                </div>
                <div>
                    Role: {context.role}
                </div>
                <div>
                    User: {context.whoAmI?.EmailAddress}
                </div>
                </IonContent>
            </IonPage>
        );
    }
};

export default Profile;