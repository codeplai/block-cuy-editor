/* ===========================================================
   ✅ Loaders personalizados
   =========================================================== */
declare module '!arraybuffer-loader!.*' {
  const value: ArrayBuffer;
  export default value;
}

declare module '!raw-loader!.*' {
  const value: string;
  export default value;
}

/* ===========================================================
   ✅ Scratch VM (resuelve los imports locales)
   =========================================================== */
declare module '@scratch/scratch-vm';
declare module 'scratch-vm';
