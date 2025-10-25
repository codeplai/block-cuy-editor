/* eslint-disable quote-props */
/* global ScratchBlocks */

/**
 * 🧠 VisionKit Autoregister
 * Registra bloques Vision con definiciones JSON completas.
 */
export default function registerVisionBlocks () {
    console.log('🧠 [VisionKit] Autoregister inicializado...');

    const waitForEnvironment = setInterval(() => {
        const vm = window.vm || window.Scratch?.vm;
        const primitives = vm?.runtime?._primitives || {};
        const blockly = window.Blockly || window.ScratchBlocks;

        if (!vm || !vm.runtime || !blockly) return;

        const visionKeys = Object.keys(primitives).filter(k => k.includes('vision'));
        if (visionKeys.length === 0) {
            console.warn('⚠️ [VisionKit] No se encontraron primitivas Vision en VM.');
            return;
        }

        clearInterval(waitForEnvironment);
        console.log(`✅ [VisionKit] Entorno detectado, registrando bloques (${visionKeys.length})...`);

        // Diccionario de definiciones visuales
        const definitions = {
            visionactions_setImageURL: {
                message0: '📸 cargar imagen desde URL %1',
                args0: [{type: 'input_value', name: 'URL'}],
                colour: '#3B82F6'
            },
            visionactions_setImageFile: {
                message0: '📁 cargar imagen desde archivo',
                args0: [],
                colour: '#3B82F6'
            },
            visionactions_show: {
                message0: '👁️ mostrar imagen procesada',
                args0: [],
                colour: '#3B82F6'
            },
            visionactions_exportProcessedImage: {
                message0: '💾 exportar imagen procesada',
                args0: [],
                colour: '#3B82F6'
            },
            visionactions_exportPythonCode: {
                message0: '🐍 exportar código Python',
                args0: [],
                colour: '#3B82F6'
            },

            visionbasic_brightness: {
                message0: '☀️ ajustar brillo %1',
                args0: [{type: 'input_value', name: 'VALOR'}],
                colour: '#10B981'
            },
            visionbasic_contrast: {
                message0: '⚖️ ajustar contraste %1',
                args0: [{type: 'input_value', name: 'VALOR'}],
                colour: '#10B981'
            },
            visionbasic_invert: {
                message0: '🎨 invertir colores',
                args0: [],
                colour: '#10B981'
            },
            visionbasic_pixelate: {
                message0: '🟪 pixelar imagen con tamaño %1',
                args0: [{type: 'input_value', name: 'TAM'}],
                colour: '#10B981'
            },
            visionbasic_circles: {
                message0: '⭕ detectar círculos en la imagen',
                args0: [],
                colour: '#10B981'
            },
            visionbasic_rectangles: {
                message0: '⬛ detectar rectángulos en la imagen',
                args0: [],
                colour: '#10B981'
            },

            visionintermediate_edges: {
                message0: '🪓 detectar bordes (Canny)',
                args0: [],
                colour: '#8B5CF6'
            },
            visionintermediate_gray: {
                message0: '⚫ convertir a escala de grises',
                args0: [],
                colour: '#8B5CF6'
            },
            visionintermediate_gaussian: {
                message0: '🌫️ aplicar filtro gaussiano',
                args0: [],
                colour: '#8B5CF6'
            },
            visionintermediate_rotate: {
                message0: '🔄 rotar imagen %1 grados',
                args0: [{type: 'input_value', name: 'GRADOS'}],
                colour: '#8B5CF6'
            },
            visionintermediate_resize: {
                message0: '📏 redimensionar ancho %1 alto %2',
                args0: [
                    {type: 'input_value', name: 'ANCHO'},
                    {type: 'input_value', name: 'ALTO'}
                ],
                colour: '#8B5CF6'
            },

            visionadvanced_segment: {
                message0: '🧬 segmentar imagen',
                args0: [],
                colour: '#EF4444'
            },
            visionadvanced_detectFeatures: {
                message0: '⭐ detectar características (ORB/SIFT)',
                args0: [],
                colour: '#EF4444'
            },
            visionadvanced_matchFeatures: {
                message0: '🔗 emparejar características entre imágenes',
                args0: [],
                colour: '#EF4444'
            },
            visionadvanced_threshold: {
                message0: '⚪ aplicar umbral con valor %1',
                args0: [{type: 'input_value', name: 'UMBRAL'}],
                colour: '#EF4444'
            },
            visionadvanced_histogram: {
                message0: '📊 mostrar histograma de color',
                args0: [],
                colour: '#EF4444'
            }
        };

        visionKeys.forEach(id => {
            if (!ScratchBlocks.Blocks[id]) {
                const def = definitions[id] || {
                    message0: `🧩 ${id}`,
                    args0: [],
                    colour: '#888'
                };

                ScratchBlocks.Blocks[id] = {
                    init: function () {
                        this.jsonInit({
                            type: id,
                            ...def,
                            previousStatement: null,
                            nextStatement: null,
                            tooltip: id
                        });
                    }
                };
                console.log('🧱 [VisionKit] Bloque visual definido:', id);
            }
        });

        // 🔧 Refrescar el toolbox sin nullificar
        try {
            const workspace = blockly.getMainWorkspace();
            const toolbox = workspace?.toolbox_;
            if (toolbox && typeof toolbox.refreshSelection === 'function') {
                toolbox.refreshSelection();
                workspace.resizeContents();
                console.log('🎨 [VisionKit] Toolbox actualizado y renderizado.');
            }
        } catch (e) {
            console.warn('⚠️ [VisionKit] Error al refrescar toolbox:', e);
        }
    }, 1000);
}
