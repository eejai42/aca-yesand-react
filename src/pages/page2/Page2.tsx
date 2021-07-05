import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../../components/ExploreContainer';
import './Page2.css';
import { GDS } from '../../services/gds.service'
import React from 'react';

export class Page2 extends React.Component<{}, {name:string}> {

  constructor(props : any) {
    super(props)

    this.state = {
      name : "unnamed"
    };
  }


  render() {
    const { name } = this.state;
    
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>PAGE 2 {name} changed</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{name + '123'}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <ExploreContainer name={name} size={123} />
        </IonContent>
      </IonPage>
    );
  }


};

export default Page2;
