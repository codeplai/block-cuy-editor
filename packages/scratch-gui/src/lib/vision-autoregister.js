/* eslint-disable max-len */
/* eslint-disable func-style */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-console */

/**
 * @file vision-autoregister.js
 * Inicializa y registra automáticamente las extensiones VisionKit
 * cuando la VM (VirtualMachine) ya está disponible en el entorno Scratch.
 */

console.log('%c[VisionKit] 🚀 AutoRegister VisionKit inicializado...', 'color:#8b5cf6;font-weight:bold;');

const alreadyLoaded = Boolean(window.__visionAutoRegisterLoaded);

if (alreadyLoaded) {
    console.warn('⚠️ [VisionKit] AutoRegister ya estaba cargado.');
} else {
    window.__visionAutoRegisterLoaded = true;

    /**
     * Intenta registrar VisionKit si la VM ya está disponible.
     * @returns {Promise<void>} Promesa que se resuelve al registrar VisionKit.
     */
    const tryRegisterVisionKit = async () => {
        const vm = window.vm;
        const loaded = window.__visionRegisterLoaded;

        if (loaded || !vm || !vm.runtime) {
            return;
        }

        try {
            const mod = await import('./vision-register.js');
            const registerVisionExtensions = mod.default || mod.registerVisionExtensions;
            if (typeof registerVisionExtensions === 'function') {
                // Esperar a que termine el registro antes de marcar como cargado
                await registerVisionExtensions(vm);
                if (window) window.__visionRegisterLoaded = true;
            }
        } catch (err) {
            console.error('❌ [VisionKit] Error importando vision-register.js:', err);
        }
    };

    // Intento inicial inmediato
    tryRegisterVisionKit();

    // Reintentos periódicos hasta registrar
    const interval = setInterval(() => {
        if (window.__visionRegisterLoaded) {
            clearInterval(interval);
        } else {
            tryRegisterVisionKit();
        }
    }, 1000);
}
