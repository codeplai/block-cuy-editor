/* eslint-disable func-style */
/* eslint-disable space-before-function-paren */

// Adaptador mínimo V2 para bitmaps usado por scratch-vm al cargar bitmaps.
// Provee resize() y convertDataURIToBinary(), suficientes para load-costume.

class VisionBitmapAdapter {
    /**
     * Redimensiona un canvas origen a un nuevo canvas del tamaño solicitado.
     * @param {HTMLCanvasElement} source Canvas origen.
     * @param {number} width Ancho solicitado.
     * @param {number} height Alto solicitado.
     * @returns {HTMLCanvasElement} Nuevo canvas redimensionado.
     */
    resize (source, width, height) {
        const cnv = document.createElement('canvas');
        cnv.width = Math.max(1, Math.floor(width));
        cnv.height = Math.max(1, Math.floor(height));
        const ctx = cnv.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, cnv.width, cnv.height);
        return cnv;
    }

    /**
     * Convierte un dataURL a binario (Uint8Array) para storage.createAsset.
     * @param {string} dataURI Data URL (image/png, image/jpeg, etc.)
     * @returns {Uint8Array} Bytes decodificados del data URL
     */
    convertDataURIToBinary (dataURI) {
        const parts = dataURI.split(',');
        const base64 = parts.length > 1 ? parts[1] : parts[0];
        const raw = atob(base64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        return bytes;
    }
}

export default VisionBitmapAdapter;
