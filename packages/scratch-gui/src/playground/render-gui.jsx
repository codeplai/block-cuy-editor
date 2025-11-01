/* eslint-disable max-len */
/* eslint-disable quote-props */
/* eslint-disable space-infix-ops */

import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';

// Core Scratch
import VirtualMachine from 'scratch-vm';

const THEME = 'light';

const onClickLogo = () => {
    window.location = 'https://scratch.mit.edu';
};
const handleTelemetryModalCancel = () => log('User canceled telemetry modal');
const handleTelemetryModalOptIn = () => log('User opted into telemetry');
const handleTelemetryModalOptOut = () => log('User opted out of telemetry');

/**
 * Renderiza GUI e inicializa la VM (si no se provee una).
 * NOTA: el renderer se adjunta dentro del componente Stage de GUI;
 * aquí no lo creamos manualmente para evitar duplicados.
 * @param {HTMLElement} appTarget
 * @param {import('scratch-vm')} [vmParam]
 */

export default (appTarget, vmParam) => {
    GUI.setAppElement(appTarget);

    // VM única (si viene de fuera, úsala; si no, crea una nueva)
    const vm = vmParam || new VirtualMachine();

    // Exponer globales coherentes
    if (!window.Scratch) window.Scratch = {};
    window.Scratch.vm = vm;
    window.vm = vm; // alias para utilidades externas

    // Montar GUI
    const WrappedGui = compose(AppStateHOC, HashParserHOC)(GUI);
    const gui = (
        <WrappedGui
            canEditTitle
            enableCommunity
            isPlayerOnly={false}
            onClickLogo={onClickLogo}
            onTelemetryModalCancel={handleTelemetryModalCancel}
            onTelemetryModalOptIn={handleTelemetryModalOptIn}
            onTelemetryModalOptOut={handleTelemetryModalOptOut}
            platform="WEB"
            vm={vm}
        />
    );

    const appTargetDiv = document.createElement('div');
    appTargetDiv.className = 'app';
    document.body.appendChild(appTargetDiv);

    const style = document.createElement('style');
    style.textContent = `
        html, body { margin:0; padding:0; height:100%; overflow:hidden; background:${THEME === 'dark' ? '#0f172a' : '#f9fafb'}; }
        .app { position:fixed; inset:0; }
        ${THEME === 'dark' ? `
        .blocklyToolboxDiv{background:#0f172a!important;}
        .blocklySvg{background:#1e293b!important;}
        ` : ''}
    `;
    document.head.appendChild(style);

    ReactDOM.render(gui, appTargetDiv);

    // Exponer ScratchBlocks globalmente cuando esté listo
    const exposeScratchBlocks = () => {
        const check = setInterval(() => {
            const rootContainer =
                appTargetDiv._reactRootContainer ||
                appTargetDiv._reactRoot ||
                appTargetDiv._internalRoot;

            const reactFiber =
                rootContainer?._internalRoot?.current ||
                rootContainer?._reactRootContainer?._internalRoot?.current;

            const guiNode =
                reactFiber?.child?.child?.stateNode ||
                reactFiber?.child?.stateNode;

            if (guiNode && guiNode.ScratchBlocks) {
                window.ScratchBlocks = guiNode.ScratchBlocks;
                window.Blockly = guiNode.ScratchBlocks;
                console.log('%c✅ [VisionKit] ScratchBlocks expuesto globalmente', 'color:#10B981;font-weight:bold;');
                clearInterval(check);
            }
        }, 500);
    };
    exposeScratchBlocks();

    console.log('%c🧩 [VisionKit] VM inicializada y GUI renderizada', 'color:#0ea5e9;font-weight:bold;');
};
