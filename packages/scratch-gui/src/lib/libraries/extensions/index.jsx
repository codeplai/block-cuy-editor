import React from 'react';
import {FormattedMessage} from 'react-intl';

// Iconos
import visionBasicIconURL from './vision_basic/vision-basic.png';
import visionBasicInsetIconURL from './vision_basic/vision-basic-small.svg';
import visionIntermediateIconURL from './vision_intermediate/vision-intermediate.png';
import visionIntermediateInsetIconURL from './vision_intermediate/vision-intermediate-small.svg';
import visionAdvancedIconURL from './vision_advanced/vision-advanced.png';
import visionAdvancedInsetIconURL from './vision_advanced/vision-advanced-small.svg';
import visionIconURL from './vision/vision.png';

export default [
    {
        name: 'Visión Acciones',
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
        name: 'Visión Kit Básico',
        extensionId: 'visionBasic',
        iconURL: visionBasicIconURL,
        insetIconURL: visionBasicInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Aprende procesamiento de imágenes con filtros y efectos básicos."
                id="gui.extension.visionbasic.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: false,
        bluetoothRequired: false,
        collaborator: 'OpenCV + Scratch EDU',
        tags: ['visión', 'básico', 'imagen']
    },
    {
        name: 'Visión Kit Intermedio',
        extensionId: 'visionIntermediate',
        iconURL: visionIntermediateIconURL,
        insetIconURL: visionIntermediateInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Detecta bordes, contornos y aplica transformaciones geométricas."
                id="gui.extension.visionintermediate.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: false,
        bluetoothRequired: false,
        collaborator: 'OpenCV + Scratch EDU',
        tags: ['visión', 'intermedio', 'bordes']
    },
    {
        name: 'Visión Kit Avanzado',
        extensionId: 'visionAdvanced',
        iconURL: visionAdvancedIconURL,
        insetIconURL: visionAdvancedInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Segmentación, extracción de características y machine learning."
                id="gui.extension.visionadvanced.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: false,
        bluetoothRequired: false,
        collaborator: 'OpenCV + Scratch EDU',
        tags: ['visión', 'avanzado', 'ml']
    }
];
