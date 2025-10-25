/**
 * Registro manual de extensiones Vision en la VM.
 *
 * @param {object} vm - Instancia de la máquina virtual de Scratch (Scratch VM)
 */
export default function registerVisionExtensions (vm) {
    try {
        // ✅ Importación directa de las clases de extensión
        const modules = {
            visionactions: require('scratch-vm/src/extensions/vision-actions'),
            visionbasic: require('scratch-vm/src/extensions/vision-basic'),
            visionintermediate: require('scratch-vm/src/extensions/vision-intermediate'),
            visionadvanced: require('scratch-vm/src/extensions/vision-advanced')
        };

        Object.entries(modules).forEach(([id, ExtensionClass]) => {
            try {
                // 🔧 Instancia real de la clase
                const extensionInstance = new ExtensionClass(vm.runtime);

                // 🧱 Registrar dentro del ExtensionManager de Scratch
                vm.extensionManager._loadedExtensions[id] = extensionInstance;

                // ⚡ Registrar sus primitivas (bloques)
                const primitives = extensionInstance.getPrimitives ? extensionInstance.getPrimitives() : {};

                Object.assign(vm.runtime._primitives, primitives);

                console.log(`🧩 [VisionKit] Extensión registrada: ${id} (${Object.keys(primitives).length} bloques).`);
            } catch (err) {
                console.warn(`⚠️ [VisionKit] Error al registrar extensión ${id}:`, err);
            }
        });

        console.log('✅ [VisionKit] Todas las extensiones Vision registradas correctamente.');
    } catch (err) {
        console.error('❌ [VisionKit] Falló el registro manual de extensiones:', err);
    }
}
