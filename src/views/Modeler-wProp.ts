import { EMPTY_DIAGRAM } from './emptyDiagram.js';

export class ModelerWProp {
    async displayNew(name, request, response) {
        response.render('modeler', {
            title: name, processName: name, xml: EMPTY_DIAGRAM,
            withProps: true, cspHost: process.env.ITSM_HOST,
        });
    }
    async display(processName, xml, request, response) {
        response.render('modeler', {
            title: processName, processName, xml,
            withProps: true, cspHost: process.env.ITSM_HOST,
        });
    }
}
