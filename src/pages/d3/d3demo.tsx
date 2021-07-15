import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
// import rd3 from 'react-d3-library'
import * as d3 from 'd3'
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent';
import { take } from 'rxjs/operators';
// import rd3 from 'react-d3-library'
// import * as d3Scale from 'd3-scale';
// import * as d3Array from 'd3-array';
// import * as d3Axis from 'd3-axis';

class D3demo extends EffortlessBaseComponent {

    constructor(props: any) {
        super(props);
        this.state = {
            data: [4, 8, 15, 16, 23, 42]
        }
    }

    componentDidMount() {
        console.error('COMPONENT DID MOUNT');
        window.GDS.d3event$.subscribe((value: any) => {
            if (value) {
                alert('CONTROLLER EVENT: ' + JSON.stringify(value));
                this.setState({
                    data: [23, 42, 8, 4, 15, 16]
                });
            }
        });
    }

    loadData(): string {
        const divNode = document.createElement('div')
        var divElement : any = d3.select(divNode)
            .style("font", "10px sans-serif")
            .style("text-align", "right")
            .style("color", "white");

        divElement.selectAll("div")
            .data(this.state.data).join("div")
            .style("background", "steelblue")
            .style("padding", "3px")
            .style("margin", "1px")
            .style("width", (d:any) => `${d * 10}px`)
            .attr('onClick', (d:any) => `GDS.d3event$.next({event:'click', value:'${d}'})`)
            .text((d:any) => d);
        return divElement.node()?.outerHTML + '';
    }
    render() {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>d3</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <h1>hello world </h1>
                    <span dangerouslySetInnerHTML={{ __html: this.loadData() }} />
                </IonContent>
            </IonPage>
        );
    }

};

export default D3demo;