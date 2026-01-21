import React, { useRef, useState } from "react";
import { Camera, Trash2, RefreshCw } from "lucide-react";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const boothRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [activeStickers, setActiveStickers] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [borderColor, setBorderColor] = useState('border-white');

  const stickerOptions = [
             "/stickers/blossom.png",
    "/stickers/bubbles.png",
    "/stickers/buttercup.png",
    "/stickers/blueheart.png",
    "/stickers/greenheart.png",
    "/stickers/pinkheart.png",
    "/stickers/bluestar.png",
    "/stickers/greenstar.png",
    "/stickers/pinkstar.png",

  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied!");
    }
  };

  const addSticker = (src) => {
    const newSticker = { id: Date.now(), src, x: 80, y: 120 };
    setActiveStickers([...activeStickers, newSticker]);
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !boothRef.current) return;
    const rect = boothRef.current.getBoundingClientRect();
  const stickerWidth = 80; // This is the width of your sticker in the preview (w-20 is 80px)
  
  // Calculate raw X relative to the box
  const rawX = e.clientX - rect.left;
  
  // MIRROR MATH: Flip the X coordinate so it matches the mirrored video
  // We subtract the mouse position from the total width of the booth
  const mirroredX = rect.width - rawX - (stickerWidth / 2);
  
  const newY = e.clientY - rect.top - (stickerWidth / 2);

  setActiveStickers((prev) =>
    prev.map((s) => (s.id === draggingId ? { ...s, x: mirroredX, y: newY } : s))
    );
  };

  const takePhoto = async () => {
    const canvas = canvasRef.current;
  const video = videoRef.current;
  if (!video || !canvas) return;

  setIsFlashing(true);
  setTimeout(() => setIsFlashing(false), 150);

  // Cycle the random border color
  const colors = ['border-pink-400', 'border-blue-400', 'border-green-400'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  setBorderColor(randomColor);

  const ctx = canvas.getContext("2d");
  canvas.width = 600; 
  canvas.height = 800;

  // --- START MIRROR BLOCK ---
  ctx.save(); 
  ctx.translate(canvas.width, 0); 
  ctx.scale(-1, 1); 
  
  // 1. Draw the flipped video
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. Draw the stickers WHILE the canvas is still flipped
  // This makes the s.x (right-offset) align with the flipped X-axis
  const loadAndDraw = (s) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = s.src;
      img.onload = () => {
        // We draw at s.x * 2 because the canvas is 600px (double the 300px preview)
        ctx.drawImage(img, s.x * 2, s.y * 2, 160, 160);
        resolve();
      };
    });
  };

  await Promise.all(activeStickers.map(loadAndDraw));

  ctx.restore(); 
  // --- END MIRROR BLOCK ---

  setPhotos([canvas.toDataURL("image/png"), ...photos]);
  };

  return (
    <div 
      className="h-screen w-screen relative flex flex-col items-center select-none overflow-hidden" 
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDraggingId(null)}
    >
<div>
  <img src="/stickers/bubbles.png" className="fixed top-150 left-20 animate-float opacity-90 w-40 pointer-events-none" />
      <img src="/stickers/blossom.png" className="fixed top-40 right-90 animate-float opacity-90 w-40 pointer-events-none" />
      <img src="/stickers/buttercup.png" className="fixed top-40 left-60 animate-float opacity-90 w-40 pointer-events-none" />
</div>

     <div 
  className="fixed -bottom-13 left-0 w-full h-48 opacity-30 pointer-events-none bg-repeat-x z-0" 
  style={{ 
    backgroundImage: 'url("/stickers/city3.png")',
    backgroundSize: 'contain',
    backgroundPosition: 'bottom center' // Anchors the pixels to the bottom
  }}
></div>

      {/* Main Container - justify-between keeps things at edges */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full py-4 px-2 box-border max-w-2xl mx-auto">
        
        {/* Header - Scaled down for space */}
        <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_4px_0_rgba(219,39,119,1)]">
          Powerpuff Booth
        </h1>

        {/* Booth - max-h-[40vh] prevents it from pushing other stuff off screen */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0 py-2">
          <div 
            ref={boothRef}
            style={{
    /* Example: A repeating heart pattern as the border */
    borderImageSource: 'url("https://www.transparenttextures.com/patterns/hearts.png")',
    borderImageSlice: '30',
    borderImageRepeat: 'round'
    
  }}
            className={`relative border-[12px] ${borderColor} rounded-[40px] shadow-2xl overflow-hidden bg-black aspect-[3/4] h-full max-h-[50vh] w-[550px] transition-colors duration-500 cursor-crosshair shrink-0`}
>
  <video ref={videoRef} autoPlay className="w-full h-full object-cover -scale-x-100" />
            {activeStickers.map((s) => (
              <img 
                key={s.id} 
    src={s.src} 
    onMouseDown={() => setDraggingId(s.id)}
    style={{ 
      right: s.x, // Change 'left' to 'right' here!
      top: s.y, 
      cursor: draggingId === s.id ? 'grabbing' : 'grab'
    }} 
    className="absolute w-20 h-20 touch-none z-20"
              />
            ))}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Interaction Area - Pinned to bottom */}
        <div className="flex flex-col items-center gap-3 w-full shrink-0">
          <div className="flex gap-3">
            <button onClick={startCamera} className="p-3 bg-white text-pink-500 rounded-full shadow-lg border-b-2 border-pink-100 hover:scale-110 active:scale-95"><RefreshCw size={20} /></button>
            <button onClick={takePhoto} className="px-10 py-3 bg-pink-500 text-white font-black text-xl rounded-full shadow-[0_6px_0_rgba(190,24,93,1)] hover:bg-pink-400 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
              <Camera size={24} /> SNAP!
            </button>
            <button onClick={() => setActiveStickers([])} className="p-3 bg-white text-red-500 rounded-full shadow-lg border-b-2 border-red-100 hover:scale-110 active:scale-95"><Trash2 size={20} /></button>
          </div>

          {/* Sticker Tray */}
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-[24px] shadow-lg flex gap-3 border-2 border-white overflow-x-auto max-w-full">
            {stickerOptions.map((src, i) => (
              <button key={i} onClick={() => addSticker(src)} className="shrink-0 hover:scale-110 transition-transform">
                <img src={src} className="w-10 h-10 object-contain" />
              </button>
            ))}
          </div>

          {/* Mini Polaroid Gallery - Horizontally Scrollable */}
          <div className="w-full flex gap-3 overflow-x-auto py-2 px-4 no-scrollbar min-h-[100px]">
            {photos.map((p, i) => (
              <a key={i} href={p} download={`snap-${i}.png`} className="shrink-0 transform hover:scale-105 transition-transform">
                <div className="bg-white p-1 pb-4 shadow-md border border-pink-50 -rotate-2">
                  <img src={p} className="w-16 h-20 object-cover" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {isFlashing && (
        <div className="fixed inset-0 bg-white z-[100] opacity-90 transition-opacity pointer-events-none" />
      )}
    </div>
  );
}