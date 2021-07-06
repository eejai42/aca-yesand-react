import React from 'react';
import { GlobalDataService } from '../GlobalDataService';


export class EffortlessBaseComponent<P, S> extends React.Component<P, S> {

    constructor(props: any) {
        super(props)
    }
    static contextType = GlobalDataService;
    context!: React.ContextType<typeof GlobalDataService>;

    componentDidMount() {
        console.error('COMPONENT MOUNTED...');
        var self = this;
        self.context.readiness$.subscribe((ready:any) => {
            if (ready) self.onReady();
        })
    }

    async onReady() {

    }
}