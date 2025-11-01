/**
 * =====================================================
 * VisionKit - Generador dinámico de toolbox XML (seguro)
 * =====================================================
 * Combina el XML base de categorías del VM con las categorías de Vision,
 * evitando mostrar bloques rojos y sincronizando el momento de registro.
 */

/**
 * Retorna un color seguro para Blockly (matiz entre 0-360).
 * @param {string|number} color Valor recibido desde getInfo().
 * @returns {string} Color validado como matiz.
 */
const safeColor = function (color) {
    const DEFAULT_HUE = '45';
    try {
        if (!color) return DEFAULT_HUE;
        const colorStr = color.toString().trim();
        if (colorStr === '') return DEFAULT_HUE;
        if (colorStr.startsWith('#')) {
            if (!/^#[0-9A-Fa-f]{6}$/.test(colorStr)) return DEFAULT_HUE;
            const r = parseInt(colorStr.slice(1, 3), 16) / 255;
            const g = parseInt(colorStr.slice(3, 5), 16) / 255;
            const b = parseInt(colorStr.slice(5, 7), 16) / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            let hue = 0;
            if (delta !== 0) {
                if (max === r) hue = ((g - b) / delta) % 6;
                else if (max === g) hue = ((b - r) / delta) + 2;
                else hue = ((r - g) / delta) + 4;
            }
            hue = Math.round(hue * 60);
            if (hue < 0) hue += 360;
            return hue.toString();
        }
        const hue = parseInt(colorStr, 10);
        if (isNaN(hue)) return DEFAULT_HUE;
        const normalizedHue = ((hue % 360) + 360) % 360;
        return normalizedHue.toString();
    } catch (err) {
        return DEFAULT_HUE;
    }
};

/**
 * Crea el XML para una categoría VisionKit.
 * IMPORTANTE: El tipo del bloque debe coincidir con el opcode EXTENDIDO
 * que registra el runtime: `${extensionId}_${opcode}`.
 * @param {string} extensionId - ID de la extensión (categoryInfo.id / getInfo().id).
 * @param {string} name - Nombre visible de la categoría.
 * @param {string} color1 - Color principal.
 * @param {Array} blocks - Lista de bloques (objetos con opcode, text y args).
 * @returns {string} XML para esa categoría.
 */
const _createCategoryXML = function (extensionId, name, color1, blocks) {
    if (!blocks || !blocks.length) {
        return '';
    }

    // Filtrar bloques que aún no tienen definición para evitar "bloques rojos"
    const definedBlocks = blocks.filter(block => {
        let type;
        if (typeof block.opcode === 'string' && block.opcode.startsWith(`${extensionId}_`)) {
            type = block.opcode;
        } else {
            type = `${extensionId}_${block.opcode}`;
        }
        const SB = window.ScratchBlocks || window.Blockly;
        return SB && SB.Blocks && SB.Blocks[type];
    });

    if (!definedBlocks.length) return '';

    const xmlBlocks = definedBlocks
        .map(block => {
            // El tipo debe coincidir EXACTAMENTE con el opcode registrado por la VM.
            // Si el opcode ya viene con prefijo `<id>_`, lo usamos tal cual.
            // Si no, le anteponemos `<id>_`.
            let blockType;
            if (typeof block.opcode === 'string' && block.opcode.startsWith(`${extensionId}_`)) {
                blockType = block.opcode;
            } else {
                blockType = `${extensionId}_${block.opcode}`;
            }
            const argXML = Object.entries(block.arguments || {})
                .map(([argName, argDef]) => {
                    const defaultValue = argDef.defaultValue ?? '';
                    const isNumber = (
                        typeof argDef.type === 'number' ||
                        ['number', 'float', 'int'].includes(String(argDef.type).toLowerCase())
                    );
                    const shadowType = isNumber ? 'math_number' : 'text';
                    const fieldName = isNumber ? 'NUM' : 'TEXT';

                    return `
                        <value name="${argName}">
                            <shadow type="${shadowType}">
                                <field name="${fieldName}">${defaultValue}</field>
                            </shadow>
                        </value>`;
                })
                .join('\n');

            return `
                <block type="${blockType}">
                    ${argXML}
                </block>`;
        })
        .join('\n');

    // Asegurarse de que el color sea válido antes de crear el XML
    const validatedColor = safeColor(color1);
    console.log(`[VisionKit] 🎨 Creando categoría "${name}" con color: ${validatedColor}`);

    return `
        <category id="${extensionId}" name="${name}" colour="${validatedColor}" secondaryColour="${validatedColor}">
            ${xmlBlocks}
        </category>`;
};

/**
 * Genera el XML completo del toolbox para las extensiones Vision.
 * Este reemplaza y sincroniza las categorías del XML principal.
 * @returns {string} XML del toolbox completo.
 */
/**
 * Genera el XML del toolbox combinando categorías base (dinámicas) y Vision.
 * Firma compatible con containers/blocks.jsx: (isInitial, isStage, targetId, dynamicBlocksXML, ...)
 * @returns {string} XML del toolbox completo
 */
const makeToolboxXML = function (...args) {
    let dynamicBlocksXML = args[3];

    const normalizeXML = value => {
        try {
            if (!value) return '';
            if (typeof value === 'string') return value;
            if (value && (value.nodeType || value.ownerDocument)) {
                const serializer = new XMLSerializer();
                return serializer.serializeToString(value);
            }
            if (value && value.outerHTML) return value.outerHTML;
            return '';
        } catch (e) {
            return '';
        }
    };

    // Caso 1: dynamicBlocksXML es un array de categorías de extensiones
    // (formato devuelto por runtime.getBlocksXML + injectExtensionCategoryTheme).
    // Construimos un toolbox solo con extensiones como base.
    if (Array.isArray(dynamicBlocksXML) && dynamicBlocksXML.length > 0) {
        try {
            const extCats = dynamicBlocksXML
                .map(ext => ((typeof ext.xml === 'string') ? ext.xml : ''))
                .filter(x => Boolean(x))
                .join('');
            if (extCats && extCats.trim().length > 0) {
                return `<xml id="toolbox-categories">${extCats}</xml>`;
            }
        } catch (e) {
            // continuar a otros fallbacks
        }
    }

    // Caso 2: dynamicBlocksXML es vacío/indefinido; intentamos generarlo desde la VM
    if (!dynamicBlocksXML && window.Scratch?.vm?.runtime) {
        try {
            const vm = window.Scratch.vm;
            const runtime = vm.runtime;
            const stage = runtime.getTargetForStage();
            const target = vm.editingTarget || stage || null;
            if (target) {
                const baseNode = runtime.getBlocksXML(target);
                dynamicBlocksXML = baseNode || '';
            }
        } catch (e) {
            // ignorar, seguimos con vacío
        }
    }

    const baseXML = normalizeXML(dynamicBlocksXML);
    // Nota: ya no usamos baseInner cuando devolvemos el XML base completo,
    // pero mantenemos esta extracción por compatibilidad futura.
    let _baseInner = '';
    if (baseXML) {
        _baseInner = baseXML
            .replace(/^[\s\S]*?<xml[^>]*>/i, '')
            .replace(/<\/xml>\s*$/i, '');
    }

    // Si tenemos XML base (dynamic), añadimos categorías de extensiones
    // previamente registradas (p.ej. VisionKit) y devolvemos el resultado.
    if (baseXML && baseXML.trim().length > 0) {
        try {
            let result = baseXML;
            const categories = (window && window.__VISION_EXT_CATEGORIES) ? window.__VISION_EXT_CATEGORIES : null;
            if (categories && typeof categories === 'object') {
                let extCatsXML = '';
                Object.keys(categories).forEach(id => {
                    const info = categories[id];
                    if (!info || !info.blocks || !info.blocks.length) return;
                    // Evitar duplicados: si ya existe una categoría con el id en el XML base, no añadirla
                    const already = result.indexOf(`category id="${id}"`) !== -1;
                    if (already) return;
                    const name = info.name || id;
                    const color = info.color1 || info.colour || '#45';
                    extCatsXML += _createCategoryXML(id, name, color, info.blocks);
                });
                if (extCatsXML) {
                    // Insertar antes del cierre </xml>
                    result = result.replace(/<\/xml>\s*$/i, `${extCatsXML}</xml>`);
                }
            }
            return result;
        } catch (e) {
            // En caso de fallo, devolver base sin modificar
            return baseXML;
        }
    }

    // Como último recurso: devolver un XML mínimo con una categoría temporal
    // Esto fuerza a Blockly/ScratchBlocks a crear el toolbox y exponer
    // los métodos (p.ej. setSelectedCategoryById), evitando pantallas en blanco
    // mientras el VM prepara el XML dinámico real.
    return (
        '<xml id="toolbox-categories">' +
        '<category id="visionkit-temp" name="VisionKit" ' +
        'colour="#FDBA74" secondaryColour="#FDBA74"></category>' +
        '</xml>'
    );
};

export default makeToolboxXML;
