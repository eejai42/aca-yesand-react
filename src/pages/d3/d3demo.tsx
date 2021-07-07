import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
// import d3 from 'react-d3-library'
// import { threadId } from 'worker_threads';
// import rd3 from 'react-d3-library'
// import * as d3Scale from 'd3-scale';
// import * as d3Array from 'd3-array';
// import * as d3Axis from 'd3-axis';

class D3demo extends React.Component <{}, {data: number[]}> {

    constructor(props: any) {
        super(props);
        this.state = {
            data: [4, 8, 15, 16, 23, 42]
        }
    }

    componentDidMount() {

    }

    // bar() {
    //     const divElement = d3.create("div")
    //         .style("font", "10px sans-serif")
    //         .style("text-align", "right")
    //         .style("color", "white");

    //     var step1 = divElement.selectAll("div")
    //                 .data(this.state.data).join("div")
    //         .style("background", "steelblue")
    //         .style("padding", "3px")
    //         .style("margin", "1px")
    //         .style("width", d => `${d * 10}px`)
    //         .text(d => d);

    //     return divElement.node();
    // }
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
                    {/* {this.bar()} */}
                    {/* <h1>hello world </h1> */}
                </IonContent>
            </IonPage>
        );
    }
};

export default D3demo;