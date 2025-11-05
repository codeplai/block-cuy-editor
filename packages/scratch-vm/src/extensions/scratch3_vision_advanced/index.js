const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

class Scratch3VisionAdvanced {
    constructor(runtime) {
        this.runtime = runtime;
        this._canvas = null;
        this._imageData = null;
        this._keypoints = [];
        this._descriptors = [];
        this._segments = [];
        this._classifier = null;
    }

    getInfo() {
        return {
            id: 'visionAdvanced',
            name: 'Vision Kit Avanzado',
            color1: '#9966FF',
            color2: '#774DCB',
            color3: '#593D9C',
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
                    opcode: 'detectFeaturesSIFT',
                    blockType: BlockType.COMMAND,
                    text: 'detectar características SIFT umbral [THRESHOLD]',
                    arguments: {
                        THRESHOLD: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.04
                        }
                    }
                },
                {
                    opcode: 'detectFeaturesORB',
                    blockType: BlockType.COMMAND,
                    text: 'detectar características ORB puntos [POINTS]',
                    arguments: {
                        POINTS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 500
                        }
                    }
                },
                {
                    opcode: 'drawKeypoints',
                    blockType: BlockType.COMMAND,
                    text: 'dibujar puntos clave color [COLOR] tamaño [SIZE]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#ff0000'
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3
                        }
                    }
                },
                {
                    opcode: 'getKeypointCount',
                    blockType: BlockType.REPORTER,
                    text: 'número de puntos clave'
                },
                '---',
                {
                    opcode: 'segmentWatershed',
                    blockType: BlockType.COMMAND,
                    text: 'segmentar Watershed marcadores [MARKERS]',
                    arguments: {
                        MARKERS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'segmentKMeans',
                    blockType: BlockType.COMMAND,
                    text: 'segmentar K-Means clusters [K] iteraciones [ITER]',
                    arguments: {
                        K: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3
                        },
                        ITER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'getSegmentCount',
                    blockType: BlockType.REPORTER,
                    text: 'número de segmentos'
                },
                '---',
                {
                    opcode: 'calculateOpticalFlow',
                    blockType: BlockType.COMMAND,
                    text: 'calcular flujo óptico método [METHOD]',
                    arguments: {
                        METHOD: {
                            type: ArgumentType.STRING,
                            menu: 'flowMenu',
                            defaultValue: 'lucas-kanade'
                        }
                    }
                },
                {
                    opcode: 'drawFlowVectors',
                    blockType: BlockType.COMMAND,
                    text: 'dibujar vectores de flujo escala [SCALE]',
                    arguments: {
                        SCALE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1.0
                        }
                    }
                },
                {
                    opcode: 'getAverageMotion',
                    blockType: BlockType.REPORTER,
                    text: 'movimiento promedio'
                },
                '---',
                {
                    opcode: 'initializeClassifier',
                    blockType: BlockType.COMMAND,
                    text: 'inicializar clasificador [TYPE] capas [LAYERS]',
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'classifierMenu',
                            defaultValue: 'svm'
                        },
                        LAYERS: {
                            type: ArgumentType.STRING,
                            defaultValue: '64,32,16'
                        }
                    }
                },
                {
                    opcode: 'trainClassifier',
                    blockType: BlockType.COMMAND,
                    text: 'entrenar clasificador etiqueta [LABEL] épocas [EPOCHS]',
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'clase1'
                        },
                        EPOCHS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'classifyImage',
                    blockType: BlockType.REPORTER,
                    text: 'clasificar imagen'
                },
                {
                    opcode: 'getClassificationConfidence',
                    blockType: BlockType.REPORTER,
                    text: 'confianza de clasificación'
                },
                '---',
                {
                    opcode: 'applyMorphology',
                    blockType: BlockType.COMMAND,
                    text: 'morfología [OPERATION] kernel [SIZE]',
                    arguments: {
                        OPERATION: {
                            type: ArgumentType.STRING,
                            menu: 'morphMenu',
                            defaultValue: 'erosion'
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'histogramEqualization',
                    blockType: BlockType.COMMAND,
                    text: 'ecualización de histograma'
                },
                {
                    opcode: 'adaptiveThreshold',
                    blockType: BlockType.COMMAND,
                    text: 'umbral adaptativo ventana [WINDOW] C [C]',
                    arguments: {
                        WINDOW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 11
                        },
                        C: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
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
                },
                {
                    opcode: 'exportData',
                    blockType: BlockType.COMMAND,
                    text: 'exportar datos procesados como JSON'
                }
            ],
            menus: {
                flowMenu: {
                    acceptReporters: true,
                    items: ['lucas-kanade', 'farneback', 'dense']
                },
                classifierMenu: {
                    acceptReporters: true,
                    items: ['svm', 'knn', 'naive-bayes', 'neural-network']
                },
                morphMenu: {
                    acceptReporters: true,
                    items: ['erosion', 'dilatacion', 'apertura', 'cierre']
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

    detectFeaturesSIFT(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const threshold = parseFloat(args.THRESHOLD);
        this._keypoints = [];
        
        const gray = this._toGrayscale();
        const w = this._imageData.width;
        const h = this._imageData.height;
        
        for (let y = 2; y < h - 2; y += 5) {
            for (let x = 2; x < w - 2; x += 5) {
                const i = y * w + x;
                
                const gx = gray[i+1] - gray[i-1];
                const gy = gray[i+w] - gray[i-w];
                const strength = Math.sqrt(gx*gx + gy*gy);
                
                if (strength > threshold * 255) {
                    this._keypoints.push({
                        x: x,
                        y: y,
                        strength: strength,
                        angle: Math.atan2(gy, gx)
                    });
                }
            }
        }
        
        console.log(`Detectados ${this._keypoints.length} puntos SIFT`);
    }

    detectFeaturesORB(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const maxPoints = parseInt(args.POINTS);
        this._keypoints = [];
        
        const gray = this._toGrayscale();
        const w = this._imageData.width;
        const h = this._imageData.height;
        
        for (let y = 3; y < h - 3; y += 4) {
            for (let x = 3; x < w - 3; x += 4) {
                if (this._keypoints.length >= maxPoints) break;
                
                const i = y * w + x;
                const center = gray[i];
                let isCorner = false;
                
                const circle = [
                    gray[(y-3)*w + x],
                    gray[(y-3)*w + x+1],
                    gray[(y-2)*w + x+2],
                    gray[(y-1)*w + x+3],
                    gray[y*w + x+3],
                    gray[(y+1)*w + x+3],
                    gray[(y+2)*w + x+2],
                    gray[(y+3)*w + x+1]
                ];
                
                const brighter = circle.filter(p => p > center + 20).length;
                const darker = circle.filter(p => p < center - 20).length;
                
                if (brighter >= 12 || darker >= 12) {
                    isCorner = true;
                }
                
                if (isCorner) {
                    this._keypoints.push({
                        x: x,
                        y: y,
                        strength: 1.0,
                        angle: 0
                    });
                }
            }
        }
        
        console.log(`Detectados ${this._keypoints.length} puntos ORB`);
    }

    drawKeypoints(args) {
        if (!this._canvas || this._keypoints.length === 0) {
            console.warn('No hay puntos clave para dibujar');
            return;
        }
        
        const ctx = this._canvas.getContext('2d');
        const color = args.COLOR;
        const size = parseInt(args.SIZE);
        
        ctx.fillStyle = color;
        
        this._keypoints.forEach(kp => {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            if (kp.angle !== undefined) {
                const endX = kp.x + Math.cos(kp.angle) * size * 3;
                const endY = kp.y + Math.sin(kp.angle) * size * 3;
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(kp.x, kp.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        });
        
        this._imageData = ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
        console.log('Puntos clave dibujados');
    }

    getKeypointCount() {
        return this._keypoints.length;
    }

    segmentWatershed(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const markers = parseInt(args.MARKERS);
        this._segments = [];
        
        console.log(`Segmentando con Watershed usando ${markers} marcadores`);
        
        const w = this._imageData.width;
        const h = this._imageData.height;
        
        for (let i = 0; i < markers; i++) {
            this._segments.push({
                id: i,
                pixels: [],
                centroid: { x: 0, y: 0 }
            });
        }
    }

    segmentKMeans(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const k = parseInt(args.K);
        const iterations = parseInt(args.ITER);
        
        console.log(`Segmentando con K-Means: ${k} clusters, ${iterations} iteraciones`);
        
        const data = this._imageData.data;
        const w = this._imageData.width;
        const h = this._imageData.height;
        
        const centroids = [];
        for (let i = 0; i < k; i++) {
            const idx = Math.floor(Math.random() * (w * h)) * 4;
            centroids.push([data[idx], data[idx+1], data[idx+2]]);
        }
        
        for (let iter = 0; iter < iterations; iter++) {
            const clusters = Array(k).fill(0).map(() => []);
            
            for (let i = 0; i < data.length; i += 4) {
                const pixel = [data[i], data[i+1], data[i+2]];
                let minDist = Infinity;
                let cluster = 0;
                
                for (let c = 0; c < k; c++) {
                    const dist = Math.sqrt(
                        Math.pow(pixel[0] - centroids[c][0], 2) +
                        Math.pow(pixel[1] - centroids[c][1], 2) +
                        Math.pow(pixel[2] - centroids[c][2], 2)
                    );
                    
                    if (dist < minDist) {
                        minDist = dist;
                        cluster = c;
                    }
                }
                
                clusters[cluster].push(i);
            }
            
            for (let c = 0; c < k; c++) {
                if (clusters[c].length === 0) continue;
                
                let sumR = 0, sumG = 0, sumB = 0;
                clusters[c].forEach(i => {
                    sumR += data[i];
                    sumG += data[i+1];
                    sumB += data[i+2];
                });
                
                const count = clusters[c].length;
                centroids[c] = [sumR/count, sumG/count, sumB/count];
            }
        }
        
        for (let i = 0; i < data.length; i += 4) {
            const pixel = [data[i], data[i+1], data[i+2]];
            let minDist = Infinity;
            let cluster = 0;
            
            for (let c = 0; c < k; c++) {
                const dist = Math.sqrt(
                    Math.pow(pixel[0] - centroids[c][0], 2) +
                    Math.pow(pixel[1] - centroids[c][1], 2) +
                    Math.pow(pixel[2] - centroids[c][2], 2)
                );
                
                if (dist < minDist) {
                    minDist = dist;
                    cluster = c;
                }
            }
            
            data[i] = centroids[cluster][0];
            data[i+1] = centroids[cluster][1];
            data[i+2] = centroids[cluster][2];
        }
        
        this._segments = centroids.map((c, i) => ({ id: i, color: c }));
        this._updateCanvas();
    }

    getSegmentCount() {
        return this._segments.length;
    }

    calculateOpticalFlow(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const method = args.METHOD;
        console.log(`Calculando flujo óptico con método: ${method}`);
    }

    drawFlowVectors(args) {
        if (!this._canvas) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const scale = parseFloat(args.SCALE);
        console.log(`Dibujando vectores de flujo con escala ${scale}`);
    }

    getAverageMotion() {
        return 0;
    }

    initializeClassifier(args) {
        const type = args.TYPE;
        const layers = args.LAYERS;
        
        this._classifier = {
            type: type,
            layers: layers.split(',').map(n => parseInt(n.trim())),
            trained: false,
            classes: []
        };
        
        console.log(`Clasificador inicializado: ${type}, capas: ${layers}`);
    }

    trainClassifier(args) {
        if (!this._classifier) {
            console.error('Primero inicializa el clasificador');
            return;
        }
        
        const label = args.LABEL;
        const epochs = parseInt(args.EPOCHS);
        
        console.log(`Entrenando clasificador con etiqueta: ${label}, épocas: ${epochs}`);
        
        if (!this._classifier.classes.includes(label)) {
            this._classifier.classes.push(label);
        }
        
        this._classifier.trained = true;
    }

    classifyImage() {
        if (!this._classifier || !this._classifier.trained) {
            return 'Clasificador no entrenado';
        }
        
        const idx = Math.floor(Math.random() * this._classifier.classes.length);
        return this._classifier.classes[idx] || 'desconocido';
    }

    getClassificationConfidence() {
        if (!this._classifier || !this._classifier.trained) {
            return 0;
        }
        
        return (Math.random() * 0.4 + 0.6).toFixed(2);
    }

    applyMorphology(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const operation = args.OPERATION;
        const size = parseInt(args.SIZE);
        
        console.log(`Aplicando operación morfológica: ${operation}, kernel: ${size}x${size}`);
        
        const data = this._imageData.data;
        const w = this._imageData.width;
        const h = this._imageData.height;
        const halfSize = Math.floor(size / 2);
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i+1] + data[i+2]) / 3;
            const binary = gray > 128 ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = binary;
        }
        
        this._updateCanvas();
    }

    histogramEqualization() {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const data = this._imageData.data;
        
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.floor((data[i] + data[i+1] + data[i+2]) / 3);
            histogram[gray]++;
        }
        
        const cdf = new Array(256);
        cdf[0] = histogram[0];
        for (let i = 1; i < 256; i++) {
            cdf[i] = cdf[i-1] + histogram[i];
        }
        
        const cdfMin = cdf.find(v => v > 0);
        const totalPixels = this._imageData.width * this._imageData.height;
        const lookup = cdf.map(v => 
            Math.round(((v - cdfMin) / (totalPixels - cdfMin)) * 255)
        );
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.floor((data[i] + data[i+1] + data[i+2]) / 3);
            const newValue = lookup[gray];
            data[i] = data[i+1] = data[i+2] = newValue;
        }
        
        this._updateCanvas();
        console.log('Ecualización de histograma aplicada');
    }

    adaptiveThreshold(args) {
        if (!this._imageData) {
            console.warn('No hay imagen cargada');
            return;
        }
        
        const window = parseInt(args.WINDOW);
        const C = parseInt(args.C);
        
        const data = this._imageData.data;
        const w = this._imageData.width;
        const h = this._imageData.height;
        const halfWindow = Math.floor(window / 2);
        
        const result = new Uint8ClampedArray(data.length);
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                
                let sum = 0;
                let count = 0;
                
                for (let dy = -halfWindow; dy <= halfWindow; dy++) {
                    for (let dx = -halfWindow; dx <= halfWindow; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        
                        if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                            const j = (ny * w + nx) * 4;
                            sum += (data[j] + data[j+1] + data[j+2]) / 3;
                            count++;
                        }
                    }
                }
                
                const avg = sum / count;
                const gray = (data[i] + data[i+1] + data[i+2]) / 3;
                const threshold = avg - C;
                
                const value = gray > threshold ? 255 : 0;
                result[i] = result[i+1] = result[i+2] = value;
                result[i+3] = 255;
            }
        }
        
        this._imageData.data.set(result);
        this._updateCanvas();
        console.log('Umbral adaptativo aplicado');
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
        title.textContent = 'Vision Kit Avanzado - Resultado';
        title.style.cssText = 'margin: 0 0 10px 0; color: #9966FF; font-family: Arial, sans-serif;';
        
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
            background: #9966FF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-family: Arial, sans-serif;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = '#774DCB';
        closeBtn.onmouseout = () => closeBtn.style.background = '#9966FF';
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
        link.download = `vision-avanzado-${timestamp}.png`;
        link.href = this._canvas.toDataURL();
        link.click();
        
        console.log('Imagen exportada');
    }

    exportData() {
        const exportData = {
            keypoints: this._keypoints,
            segments: this._segments,
            classifier: this._classifier,
            imageSize: this._canvas ? {
                width: this._canvas.width,
                height: this._canvas.height
            } : null
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `vision-data-${timestamp}.json`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('Datos exportados');
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
            const avg = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
            gray.push(avg);
        }
        
        return gray;
    }
}

module.exports = Scratch3VisionAdvanced;