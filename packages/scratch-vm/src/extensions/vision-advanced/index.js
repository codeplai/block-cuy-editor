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
            const resp = await fetch(`${this.baseURL}/process`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({op, params})
            });

            if (!resp.ok) {
                console.error(`[VisionAdvanced] Error HTTP ${resp.status}`);
                return;
            }

            const data = await resp.json();

            if (data.image_b64) {
                this.runtime.emit('VISION_IMAGE', data.image_b64);
            } else {
                console.warn('[VisionAdvanced] No se recibió imagen en respuesta.');
            }
        } catch (err) {
            console.error('[VisionAdvanced] Error conectando con backend:', err);
        }
    }

    // =========================================================
    // 🧠 IMPLEMENTACIONES DE BLOQUES
    // =========================================================
    segment () {
        return this._call('segment');
    }

    detectFeatures () {
        return this._call('detectFeatures');
    }

    matchFeatures () {
        return this._call('matchFeatures');
    }

    threshold (args) {
        return this._call('threshold', {thresh: args.THRESH});
    }

    histogram () {
        return this._call('histogram');
    }
}

// =========================================================
// ✅ EXPORTACIÓN FORMAL PARA SCRATCH VM
// =========================================================
module.exports = VisionAdvanced;
