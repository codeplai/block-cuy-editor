const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

class VisionIntermediate {
    constructor (runtime) {
        this.runtime = runtime;
        this.baseURL = 'http://127.0.0.1:8001';
    }

    // =========================================================
    // ✅ INFORMACIÓN DE LA EXTENSIÓN (con prefijos correctos)
    // =========================================================
    getInfo () {
        return {
            id: 'visionintermediate',
            name: 'Vision Intermedio',
            color1: '#FACC15',
            color2: '#CA8A04',
            color3: '#854D0E',
            blocks: [
                {
                    opcode: 'edges',
                    blockType: BlockType.COMMAND,
                    text: 'detectar bordes (Canny)'
                },
                {
                    opcode: 'gray',
                    blockType: BlockType.COMMAND,
                    text: 'convertir a escala de grises'
                },
                {
                    opcode: 'gaussian',
                    blockType: BlockType.COMMAND,
                    text: 'aplicar filtro gaussiano'
                },
                {
                    opcode: 'rotate',
                    blockType: BlockType.COMMAND,
                    text: 'rotar imagen [ANGLE] grados',
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'resize',
                    blockType: BlockType.COMMAND,
                    text: 'redimensionar a [W] × [H]',
                    arguments: {
                        W: {type: ArgumentType.NUMBER, defaultValue: 320},
                        H: {type: ArgumentType.NUMBER, defaultValue: 240}
                    }
                }
            ],
            menus: {}
        };
    }

    // =========================================================
    // ✅ REGISTRO DE PRIMITIVAS CON PREFIJO COMPLETO
    // =========================================================
    getPrimitives () {
        return {
            edges: this.edges.bind(this),
            gray: this.gray.bind(this),
            gaussian: this.gaussian.bind(this),
            rotate: this.rotate.bind(this),
            resize: this.resize.bind(this)
        };
    }

    // =========================================================
    // 🔧 FUNCIÓN BASE DE COMUNICACIÓN CON BACKEND
    // =========================================================
    async _call (op, params = {}) {
        try {
            const imageDataURL = this.runtime?._visionLastDataURL;
            const body = imageDataURL ? {op, params, image_b64: imageDataURL} : {op, params};
            const resp = await fetch(`${this.baseURL}/process`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                console.error(`[VisionIntermediate] Error HTTP ${resp.status}`);
                // Como último recurso, volver a mostrar la última imagen conocida para no dejar al usuario “sin nada”.
                if (imageDataURL) this.runtime.emit('VISION_IMAGE', imageDataURL);
                return;
            }

            const data = await resp.json();
            if (data && data.image_b64) {
                try {
                    this.runtime._visionLastDataURL = data.image_b64;
                } catch (e) {
                    // ignore
                }
                this.runtime.emit('VISION_IMAGE', data.image_b64);
            } else {
                console.warn('[VisionIntermediate] No se recibió imagen en respuesta.');
                if (imageDataURL) this.runtime.emit('VISION_IMAGE', imageDataURL);
            }
        } catch (err) {
            console.error('[VisionIntermediate] Error en conexión con backend:', err);
            const imageDataURL = this.runtime?._visionLastDataURL;
            if (imageDataURL) this.runtime.emit('VISION_IMAGE', imageDataURL);
        }
    }

    // =========================================================
    // 🧩 IMPLEMENTACIONES DE BLOQUES
    // =========================================================
    edges () {
        // Alinear con backend: usa operación "canny" con umbrales por defecto
        return this._call('canny', {t1: 100, t2: 200});
    }

    gray () {
        // El backend actual no expone "gray"; aproximamos con SOBEL para un resultado en escala de grises
        return this._call('sobel');
    }

    gaussian () {
        return this._call('gaussian');
    }

    rotate (args) {
        // Backend espera "deg" en lugar de "angle"
        return this._call('rotate', {deg: args.ANGLE});
    }

    async resize (args) {
        // El backend expone "scale" con un factor "s". Calculamos un factor aproximado a partir del ancho/alto deseado.
        const dataURL = this.runtime?._visionLastDataURL;
        if (!dataURL) return this._call('scale', {s: 1});
        const img = await new Promise(resolve => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => resolve(null);
            el.src = dataURL;
        });
        if (!img || !img.width || !img.height) return this._call('scale', {s: 1});
        const sx = Number(args.W) / img.width;
        const sy = Number(args.H) / img.height;
        const s = Math.max(0.1, Math.min(5, Math.min(sx || 1, sy || 1)));
        return this._call('scale', {s});
    }
}

// =========================================================
// ✅ EXPORTACIÓN FORMAL PARA SCRATCH VM
// =========================================================
module.exports = VisionIntermediate;
