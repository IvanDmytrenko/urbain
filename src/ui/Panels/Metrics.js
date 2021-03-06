
import UIPanel from "../Panel";
import {Events} from "../../core/Events";
import UIPanelVector from "./Vector";
import {presentNumberWithSuffix, rad2deg} from "../../algebra";

export default class UIPanelMetrics extends UIPanel
{
    constructor(panelDom, selection) {
        super(panelDom);

        this.selection = selection;
        this.precision = 5;

        this.renderListener = this.render.bind(this);

        document.addEventListener(Events.SELECT, this.handleSelect.bind(this));
        document.addEventListener(Events.DESELECT, this.handleDeselect.bind(this));

        this.jqDom.find('#showAnglesOfSelectedOrbit').on('change', function() {
            sim.settings.ui.showAnglesOfSelectedOrbit = this.checked;
            if (!selection.getSelectedObject()) {
                return;
            }
            if (this.checked) {
                selection.getSelectedObject().keplerianEditor.init();
            } else {
                selection.getSelectedObject().keplerianEditor.remove();
            }
        });

        this.positionPanel = new UIPanelVector(this.jqDom.find("table[data-panel-name='position_vector']"), null);
        this.velocityPanel = new UIPanelVector(this.jqDom.find("table[data-panel-name='velocity_vector']"), null);

        this.hide();
    }

    render(event) {
        const selectedObject = this.selection.getSelectedObject();
        if (!selectedObject) {
            return;
        }

        const referenceFrame = selectedObject.getReferenceFrameByEpoch(event.detail.epoch);
        if (referenceFrame) {
            this.jqDom.find('#relativeTo').html(sim.starSystem.getObject(referenceFrame.originId).name);
        }

        this.updateCartesian(selectedObject, event.detail.epoch);
        this.updateKeplerian(selectedObject, event.detail.epoch);
    }

    updateCartesian(selectedObject, epoch) {
        const state = selectedObject.getStateInOwnFrameByEpoch(epoch);
        this.positionPanel.set(state.position);
        this.velocityPanel.set(state.velocity);
    }

    updateKeplerian(selectedObject, epoch) {
        const keplerianObject = selectedObject.getKeplerianObjectByEpoch(epoch);
        this.jqDom.find('#elements-ecc' ).html('' +        ( keplerianObject.e   ).toPrecision(this.precision));
        this.jqDom.find('#elements-sma' ).html('' + presentNumberWithSuffix(keplerianObject.sma));
        this.jqDom.find('#elements-inc' ).html('' + rad2deg( keplerianObject.inc ).toPrecision(this.precision));
        this.jqDom.find('#elements-aop' ).html('' + rad2deg( keplerianObject.aop ).toPrecision(this.precision));
        this.jqDom.find('#elements-raan').html('' + rad2deg( keplerianObject.raan).toPrecision(this.precision));
        this.jqDom.find('#elements-ta'  ).html('' + rad2deg( keplerianObject.getTrueAnomalyByEpoch(epoch)  ).toPrecision(this.precision));
        this.jqDom.find('#elements-period').html('' + (keplerianObject.period / 86400).toPrecision(this.precision));
    }

    handleSelect() {
        this.show();

        const object = this.selection.getSelectedObject().object;
        if (object) {
            $('#metricsOf').html(object.name);
        } else {
            $('#relativeTo,#metricsOf').html('');
        }

        document.addEventListener(Events.RENDER, this.renderListener);
    }

    handleDeselect() {
        this.hide();
        document.removeEventListener(Events.RENDER, this.renderListener);
    }
}