/* eslint-disable quote-props */
/* eslint-disable func-style */
import registerVisionBlocks from './vision-autoregister';

/**
 * 🎨 VisionKit Decorator
 * Espera a que la VM y ScratchBlocks estén listos, registra las extensiones
 * y actualiza el toolbox de manera segura.
 */

const decorateVisionToolbox = function (vm, gui) {
    console.log('🟢 [VisionKit] Decorador iniciado, esperando entorno completo...');

    const waitForVM = setInterval(() => {
        const candidateVM =
            vm ||
            window.vm ||
            window.Scratch?.vm ||
            gui?.props?.vm ||
            gui?.state?.vm ||
            gui?.vm;

        const hasVM = candidateVM?.runtime && candidateVM?.extensionManager;
        const hasBlocks = window.ScratchBlocks?.Blocks;

        console.log(`⏳ [VisionKit] Esperando... VM:${!!hasVM} | ScratchBlocks:${!!hasBlocks}`);

        if (hasVM && hasBlocks) {
            clearInterval(waitForVM);
            console.log('⚙️ [VisionKit] VM detectada correctamente, registrando extensiones...');
            registerExtensions(candidateVM, gui);
        }
    }, 800);
};

/**
 * 🔧 Registra las extensiones Vision dentro de la VM y actualiza la GUI.
 */

const registerExtensions = function (vm) {
    try {
        const modules = {
            visionactions: require('scratch-vm/src/extensions/vision-actions'),
            visionbasic: require('scratch-vm/src/extensions/vision-basic'),
            visionintermediate: require('scratch-vm/src/extensions/vision-intermediate'),
            visionadvanced: require('scratch-vm/src/extensions/vision-advanced')
        };

        Object.entries(modules).forEach(([id, ExtensionClass]) => {
            try {
                if (!vm.extensionManager.isExtensionLoaded(id)) {
                    const instance = new ExtensionClass(vm.runtime);
                    vm.extensionManager._loadedExtensions[id] = instance;

                    const primitives = instance.getPrimitives ? instance.getPrimitives() : {};
                    Object.assign(vm.runtime._primitives, primitives);

                    console.log(`✅ [VisionKit] Extensión registrada:
                        ${id} (${Object.keys(primitives).length} bloques).`);
                }
            } catch (err) {
                console.warn(`⚠️ [VisionKit] Error al registrar ${id}:`, err);
            }
        });

        console.log('✨ [VisionKit] Registro manual completo. Esperando toolbox...');

        // 🧠 Activar el registro visual
        const waitForVisual = setInterval(() => {
            if (window.ScratchBlocks?.Blocks && Object.keys(window.ScratchBlocks.Blocks).length > 0) {
                clearInterval(waitForVisual);
                console.log('🧠 [VisionKit] ScratchBlocks listo → ejecutando registerVisionBlocks()');
                registerVisionBlocks();
            }
        }, 1000);
    } catch (err) {
        console.error('❌ [VisionKit] Error al registrar extensiones Vision:', err);
    }
};

export default decorateVisionToolbox;
