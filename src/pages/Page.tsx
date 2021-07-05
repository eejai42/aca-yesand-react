import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import TestComponent from './test'
import './Page.css';

import { GDS } from '../services/gds.service'

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}  changed - {process.env.SHOWS?.length}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name + '123'}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <TestComponent />
        <ExploreContainer name={name} size={123} />
      </IonContent>
    </IonPage>
  );
};

export default Page;
