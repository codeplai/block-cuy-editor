const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

class VisionBasic {
    constructor (runtime) {
        this.runtime = runtime;
        this.baseURL = 'http://127.0.0.1:8001';
    }

    // =========================================================
    // ✅ INFORMACIÓN DE LA EXTENSIÓN
    // =========================================================
    getInfo () {
        return {
            id: 'visionbasic',
            name: 'Vision Básico',
            color1: '#34D399',
            color2: '#059669',
            color3: '#064E3B',
            blocks: [
                {
                    opcode: 'brightness',
                    blockType: BlockType.COMMAND,
                    text: 'ajustar brillo [BETA]',
                    arguments: {
                        BETA: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 30
                        }
                    }
                },
                {
                    opcode: 'contrast',
                    blockType: BlockType.COMMAND,
                    text: 'ajustar contraste [ALPHA]',
                    arguments: {
                        ALPHA: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1.2
                        }
                    }
                },
                {
                    opcode: 'invert',
                    blockType: BlockType.COMMAND,
                    text: 'invertir colores'
                },
                {
                    opcode: 'pixelate',
                    blockType: BlockType.COMMAND,
                    text: 'pixelar imagen [F]',
                    arguments: {
                        F: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 8
                        }
                    }
                },
                {
                    opcode: 'circles',
                    blockType: BlockType.COMMAND,
                    text: 'detectar círculos'
                },
                {
                    opcode: 'rectangles',
                    blockType: BlockType.COMMAND,
                    text: 'detectar rectángulos'
                }
            ],
            menus: {}
        };
    }

    // =========================================================
    // ✅ REGISTRO DE PRIMITIVAS (IMPORTANTE)
    // =========================================================
    getPrimitives () {
        return {
            brightness: this.brightness.bind(this),
            contrast: this.contrast.bind(this),
            invert: this.invert.bind(this),
            pixelate: this.pixelate.bind(this),
            circles: this.circles.bind(this),
            rectangles: this.rectangles.bind(this)
        };
    }

    // =========================================================
    // 🔧 FUNCIÓN BASE DE COMUNICACIÓN CON BACKEND
    // =========================================================
    async _call (op, params = {}, pythonCodeInfo = null) {
        try {
            // Incluir imagen base si está disponible compartida por VisionActions
            const imageDataURL = this.runtime?._visionLastDataURL;
            const resp = await fetch(`${this.baseURL}/process`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(imageDataURL ? {op, params, image_b64: imageDataURL} : {op, params})
            });

            if (!resp.ok) {
                console.error(`[VisionBasic] Error HTTP ${resp.status}`);
                return;
            }

            const data = await resp.json();
            if (data.image_b64) {
                try {
                    this.runtime._visionLastDataURL = data.image_b64;
                } catch (e) {
                    // ignore
                }
                this.runtime.emit('VISION_IMAGE', data.image_b64);

                // Registrar operación para exportación Python
                if (pythonCodeInfo) {
                    if (!this.runtime._visionPythonHistory) {
                        this.runtime._visionPythonHistory = [];
                    }
                    this.runtime._visionPythonHistory.push(pythonCodeInfo);
                }
            } else {
                console.warn('[VisionBasic] No se recibió imagen en respuesta.');
            }
        } catch (err) {
            console.error('[VisionBasic] Error en conexión con backend:', err);
        }
    }

    // =========================================================
    // 🧩 IMPLEMENTACIONES DE BLOQUES
    // =========================================================
    brightness (args) {
        return this._call('brightness', {beta: args.BETA}, {
            description: `Ajustar brillo: ${args.BETA}`,
            code: `img = cv2.convertScaleAbs(img, alpha=1.0, beta=${args.BETA})`
        });
    }

    contrast (args) {
        return this._call('contrast', {alpha: args.ALPHA}, {
            description: `Ajustar contraste: ${args.ALPHA}`,
            code: `img = cv2.convertScaleAbs(img, alpha=${args.ALPHA}, beta=0)`
        });
    }

    invert () {
        return this._call('invert', {}, {
            description: 'Invertir colores',
            code: 'img = cv2.bitwise_not(img)'
        });
    }

    pixelate (args) {
        return this._call('pixelate', {factor: args.F}, {
            description: `Pixelar imagen: factor ${args.F}`,
            code: `h, w = img.shape[:2]
temp = cv2.resize(img, (w//${args.F}, h//${args.F}))
img = cv2.resize(temp, (w, h), interpolation=cv2.INTER_NEAREST)`
        });
    }

    circles () {
        return this._call('circles', {}, {
            description: 'Detectar círculos (HoughCircles)',
            code: `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = cv2.medianBlur(gray, 5)
circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1.2, 30, param1=100, param2=30, minRadius=10, maxRadius=200)
if circles is not None:
    for i in circles[0]:
        cv2.circle(img, (i[0], i[1]), i[2], (0, 255, 0), 3)
        cv2.circle(img, (i[0], i[1]), 3, (0, 0, 255), -1)`
        });
    }

    rectangles () {
        return this._call('rectangles', {}, {
            description: 'Detectar rectángulos',
            code: `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (5, 5), 0)
edges = cv2.Canny(blurred, 50, 150)
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
for cnt in contours:
    approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
    if len(approx) == 4 and cv2.contourArea(cnt) > 1000:
        cv2.drawContours(img, [approx], 0, (0, 255, 0), 3)`
        });
    }
}

// =========================================================
// ✅ EXPORTACIÓN FORMAL
// =========================================================
module.exports = VisionBasic;
