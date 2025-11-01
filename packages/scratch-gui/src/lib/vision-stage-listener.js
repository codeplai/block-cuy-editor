/* eslint-disable no-console */
/* eslint-disable func-style */
/* eslint-disable space-before-function-paren */

// Escucha eventos VISION_IMAGE del runtime y los muestra en el escenario como un nuevo fondo.

/**
 * Normaliza la cadena recibida a un Data URL usable por el renderer.
 * @param {string} data Cadena base64 o dataURL.
 * @returns {string|null} Data URL
 */
function dataToDataURL(data) {
    if (!data) return null;
    if (typeof data === 'string' && data.startsWith('data:')) return data;
    // Asumir PNG si viene en base64 sin prefijo
    if (typeof data === 'string') return `data:image/png;base64,${data}`;
    return null;
}

/**
 * Convierte un dataURL a Uint8Array.
 * @param {string} dataURL Data URL a convertir.
 * @returns {Promise<Uint8Array>} Bytes de la imagen.
 */
async function dataURLToUint8Array(dataURL) {
    const res = await fetch(dataURL);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
}

let listenerInstalled = false;

/**
 * Maneja un evento VISION_IMAGE, creando un nuevo fondo en el escenario.
 * @param {*} vm Instancia de VM global (window.Scratch.vm).
 * @param {string} payload Cadena con imagen (base64 o dataURL).
 */
async function handleVisionImage(vm, payload) {
    try {
        const dataURL = dataToDataURL(payload);
        if (!dataURL) return;

        const storage = vm.runtime && vm.runtime.storage;
        if (!storage) {
            console.warn('[VisionKit] storage no disponible; no se puede crear asset.');
            return;
        }
        const bytes = await dataURLToUint8Array(dataURL);
        const asset = storage.createAsset(
            storage.AssetType.ImageBitmap,
            storage.DataFormat.PNG,
            bytes,
            null,
            true // generate md5
        );

        const backdropObject = {
            // nombre legible, con timestamp para fácil depuración
            name: `Vision Output ${new Date().toLocaleTimeString()}`,
            asset,
            dataFormat: storage.DataFormat.PNG
        };

        // md5ext ficticio; si el objeto trae asset, se ignora y se usa loadCostumeFromAsset
        await vm.addBackdrop('dynamic.png', backdropObject);
    } catch (e) {
        console.warn('[VisionKit] Error aplicando imagen al escenario:', e && e.message ? e.message : e);
    }
}

/**
 * Inicializa el listener de VISION_IMAGE una sola vez.
 */
function initVisionStageListener() {
    if (listenerInstalled) return;
    const vm = window.Scratch && window.Scratch.vm;
    if (!vm || !vm.runtime) {
        console.warn('[VisionKit] VM aún no está listo para escuchar VISION_IMAGE.');
        return;
    }
    try {
        vm.runtime.on('VISION_IMAGE', data => handleVisionImage(vm, data));
        listenerInstalled = true;
        console.log('%c🖼️ [VisionKit] Listener de VISION_IMAGE instalado.', 'color:#06b6d4;font-weight:bold;');
    } catch (e) {
        console.warn('[VisionKit] No se pudo instalar listener VISION_IMAGE:', e);
    }
}

// Exponer para uso manual si se requiere
window.initVisionStageListener = initVisionStageListener;

export default initVisionStageListener;
