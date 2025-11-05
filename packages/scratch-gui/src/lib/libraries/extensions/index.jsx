import visionBasicIconURL from './vision_basic/vision-basic.png';
import visionBasicInsetIconURL from './vision_basic/vision-basic-small.svg';
import visionIntermediateIconURL from './vision_intermediate/vision-intermediate.png';
import visionIntermediateInsetIconURL from './vision_intermediate/vision-intermediate-small.svg';
import visionAdvancedIconURL from './vision_advanced/vision-advanced.png';
import visionAdvancedInsetIconURL from './vision_advanced/vision-advanced-small.svg';

export default [
{
    name: 'Vision Kit Básico',
    extensionId: 'visionBasic',
    iconURL: visionBasicIconURL,
    insetIconURL: visionBasicInsetIconURL,
    description: 'Aprende procesamiento de imágenes con filtros y efectos básicos.',
    featured: true,
    disabled: false,
    internetConnectionRequired: false,
    bluetoothRequired: false,
    tags: ['vision', 'basico', 'imagenes']
},
{
    name: 'Vision Kit Intermedio',
    extensionId: 'visionIntermediate',
    iconURL: visionIntermediateIconURL,
    insetIconURL: visionIntermediateInsetIconURL,
    description: 'Detecta bordes, contornos y aplica transformaciones avanzadas.',
    featured: true,
    disabled: false,
    internetConnectionRequired: false,
    bluetoothRequired: false,
    tags: ['vision', 'intermedio', 'bordes']
},
{
    name: 'Vision Kit Avanzado',
    extensionId: 'visionAdvanced',
    iconURL: visionAdvancedIconURL,
    insetIconURL: visionAdvancedInsetIconURL,
    description: 'Características avanzadas, segmentación y machine learning.',
    featured: true,
    disabled: false,
    internetConnectionRequired: false,
    bluetoothRequired: false,
    tags: ['vision', 'avanzado', 'ml']
}
];
