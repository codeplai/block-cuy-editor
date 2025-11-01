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
                // Como último recurso, volver a mostrar la última imagen conocida para no dejar al usuario "sin nada".
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

                // Registrar operación para exportación Python
                if (params.pythonCode) {
                    if (!this.runtime._visionPythonHistory) {
                        this.runtime._visionPythonHistory = [];
                    }
                    this.runtime._visionPythonHistory.push(params.pythonCode);
                }
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
        return this._call('canny', {
            t1: 100,
            t2: 200,
            pythonCode: {
                description: 'Detectar bordes (Canny)',
                code: 'img = cv2.Canny(img, 100, 200)\nimg = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)'
            }
        });
    }

    gray () {
        // El backend actual no expone "gray"; aproximamos con SOBEL para un resultado en escala de grises
        return this._call('sobel', {
            pythonCode: {
                description: 'Convertir a escala de grises (Sobel)',
                code: `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
img = cv2.convertScaleAbs(cv2.addWeighted(grad_x, 0.5, grad_y, 0.5, 0))
img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)`
            }
        });
    }

    gaussian () {
        return this._call('gaussian', {
            pythonCode: {
                description: 'Aplicar filtro gaussiano',
                code: 'img = cv2.GaussianBlur(img, (5, 5), 0)'
            }
        });
    }

    rotate (args) {
        // Backend espera "deg" en lugar de "angle"
        return this._call('rotate', {
            deg: args.ANGLE,
            pythonCode: {
                description: `Rotar imagen ${args.ANGLE} grados`,
                code: `h, w = img.shape[:2]
M = cv2.getRotationMatrix2D((w//2, h//2), ${args.ANGLE}, 1)
img = cv2.warpAffine(img, M, (w, h))`
            }
        });
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
        return this._call('scale', {
            s,
            pythonCode: {
                description: `Redimensionar imagen a ${args.W} × ${args.H}`,
                code: `img = cv2.resize(img, (${args.W}, ${args.H}))`
            }
        });
    }
}

// =========================================================
// ✅ EXPORTACIÓN FORMAL PARA SCRATCH VM
// =========================================================
module.exports = VisionIntermediate;
