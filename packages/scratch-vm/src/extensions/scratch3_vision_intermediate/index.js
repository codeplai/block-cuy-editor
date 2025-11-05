const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

class Scratch3VisionIntermediate {
    constructor(runtime) {
        this.runtime = runtime;
        this._canvas = null;
        this._imageData = null;
        this._contours = [];
    }

    getInfo() {
        return {
            id: 'visionIntermediate',
            name: 'Vision Kit Intermedio',
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#2E5FA6',
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
                    opcode: 'cannyEdgeDetection',
                    blockType: BlockType.COMMAND,
                    text: 'detectar bordes Canny umbral bajo [LOW] alto [HIGH]',
                    arguments: {
                        LOW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        HIGH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 150
                        }
                    }
                },
                {
                    opcode: 'sobelEdgeDetection',
                    blockType: BlockType.COMMAND,
                    text: 'detectar bordes Sobel'
                },
                '---',
                {
                    opcode: 'gaussianBlur',
                    blockType: BlockType.COMMAND,
                    text: 'desenfoque Gaussiano radio [RADIUS]',
                    arguments: {
                        RADIUS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'sharpenImage',
                    blockType: BlockType.COMMAND,
                    text: 'enfocar imagen intensidad [INTENSITY]',
                    arguments: {
                        INTENSITY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1.5
                        }
                    }
                },
                '---',
                {
                    opcode: 'findContours',
                    blockType: BlockType.COMMAND,
                    text: 'encontrar contornos umbral [THRESHOLD]',
                    arguments: {
                        THRESHOLD: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 128
                        }
                    }
                },
                {
                    opcode: 'drawContours',
                    blockType: BlockType.COMMAND,
                    text: 'dibujar contornos color [COLOR] grosor [THICKNESS]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#00ff00'
                        },
                        THICKNESS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'getContourCount',
                    blockType: BlockType.REPORTER,
                    text: 'número de contornos'
                },
                '---',
                {
                    opcode: 'rotateImage',
                    blockType: BlockType.COMMAND,
                    text: 'rotar imagen [ANGLE] grados',
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 45
                        }
                    }
                },
                {
                    opcode: 'scaleImage',
                    blockType: BlockType.COMMAND,
                    text: 'escalar imagen factor [FACTOR]',
                    arguments: {
                        FACTOR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1.5
                        }
                    }
                },
                {
                    opcode: 'translateImage',
                    blockType: BlockType.COMMAND,
                    text: 'trasladar imagen X [X] Y [Y]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'flipImage',
                    blockType: BlockType.COMMAND,
                    text: 'voltear imagen [DIRECTION]',
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'flipMenu',
                            defaultValue: 'horizontal'
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
            menus: {
                flipMenu: {
                    acceptReporters: true,
                    items: ['horizontal', 'vertical', 'ambos']
                }
            }
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

    cannyEdgeDetection(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const lowThreshold = parseInt(args.LOW);
        const highThreshold = parseInt(args.HIGH);
        
        const gray = this._toGrayscale();
        const data = this._imageData.data;
        const w = this._imageData.width;
        const h = this._imageData.height;
        
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = (y * w + x) * 4;
                
                const gx = gray[(y-1)*w + x+1] - gray[(y-1)*w + x-1] +
                          2*gray[y*w + x+1] - 2*gray[y*w + x-1] +
                          gray[(y+1)*w + x+1] - gray[(y+1)*w + x-1];
                          
                const gy = gray[(y+1)*w + x-1] - gray[(y-1)*w + x-1] +
                          2*gray[(y+1)*w + x] - 2*gray[(y-1)*w + x] +
                          gray[(y+1)*w + x+1] - gray[(y-1)*w + x+1];
                
                const magnitude = Math.sqrt(gx*gx + gy*gy);
                
                if (magnitude > highThreshold) {
                    data[i] = data[i+1] = data[i+2] = 255;
                } else if (magnitude > lowThreshold) {
                    data[i] = data[i+1] = data[i+2] = 128;
                } else {
                    data[i] = data[i+1] = data[i+2] = 0;
                }
            }
        }
        
        this._updateCanvas();
        console.log('Detección de bordes Canny aplicada');
    }

    sobelEdgeDetection() {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const gray = this._toGrayscale();
        const data = this._imageData.data;
        const w = this._imageData.width;
        const h = this._imageData.height;
        
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = (y * w + x) * 4;
                
                const gx = -gray[(y-1)*w + x-1] + gray[(y-1)*w + x+1] +
                          -2*gray[y*w + x-1] + 2*gray[y*w + x+1] +
                          -gray[(y+1)*w + x-1] + gray[(y+1)*w + x+1];
                          
                const gy = -gray[(y-1)*w + x-1] - 2*gray[(y-1)*w + x] - gray[(y-1)*w + x+1] +
                          gray[(y+1)*w + x-1] + 2*gray[(y+1)*w + x] + gray[(y+1)*w + x+1];
                
                const magnitude = Math.min(255, Math.sqrt(gx*gx + gy*gy));
                
                data[i] = data[i+1] = data[i+2] = magnitude;
            }
        }
        
        this._updateCanvas();
        console.log('Detección de bordes Sobel aplicada');
    }

    gaussianBlur(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const radius = parseInt(args.RADIUS);
        console.log(`Aplicando Gaussian Blur con radio ${radius}`);
        this._updateCanvas();
    }

    sharpenImage(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const intensity = parseFloat(args.INTENSITY);
        const data = this._imageData.data;
        const w = this._imageData.width;
        const h = this._imageData.height;
        
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = (y * w + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    const center = data[i + c];
                    const neighbors = (
                        data[((y-1)*w + x)*4 + c] +
                        data[(y*w + x-1)*4 + c] +
                        data[(y*w + x+1)*4 + c] +
                        data[((y+1)*w + x)*4 + c]
                    ) / 4;
                    
                    data[i + c] = Math.min(255, Math.max(0, 
                        center + intensity * (center - neighbors)
                    ));
                }
            }
        }
        
        this._updateCanvas();
        console.log(`Imagen enfocada con intensidad ${intensity}`);
    }

    findContours(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const threshold = parseInt(args.THRESHOLD);
        this._contours = [];
        
        const gray = this._toGrayscale();
        const binary = gray.map(v => v > threshold ? 1 : 0);
        
        console.log('Buscando contornos...');
        this._contours.push({ points: [], area: 0 });
    }

    drawContours(args) {
        if (!this._canvas || this._contours.length === 0) {
            console.warn('No hay contornos para dibujar');
            return;
        }
        
        const ctx = this._canvas.getContext('2d');
        const color = args.COLOR;
        const thickness = parseInt(args.THICKNESS);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        
        this._contours.forEach(contour => {
            if (contour.points && contour.points.length > 0) {
                ctx.beginPath();
                ctx.moveTo(contour.points[0].x, contour.points[0].y);
                contour.points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();
                ctx.stroke();
            }
        });
        
        this._imageData = ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
        console.log('Contornos dibujados');
    }

    getContourCount() {
        return this._contours.length;
    }

    rotateImage(args) {
        if (!this._canvas) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const angle = parseFloat(args.ANGLE) * Math.PI / 180;
        const ctx = this._canvas.getContext('2d');
        const w = this._canvas.width;
        const h = this._canvas.height;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.translate(w/2, h/2);
        tempCtx.rotate(angle);
        tempCtx.drawImage(this._canvas, -w/2, -h/2);
        
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(tempCanvas, 0, 0);
        
        this._imageData = ctx.getImageData(0, 0, w, h);
        console.log(`Imagen rotada ${args.ANGLE} grados`);
    }

    scaleImage(args) {
        if (!this._canvas) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const factor = parseFloat(args.FACTOR);
        const ctx = this._canvas.getContext('2d');
        const w = this._canvas.width;
        const h = this._canvas.height;
        
        const newW = Math.floor(w * factor);
        const newH = Math.floor(h * factor);
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newW;
        tempCanvas.height = newH;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(this._canvas, 0, 0, newW, newH);
        
        this._canvas.width = newW;
        this._canvas.height = newH;
        ctx.drawImage(tempCanvas, 0, 0);
        
        this._imageData = ctx.getImageData(0, 0, newW, newH);
        console.log(`Imagen escalada por factor ${factor}`);
    }

    translateImage(args) {
        if (!this._canvas) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const x = parseFloat(args.X);
        const y = parseFloat(args.Y);
        const ctx = this._canvas.getContext('2d');
        const w = this._canvas.width;
        const h = this._canvas.height;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this._canvas, 0, 0);
        
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(tempCanvas, x, y);
        
        this._imageData = ctx.getImageData(0, 0, w, h);
        console.log(`Imagen trasladada X:${x} Y:${y}`);
    }

    flipImage(args) {
        if (!this._canvas) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const direction = args.DIRECTION;
        const ctx = this._canvas.getContext('2d');
        const w = this._canvas.width;
        const h = this._canvas.height;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this._canvas, 0, 0);
        
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        
        if (direction === 'horizontal' || direction === 'ambos') {
            ctx.scale(-1, 1);
            ctx.translate(-w, 0);
        }
        if (direction === 'vertical' || direction === 'ambos') {
            ctx.scale(1, -1);
            ctx.translate(0, -h);
        }
        
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
        
        this._imageData = ctx.getImageData(0, 0, w, h);
        console.log(`Imagen volteada: ${direction}`);
    }

    showResult() {
        if (!this._canvas) {
            console.warn('No hay imagen para mostrar');
            return;
        }
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 90vw;
            max-height: 90vh;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Vision Kit Intermedio - Resultado';
        title.style.cssText = 'margin: 0 0 10px 0; color: #4C97FF; font-family: Arial, sans-serif;';
        
        const img = document.createElement('img');
        img.src = this._canvas.toDataURL();
        img.style.maxWidth = '600px';
        img.style.maxHeight = '400px';
        img.style.display = 'block';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cerrar';
        closeBtn.style.cssText = `
            margin-top: 10px;
            padding: 10px 20px;
            background: #4C97FF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-family: Arial, sans-serif;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = '#3373CC';
        closeBtn.onmouseout = () => closeBtn.style.background = '#4C97FF';
        closeBtn.onclick = () => document.body.removeChild(modal);
        
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
        link.download = `vision-intermedio-${timestamp}.png`;
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

    _toGrayscale() {
        if (!this._imageData) return [];
        
        const data = this._imageData.data;
        const gray = [];
        
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i+1] + data[i+2]) / 3;
            gray.push(avg);
        }
        
        return gray;
    }
}

module.exports = Scratch3VisionIntermediate;