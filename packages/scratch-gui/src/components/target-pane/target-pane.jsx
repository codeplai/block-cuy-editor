import PropTypes from 'prop-types';
import React from 'react';

import VM from '@scratch/scratch-vm';
import {legacyConfig} from '../../legacy-config';
import SpriteLibrary from '../../containers/sprite-library.jsx';
import SpriteSelectorComponent from '../sprite-selector/sprite-selector.jsx';
import StageSelector from '../../containers/stage-selector.jsx';
import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants';

import styles from './target-pane.css';

/*
 * Pane that contains the sprite selector, sprite info, stage selector,
 * and the new sprite, costume and backdrop buttons
 * @param {object} props Props for the component
 * @returns {React.Component} rendered component
 */
const TargetPane = ({
    editingTarget,
    fileInputRef,
    hoveredTarget,
    spriteLibraryVisible,
    onActivateBlocksTab,
    onDeleteSprite,
    onDrop,
    onDuplicateSprite,
    onExportSprite,
    onFileUploadClick,
    onNewBackdropClick,
    onNewSpriteClick,
    onPaintSpriteClick,
    onRequestCloseSpriteLibrary,
    onSelectSprite,
    onSpriteUpload,
    onSurpriseSpriteClick,
    raiseSprites,
    stage,
    stageSize,
    sprites,
    vm,
    ...componentProps
}) => (
    <div
        className={styles.targetPane}
        {...componentProps}
    >
        {/* ❌ ELIMINADO: SpriteSelectorComponent (lista de sprites con el gato) */}
        {/* <SpriteSelectorComponent
            editingTarget={editingTarget}
            hoveredTarget={hoveredTarget}
            raised={raiseSprites}
            selectedId={editingTarget}
            spriteFileInput={fileInputRef}
            sprites={sprites}
            stageSize={stageSize}
            onDeleteSprite={onDeleteSprite}
            onDrop={onDrop}
            onDuplicateSprite={onDuplicateSprite}
            onExportSprite={onExportSprite}
            onFileUploadClick={onFileUploadClick}
            onNewSpriteClick={onNewSpriteClick}
            onPaintSpriteClick={onPaintSpriteClick}
            onSelectSprite={onSelectSprite}
            onSpriteUpload={onSpriteUpload}
            onSurpriseSpriteClick={onSurpriseSpriteClick}
        /> */}
        
        {/* ❌ ELIMINADO: StageSelector (Escenario y Fondos) */}
        {/* <div className={styles.stageSelectorWrapper}>
            {stage.id && <StageSelector
                asset={
                    stage.costume &&
                    stage.costume.asset
                }
                backdropCount={stage.costumeCount}
                id={stage.id}
                selected={stage.id === editingTarget}
                onSelect={onSelectSprite}
                onNewBackdropClick={onNewBackdropClick}
            />}
            <div>
                {spriteLibraryVisible ? (
                    <SpriteLibrary
                        vm={vm}
                        onActivateBlocksTab={onActivateBlocksTab}
                        onRequestClose={onRequestCloseSpriteLibrary}
                    />
                ) : null}
            </div>
        </div> */}
        
        {/* Mantener funcionalidad oculta para no romper el código */}
        <div style={{display: 'none'}}>
            <SpriteSelectorComponent
                editingTarget={editingTarget}
                hoveredTarget={hoveredTarget}
                raised={raiseSprites}
                selectedId={editingTarget}
                spriteFileInput={fileInputRef}
                sprites={sprites}
                stageSize={stageSize}
                onDeleteSprite={onDeleteSprite}
                onDrop={onDrop}
                onDuplicateSprite={onDuplicateSprite}
                onExportSprite={onExportSprite}
                onFileUploadClick={onFileUploadClick}
                onNewSpriteClick={onNewSpriteClick}
                onPaintSpriteClick={onPaintSpriteClick}
                onSelectSprite={onSelectSprite}
                onSpriteUpload={onSpriteUpload}
                onSurpriseSpriteClick={onSurpriseSpriteClick}
            />
            <div className={styles.stageSelectorWrapper}>
                {stage.id && <StageSelector
                    asset={
                        stage.costume &&
                        stage.costume.asset
                    }
                    backdropCount={stage.costumeCount}
                    id={stage.id}
                    selected={stage.id === editingTarget}
                    onSelect={onSelectSprite}
                    onNewBackdropClick={onNewBackdropClick}
                />}
                <div>
                    {spriteLibraryVisible ? (
                        <SpriteLibrary
                            vm={vm}
                            onActivateBlocksTab={onActivateBlocksTab}
                            onRequestClose={onRequestCloseSpriteLibrary}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    </div>
);

const spriteShape = PropTypes.shape({
    costume: PropTypes.shape({
        url: PropTypes.string,
        name: PropTypes.string.isRequired,
        asset: PropTypes.instanceOf(legacyConfig.storage.scratchStorage.Asset),
        bitmapResolution: PropTypes.number,
        rotationCenterX: PropTypes.number,
        rotationCenterY: PropTypes.number
    }),
    costumeCount: PropTypes.number,
    direction: PropTypes.number,
    id: PropTypes.string,
    name: PropTypes.string,
    order: PropTypes.number,
    size: PropTypes.number,
    visibility: PropTypes.bool,
    x: PropTypes.number,
    y: PropTypes.number
});

TargetPane.propTypes = {
    editingTarget: PropTypes.string,
    extensionLibraryVisible: PropTypes.bool,
    fileInputRef: PropTypes.func,
    hoveredTarget: PropTypes.shape({
        hoveredSprite: PropTypes.string,
        receivedBlocks: PropTypes.bool
    }),
    onActivateBlocksTab: PropTypes.func.isRequired,
    onDeleteSprite: PropTypes.func,
    onDrop: PropTypes.func,
    onDuplicateSprite: PropTypes.func,
    onExportSprite: PropTypes.func,
    onFileUploadClick: PropTypes.func,
    onNewBackdropClick: PropTypes.func,
    onNewSpriteClick: PropTypes.func,
    onPaintSpriteClick: PropTypes.func,
    onRequestCloseExtensionLibrary: PropTypes.func,
    onRequestCloseSpriteLibrary: PropTypes.func,
    onSelectSprite: PropTypes.func,
    onSpriteUpload: PropTypes.func,
    onSurpriseSpriteClick: PropTypes.func,
    raiseSprites: PropTypes.bool,
    spriteLibraryVisible: PropTypes.bool,
    sprites: PropTypes.objectOf(spriteShape),
    stage: spriteShape,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    vm: PropTypes.instanceOf(VM)
};

export default TargetPane;