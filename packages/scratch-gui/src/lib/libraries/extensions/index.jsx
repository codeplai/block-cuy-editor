<<<<<<< HEAD
import React from 'react';
import {FormattedMessage} from 'react-intl';
import visionIconURL from './vision/vision.png';

export default [
    {
        name: 'Vision Acciones',
        extensionId: 'visionactions',
        iconURL: visionIconURL,
        insetIconURL: visionIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Carga, visualización y exportación de imágenes."
                id="gui.extension.visionactions.description"
            />
        ),
        featured: true,
        collaborator: 'OpenCV + Scratch EDU',
        tags: ['visión', 'imagen', 'acciones']
    },
    {
        name: 'Vision Básico',
        extensionId: 'visionbasic',
        iconURL: visionIconURL,
        insetIconURL: visionIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Filtros de color y operaciones simples."
                id="gui.extension.visionbasic.description"
            />
        ),
        featured: true,
        collaborator: 'OpenCV + Scratch EDU',
        tags: ['visión', 'imagen', 'básico']
    },
    {
        name: 'Vision Intermedio',
        extensionId: 'visionintermediate',
        iconURL: visionIconURL,
        insetIconURL: visionIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Detección de bordes y transformaciones geométricas."
                id="gui.extension.visionintermediate.description"
            />
        ),
        featured: true,
        collaborator: 'OpenCV + Scratch EDU',
        tags: ['visión', 'imagen', 'intermedio']
    },
    {
        name: 'Vision Avanzado',
        extensionId: 'visionadvanced',
        iconURL: visionIconURL,
        insetIconURL: visionIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Segmentación y extracción de características avanzadas."
                id="gui.extension.visionadvanced.description"
            />
        ),
        featured: true,
        collaborator: 'OpenCV + Scratch EDU',
        tags: ['visión', 'imagen', 'avanzado']
    }
=======
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
>>>>>>> nivel_01_parte_01
];
