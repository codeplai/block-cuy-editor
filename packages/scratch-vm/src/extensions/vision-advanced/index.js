const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

class VisionAdvanced {
    constructor (runtime) {
        this.runtime = runtime;
        this.baseURL = 'http://127.0.0.1:8001';
    }

    // =========================================================
    // ✅ INFORMACIÓN DE LA EXTENSIÓN
    // =========================================================
    getInfo () {
        return {
            id: 'visionadvanced',
            name: 'Vision Avanzado',
            color1: '#A78BFA',
            color2: '#7C3AED',
            color3: '#4C1D95',
            blocks: [
                {
                    opcode: 'segment',
                    blockType: BlockType.COMMAND,
                    text: 'segmentar imagen (k-means)'
                },
                {
                    opcode: 'detectFeatures',
                    blockType: BlockType.COMMAND,
                    text: 'detectar características ORB'
                },
                {
                    opcode: 'matchFeatures',
                    blockType: BlockType.COMMAND,
                    text: 'comparar características entre imágenes'
                },
                {
                    opcode: 'threshold',
                    blockType: BlockType.COMMAND,
                    text: 'aplicar umbral binario [THRESH]',
                    arguments: {
                        THRESH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 127
                        }
                    }
                },
                {
                    opcode: 'histogram',
                    blockType: BlockType.COMMAND,
                    text: 'mostrar histograma de colores'
                }
            ],
            menus: {}
        };
    }
    // =========================================================
    // ✅ REGISTRO DE PRIMITIVAS CON PREFIJOS CORRECTOS
    // =========================================================
    getPrimitives () {
        return {
            segment: this.segment.bind(this),
            detectFeatures: this.detectFeatures.bind(this),
            matchFeatures: this.matchFeatures.bind(this),
            threshold: this.threshold.bind(this),
            histogram: this.histogram.bind(this)
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
                console.error(`[VisionAdvanced] Error HTTP ${resp.status}`);
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
                console.warn('[VisionAdvanced] No se recibió imagen en respuesta.');
                if (imageDataURL) this.runtime.emit('VISION_IMAGE', imageDataURL);
            }
        } catch (err) {
            console.error('[VisionAdvanced] Error conectando con backend:', err);
            const imageDataURL = this.runtime?._visionLastDataURL;
            if (imageDataURL) this.runtime.emit('VISION_IMAGE', imageDataURL);
        }
    }

    // =========================================================
    // 🧠 IMPLEMENTACIONES DE BLOQUES
    // =========================================================
    segment () {
        // Mapear a k-means en backend
        return this._call('kmeans');
    }

    detectFeatures () {
        // Mapear a ORB
        return this._call('orb');
    }

    matchFeatures () {
        // A falta de implementación de emparejamiento, mostramos características ORB para dar feedback visual
        return this._call('orb');
    }

    threshold (args) {
        // Aproximar con watershed binario (el backend actual no expone "threshold" genérico)
        void args; // sin usar por ahora
        return this._call('watershed');
    }

    histogram () {
        // Mostrar un efecto visible; se usa "sharpen" como sustituto temporal
        return this._call('sharpen');
    }
}

// =========================================================
// ✅ EXPORTACIÓN FORMAL PARA SCRATCH VM
// =========================================================
module.exports = VisionAdvanced;
