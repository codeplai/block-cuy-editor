// ============================
//  Polyfills para compatibilidad
// ============================
import 'es6-object-assign/auto';
import 'core-js/fn/array/includes';
import 'core-js/fn/promise/finally';
import 'intl'; // Para Safari 9

// ============================
//  Librerías principales
// ============================
import React from 'react';
import ReactDOM from 'react-dom';
// Evitamos crear una VM externa aquí; GUI administra su propia VM en Redux

import AppStateHOC from '../lib/app-state-hoc.jsx';
import BrowserModalComponent from '../components/browser-modal/browser-modal.jsx';
import supportedBrowser from '../lib/supported-browser';
import styles from './index.css';

// ============================
//  Extensiones VisionKit
// ============================
const VisionActions = require('../../../scratch-vm/src/extensions/vision-actions');
const VisionBasic = require('../../../scratch-vm/src/extensions/vision-basic');
const VisionIntermediate = require('../../../scratch-vm/src/extensions/vision-intermediate');
const VisionAdvanced = require('../../../scratch-vm/src/extensions/vision-advanced');

// Exponer globalmente
window.VisionActions = VisionActions;
window.VisionBasic = VisionBasic;
window.VisionIntermediate = VisionIntermediate;
window.VisionAdvanced = VisionAdvanced;

// ============================
//  Decorador Vision Kit
// ============================
import setupVisionKitDecorator from '../lib/vision-decorator';

/**
 * 🧩 Espera hasta que el toolbox esté completamente inicializado.
 * @returns {Promise<object>} toolbox real
 */
const waitForToolboxReady = () =>
    new Promise(resolve => {
        const check = setInterval(() => {
            const sb = window.ScratchBlocks || window.Blockly;
            const ws = sb?.getMainWorkspace ? sb.getMainWorkspace() : sb?.mainWorkspace;
            const tb = ws?.toolbox_;
            if (tb && typeof tb.setSelectedCategoryById === 'function') {
                clearInterval(check);
                console.log('%c✅ [VisionKit] Toolbox inicializado correctamente.', 'color:#10b981;font-weight:bold;');
                resolve(tb);
            }
        }, 250);
    });

/**
 * 🚀 Inicialización principal de Scratch GUI + VisionKit
 */
const initializeApp = async () => {
    const appTarget = document.createElement('div');
    appTarget.className = styles.app;
    document.body.appendChild(appTarget);

    // Aseguramos objeto global para exponer clases Vision (la VM real la expone GUI.jsx)
    if (!window.Scratch) window.Scratch = {};

    if (supportedBrowser()) {
        const renderGUI = require('./render-gui.jsx').default;
        renderGUI(appTarget);

        console.log('%c[VisionKit] ⏳ Esperando que toolbox se inicialice...', 'color:#fbbf24;font-weight:bold;');
        await waitForToolboxReady();

        console.log('%c[VisionKit] 🧠 Toolbox listo. Procediendo con VisionKit...', 'color:#3b82f6;font-weight:bold;');

        // === Esperar que las clases VisionKit estén disponibles
        const waitForVisionClasses = async () => {
            const required = [
                'VisionActions',
                'VisionBasic',
                'VisionIntermediate',
                'VisionAdvanced'
            ];
            let retries = 0;
            while (!required.every(cls => window[cls]) && retries < 10) {
                console.log(`[VisionKit] ⏳ Esperando clases VisionKit... (${retries + 1}/10)`);
                await new Promise(r => setTimeout(r, 1000));
                retries++;
            }
        };
        await waitForVisionClasses();

        // El registro de VisionKit ahora lo hace GUI.jsx al montar la VM real

        // === Iniciar decorador Vision Kit una vez toolbox y extensiones estén seguros
        setTimeout(() => {
            try {
                if (typeof setupVisionKitDecorator === 'function') {
                    setupVisionKitDecorator(window.Scratch?.vm);
                    console.log('%c✅ [VisionKit] Decorador ejecutado tras toolbox listo.',
                        'color:#3b82f6;font-weight:bold;');
                } else {
                    console.warn('⚠️ [VisionKit] setupVisionKitDecorator no se importó correctamente.');
                }
            } catch (err) {
                console.warn('⚠️ [VisionKit] Error ejecutando decorador:', err);
            }
        }, 500);
    } else {
        BrowserModalComponent.setAppElement(appTarget);
        const WrappedBrowserModalComponent = AppStateHOC(
            BrowserModalComponent,
            true
        );
        const props = {onBack: () => {}};
        ReactDOM.render(<WrappedBrowserModalComponent {...props} />, appTarget);
    }
};

// 🚀 Ejecutar inicialización principal
initializeApp();
