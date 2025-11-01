/**
 * =====================================================
 * VisionKit - Registro de extensiones Vision (Final estable)
 * =====================================================
 */

const waitForScratchBlocks = function (maxTries = 50) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (window.ScratchBlocks && window.ScratchBlocks.Blocks) {
                clearInterval(interval);
                resolve(window.ScratchBlocks);
            } else if (--maxTries <= 0) {
                clearInterval(interval);
                console.error('[VisionKit] ❌ No se pudo inicializar ScratchBlocks a tiempo.');
                resolve(null);
            }
        }, 200);
    });
};

// Nota: Ya no definimos bloques manualmente. Dejamos que el runtime y GUI
// creen y registren los bloques dinámicamente a partir de getInfo().

const registerVisionExtensions = async function () {
    // Evitar doble registro en recargas HMR o llamadas repetidas
    if (window.VISION_EXTENSIONS_REGISTERED) {
        return;
    }

    // Esperar a que ScratchBlocks esté listo
    await waitForScratchBlocks();

    const vm = window.Scratch?.vm;
    if (!vm) {
        console.warn('[VisionKit] ⚠️ No se encontró instancia VM global.');
        return;
    }

    const extensionManager = vm.extensionManager;
    // Acceder al despachador central para registrar servicios locales
    const dispatch = require('../../../scratch-vm/src/dispatch/central-dispatch');

    const extensions = [
        {id: 'visionactions', classRef: window.VisionActions},
        {id: 'visionbasic', classRef: window.VisionBasic},
        {id: 'visionintermediate', classRef: window.VisionIntermediate},
        {id: 'visionadvanced', classRef: window.VisionAdvanced}
    ];

    let anyRegistered = false;
    for (const {id, classRef} of extensions) {
        if (!classRef) {
            console.warn(`[VisionKit] ⚠️ Clase no encontrada para ${id}`);
            continue;
        }

        try {
            const instance = new classRef(vm.runtime);
            // Ejecutar getInfo una vez para detectar errores tempranos
            instance.getInfo();
            // Registrar la instancia como servicio local con su ID
            dispatch.setServiceSync(id, instance);
            // Registrar metadatos de la extensión para que VM construya los bloques y JSON
            if (typeof extensionManager.registerExtensionServiceSync === 'function') {
                extensionManager.registerExtensionServiceSync(id);
            } else if (typeof extensionManager.registerExtensionService === 'function') {
                extensionManager.registerExtensionService(id);
            } else {
                console.error('[VisionKit] ❌ ExtensionManager no soporta registro de servicios de extensión.');
            }
            anyRegistered = true;
        } catch (err) {
            console.error(`[VisionKit] ❌ Error registrando ${id}:`, err);
        }
    }

    if (anyRegistered) {
        window.VISION_EXTENSIONS_REGISTERED = true;
        console.log('[VisionKit] ✅ Extensiones Vision registradas (flag global establecido).');
    }
};

export default registerVisionExtensions;
