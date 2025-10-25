/* eslint-disable quote-props */
/* eslint-disable func-style */

/**
 * 🧩 VisionKit Toolbox Generator
 * Reemplaza el toolbox de Scratch por uno solo con las categorías Vision.
 */

console.log('[VisionKit] 🧩 Iniciando makeToolboxXML (solo extensiones Vision)');

/**
 * Genera el XML del toolbox de VisionKit.
 * @returns {string} XML válido con todas las categorías Vision.
 */
const makeToolboxXML = function () {
    const xml = `
        <xml id="toolbox-categories" style="display:none"
            xmlns="https://developers.google.com/blockly/xml">

            <!-- 🔵 Vision Acciones -->
            <category name="Vision Acciones" colour="#3B82F6">
                <block type="visionactions_setImageURL"></block>
                <block type="visionactions_setImageFile"></block>
                <block type="visionactions_show"></block>
                <block type="visionactions_exportProcessedImage"></block>
                <block type="visionactions_exportPythonCode"></block>
            </category>

            <!-- 🟢 Vision Básico -->
            <category name="Vision Básico" colour="#10B981">
                <block type="visionbasic_brightness"></block>
                <block type="visionbasic_contrast"></block>
                <block type="visionbasic_invert"></block>
                <block type="visionbasic_pixelate"></block>
                <block type="visionbasic_circles"></block>
                <block type="visionbasic_rectangles"></block>
            </category>

            <!-- 🟣 Vision Intermedio -->
            <category name="Vision Intermedio" colour="#8B5CF6">
                <block type="visionintermediate_edges"></block>
                <block type="visionintermediate_gray"></block>
                <block type="visionintermediate_gaussian"></block>
                <block type="visionintermediate_rotate"></block>
                <block type="visionintermediate_resize"></block>
            </category>

            <!-- 🔴 Vision Avanzado -->
            <category name="Vision Avanzado" colour="#EF4444">
                <block type="visionadvanced_segment"></block>
                <block type="visionadvanced_detectFeatures"></block>
                <block type="visionadvanced_matchFeatures"></block>
                <block type="visionadvanced_threshold"></block>
                <block type="visionadvanced_histogram"></block>
            </category>

        </xml>
    `;
    console.log('✅ [VisionKit] XML solo con extensiones Vision cargado correctamente.');
    return xml;
};

// 🔁 Registrar globalmente
if (typeof window !== 'undefined') {
    window.makeToolboxXML = makeToolboxXML;
    console.log('[VisionKit] makeToolboxXML (Vision Only) registrado globalmente.');
}

export default makeToolboxXML;
