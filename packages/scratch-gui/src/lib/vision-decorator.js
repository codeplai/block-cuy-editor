/* eslint-disable max-len */
/* eslint-disable func-style */
/* eslint-disable space-before-function-paren */
/* eslint-disable object-curly-spacing */
/* eslint-disable quote-props */
/* eslint-disable no-console */

/**
 * @file vision-decorator.js
 * Aplica estilos visuales a las categorías VisionKit y fuerza el repintado del toolbox
 * una vez que los bloques Vision estén efectivamente registrados en ScratchBlocks.
 */

console.log('%c[VisionKit] 🎨 Decorador VisionKit inicializado...', 'color:#8b5cf6;font-weight:bold;');

/**
 * Aplica los estilos visuales a las categorías Vision.
 * @param {object} sb - ScratchBlocks o Blockly activo.
 */
function applyDecorations(sb) {
    if (!sb) {
        console.warn('⚠️ [VisionKit] No se encontró instancia de ScratchBlocks.');
        return;
    }

    const blockKeys = Object.keys(sb.Blocks || {}).filter(k => k.startsWith('vision'));
    if (blockKeys.length === 0) {
        console.warn('⚠️ [VisionKit] No hay bloques Vision registrados aún.');
        return;
    }

    console.log(`✅ [VisionKit] Bloques Vision detectados (${blockKeys.length} encontrados).`);

    // 🎨 Estilos visuales
    const styleId = 'visionkit-decorator-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .blocklyTreeRow[aria-label*="Vision"] {
                border-left: 6px solid #10B981 !important;
                background: rgba(16,185,129,0.08) !important;
            }
            .blocklyTreeRow[aria-label*="Vision"]:hover {
                background: rgba(16,185,129,0.15) !important;
            }
        `;
        document.head.appendChild(style);
    }

    console.log('✅ [VisionKit] Estilos aplicados correctamente.');

    // 🔁 Forzar repintado del toolbox (solo si está inicializado completamente)
    const ws = sb.getMainWorkspace ? sb.getMainWorkspace() : sb.mainWorkspace;
    if (ws && ws.toolbox_ && typeof ws.toolbox_.setSelectedCategoryById === 'function') {
        try {
            // Llamadas de refresco si existen (compatibilidad con distintas versiones)
            if (typeof ws.toolbox_.refreshSelection === 'function') {
                ws.toolbox_.refreshSelection();
            }
            if (typeof ws.toolbox_.refreshSelection_ === 'function') {
                ws.toolbox_.refreshSelection_();
            }

            // Obtener un id de categoría seguro
            let selectedId = 'motion';
            if (ws.toolbox_.selectedItem_ && ws.toolbox_.selectedItem_.id_) {
                selectedId = ws.toolbox_.selectedItem_.id_;
            }

            ws.toolbox_.setSelectedCategoryById(selectedId);
            console.log('%c🎨 [VisionKit] Toolbox repintado correctamente.', 'color:#22c55e;font-weight:bold;');
        } catch (err) {
            console.warn('⚠️ [VisionKit] Error al repintar toolbox:', err && err.message ? err.message : err);
        }
    } else {
        console.warn('⚠️ [VisionKit] Toolbox aún no está listo, se omitió repintado.');
    }
}

/**
 * Inicializa el decorador VisionKit y espera hasta que los bloques Vision estén disponibles.
 * @param {object} [vm] - VirtualMachine activo.
 */
function initVisionDecorator() {
    let elapsed = 0;
    const interval = 2000;
    const maxWait = 40000; // 40 segundos de tolerancia

    const sb = window.ScratchBlocks || window.Blockly;
    console.log('⏳ [VisionKit] Esperando registro de bloques Vision...');

    const watcher = setInterval(() => {
        elapsed += interval;
        const blockCount = Object.keys(sb?.Blocks || {}).filter(k => k.startsWith('vision')).length;

        if (blockCount > 0) {
            clearInterval(watcher);
            applyDecorations(sb);
        } else if (elapsed >= maxWait) {
            clearInterval(watcher);
            console.warn('⚠️ [VisionKit] Decorador cancelado: no se detectaron bloques Vision tras 40s.');
        }
    }, interval);
}

// ✅ Exportar al global window para ejecución manual
window.initVisionDecorator = initVisionDecorator;

export default initVisionDecorator;
