/* eslint-disable func-style */
/* eslint-disable quote-props */

// ==========================
// 🧩 IMPORTACIONES BASE
// ==========================
import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';
import {PLATFORM} from '../lib/platform.js';

import * as Blockly from 'scratch-blocks';
import decorateVisionToolbox from '../lib/vision-decorator';
import registerVisionBlocks from '../lib/vision-autoregister';
import makeToolboxXML from '../lib/make-toolbox-xml.js';

// ==========================
// 🌍 EXPOSICIONES GLOBALES
// ==========================
if (typeof window !== 'undefined') {
    window.Blockly = Blockly;
    window.makeToolboxXML = makeToolboxXML;
    console.log('%c[VisionKit] Entorno global inicializado.', 'color:#06b6d4; font-weight:bold;');
}

// ==========================
// 🧩 PARCHE COLOR TOOLBOX
// ==========================
(() => {
    if (!Blockly.Toolbox || !Blockly.Toolbox.Category) return;
    const orig = Blockly.Toolbox.Category.prototype.setColour;

    Blockly.Toolbox.Category.prototype.setColour = function (input) {
        try {
            let colour = '#888888'; // Color seguro por defecto

            if (input && typeof input.getAttribute === 'function') {
                const c = input.getAttribute('colour');
                if (c && /^#[0-9A-Fa-f]{3,6}$/.test(c)) colour = c;
            } else if (typeof input === 'string' && input.includes('category')) {
                const match = input.match(/colour\s*=\s*["'](#[0-9A-Fa-f]{3,6})["']/i);
                if (match) colour = match[1];
            } else if (typeof input === 'object' && input !== null) {
                const c = input.colour || input.color || input.primaryColour || input.primaryColor;
                if (c && /^#[0-9A-Fa-f]{3,6}$/.test(c)) colour = c;
            } else if (typeof input === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(input)) {
                colour = input;
            }

            try {
                return orig.call(this, colour);
            } catch {
                this.colour_ = colour;
                if (this.parent_ && this.parent_.htmlDiv_) {
                    this.parent_.htmlDiv_.style.setProperty('--category-color', colour);
                }
            }
        } catch (err) {
            console.warn('[VisionKit] Color fallback aplicado:', err);
            this.colour_ = '#888888';
        }
    };
    console.log('%c[VisionKit] Parche de color seguro aplicado.', 'color:#22c55e; font-weight:bold;');
})();

// ==========================
// ⚙️ FUNCIONES DE LOGO Y TELEMETRÍA
// ==========================
const onClickLogo = () => {
    window.location = 'https://scratch.mit.edu';
};
const handleTelemetryModalCancel = () => log('User canceled telemetry modal');
const handleTelemetryModalOptIn = () => log('User opted into telemetry');
const handleTelemetryModalOptOut = () => log('User opted out of telemetry');

// ==========================
// 🧠 FUNCIÓN PRINCIPAL DE RENDER
// ==========================
export default appTarget => {
    GUI.setAppElement(appTarget);

    const WrappedGui = compose(AppStateHOC, HashParserHOC)(GUI);

    ReactDOM.render(
        <WrappedGui
            isPlayerOnly={false}
            showTelemetryModal={false}
            onTelemetryModalOptIn={handleTelemetryModalOptIn}
            onTelemetryModalOptOut={handleTelemetryModalOptOut}
            onTelemetryModalCancel={handleTelemetryModalCancel}
            canSave={false}
            canCreateNew={false}
            canRemix={false}
            canShare={false}
            showComingSoon={false}
            basePath="/"
            isStandalone
            platform={PLATFORM}
            onClickLogo={onClickLogo}
        />,
        appTarget
    );

    console.log('%c✅ [VisionKit] GUI renderizado correctamente.', 'color:#34d399; font-weight:bold;');

    // ==========================
    // 🧩 ACTIVAR VISION DECORATOR POST-MONTAJE
    // ==========================
    const waitForVMReady = setInterval(() => {
        // 🧠 Buscar la VM real dentro de React globalmente
        const candidate = window?.Scratch?.vm || window?.vm;

        if (candidate && candidate.runtime && Blockly?.Blocks) {
            clearInterval(waitForVMReady);

            // 📦 Exponer globalmente
            window.vm = candidate;
            window.ScratchBlocks = Blockly;
            console.log('%c✅ [VisionKit] VM y ScratchBlocks detectados tras montaje.',
                'color:#22c55e; font-weight:bold;');

            // 🚀 Ejecutar VisionKit ahora
            try {
                decorateVisionToolbox(window.vm, WrappedGui);
                registerVisionBlocks();
                console.log('%c🧱 [VisionKit] Bloques registrados tras montaje.', 'color:#0ea5e9; font-weight:bold;');
            } catch (err) {
                console.error('❌ [VisionKit] Error en post-mount decorator:', err);
            }
        } else {
            console.log('⏳ [VisionKit] Aún esperando VM o ScratchBlocks post-render...');
        }
    }, 1000);
};
