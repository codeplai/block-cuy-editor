const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

class Scratch3VisionBasic {
    constructor(runtime) {
        this.runtime = runtime;
        this._canvas = null;
        this._imageData = null;
    }

    getInfo() {
        return {
            id: 'visionBasic',
            name: 'Vision Kit Basico',
            color1: '#FF6680',
            color2: '#FF4D6A',
            color3: '#FF3355',
            blocks: [
                {
                    opcode: 'loadImageFromURL',
                    blockType: BlockType.COMMAND,
                    text: 'cargar imagen desde URL [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://picsum.photos/300/200'
                        }
                    }
                },
                {
                    opcode: 'loadImageFromFile',
                    blockType: BlockType.COMMAND,
                    text: 'cargar imagen desde archivo local'
                },
                '---',
                {
                    opcode: 'adjustBrightness',
                    blockType: BlockType.COMMAND,
                    text: 'brillo [VALUE]',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 30
                        }
                    }
                },
                {
                    opcode: 'adjustContrast',
                    blockType: BlockType.COMMAND,
                    text: 'contraste [VALUE]',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1.2
                        }
                    }
                },
                {
                    opcode: 'adjustSaturation',
                    blockType: BlockType.COMMAND,
                    text: 'saturacion [VALUE]',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1.3
                        }
                    }
                },
                '---',
                {
                    opcode: 'invertColors',
                    blockType: BlockType.COMMAND,
                    text: 'invertir colores'
                },
                {
                    opcode: 'pixelateEffect',
                    blockType: BlockType.COMMAND,
                    text: 'pixelar factor [FACTOR]',
                    arguments: {
                        FACTOR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 8
                        }
                    }
                },
                '---',
                {
                    opcode: 'showResult',
                    blockType: BlockType.COMMAND,
                    text: 'mostrar resultado'
                },
                {
                    opcode: 'exportImage',
                    blockType: BlockType.COMMAND,
                    text: 'exportar imagen procesada'
                }
            ],
            menus: {}
        };
    }

    loadImageFromURL(args) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                this._createCanvasFromImage(img);
                console.log('Imagen cargada desde URL');
                resolve();
            };
            img.onerror = () => {
                console.error('Error al cargar imagen desde URL');
                resolve();
            };
            img.src = args.URL;
        });
    }

    loadImageFromFile() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            this._createCanvasFromImage(img);
                            console.log('Imagen cargada desde archivo');
                            resolve();
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    resolve();
                }
            };
            input.click();
        });
    }

    adjustBrightness(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const brightness = parseFloat(args.VALUE);
        const data = this._imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + brightness));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
        }
        
        this._updateCanvas();
        console.log('Brillo ajustado: ' + brightness);
    }

    adjustContrast(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const contrast = parseFloat(args.VALUE);
        const data = this._imageData.data;
        const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
        
        this._updateCanvas();
        console.log('Contraste ajustado: ' + contrast);
    }

    adjustSaturation(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const saturation = parseFloat(args.VALUE);
        const data = this._imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            
            data[i] = Math.min(255, Math.max(0, gray + saturation * (r - gray)));
            data[i + 1] = Math.min(255, Math.max(0, gray + saturation * (g - gray)));
            data[i + 2] = Math.min(255, Math.max(0, gray + saturation * (b - gray)));
        }
        
        this._updateCanvas();
        console.log('Saturacion ajustada: ' + saturation);
    }

    invertColors() {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const data = this._imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        
        this._updateCanvas();
        console.log('Colores invertidos');
    }

    pixelateEffect(args) {
        if (!this._canvas) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const factor = parseInt(args.FACTOR);
        const ctx = this._canvas.getContext('2d');
        const w = this._canvas.width;
        const h = this._canvas.height;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w / factor;
        tempCanvas.height = h / factor;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(this._canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, w, h);
        
        this._imageData = ctx.getImageData(0, 0, w, h);
        console.log('Efecto pixelar aplicado: factor ' + factor);
    }

    showResult() {
        if (!this._canvas) {
            console.warn('No hay imagen para mostrar');
            return;
        }
        
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; max-width: 90vw; max-height: 90vh;';
        
        const title = document.createElement('h3');
        title.textContent = 'Vision Kit Basico - Resultado';
        title.style.cssText = 'margin: 0 0 10px 0; color: #FF6680; font-family: Arial, sans-serif;';
        
        const img = document.createElement('img');
        img.src = this._canvas.toDataURL();
        img.style.maxWidth = '600px';
        img.style.maxHeight = '400px';
        img.style.display = 'block';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cerrar';
        closeBtn.style.cssText = 'margin-top: 10px; padding: 10px 20px; background: #FF6680; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-family: Arial, sans-serif;';
        closeBtn.onmouseover = function() { closeBtn.style.background = '#FF4D6A'; };
        closeBtn.onmouseout = function() { closeBtn.style.background = '#FF6680'; };
        closeBtn.onclick = function() { document.body.removeChild(modal); };
        
        modal.appendChild(title);
        modal.appendChild(img);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
        
        console.log('Resultado mostrado');
    }

    exportImage() {
        if (!this._canvas) {
            console.warn('No hay imagen para exportar');
            return;
        }
        
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = 'vision-basico-' + timestamp + '.png';
        link.href = this._canvas.toDataURL();
        link.click();
        
        console.log('Imagen exportada');
    }

    _createCanvasFromImage(img) {
        if (!this._canvas) {
            this._canvas = document.createElement('canvas');
        }
        
        this._canvas.width = img.width;
        this._canvas.height = img.height;
        
        const ctx = this._canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        this._imageData = ctx.getImageData(0, 0, img.width, img.height);
    }

    _updateCanvas() {
        if (!this._canvas || !this._imageData) return;
        
        const ctx = this._canvas.getContext('2d');
        ctx.putImageData(this._imageData, 0, 0);
    }
}

module.exports = Scratch3VisionBasic;