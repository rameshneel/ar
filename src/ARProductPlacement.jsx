import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, ShoppingCart, Package, Star, IndianRupee, Plus, X, Edit2, Save, Trash2, Eye, Move, RotateCcw, ZoomIn, ZoomOut, Scan } from 'lucide-react';

const ARProductPlacement = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wooden Door",
      price: 15000,
      rating: 4.5,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjOEI0NTEzIiBzdHJva2U9IiM2NTMzMTAiIHN0cm9rZS13aWR0aD0iNCIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMjAwIiBmaWxsPSIjQTU1QzI4IiBzdHJva2U9IiM2NTMzMTAiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxNjAiIGN5PSIxMjAiIHI9IjgiIGZpbGw9IiNGRkQ3MDAiLz4KPHN2Zz4=",
      category: "Doors",
      arModel: "door",
      dimensions: { width: 100, height: 120 }
    },
    {
      id: 2,
      name: "Modern Sofa",
      price: 35000,
      rating: 4.7,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNEEzNDU3IiByeD0iMTAiLz4KPHJlY3QgeD0iMTAiIHk9IjIwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNkI0QzU3IiByeD0iNSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzRBMzQ1NyIgcng9IjUiLz4KPHJlY3QgeD0iMTYwIiB5PSIxMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNEEzNDU3IiByeD0iNSIvPgo8L3N2Zz4=",
      category: "Furniture",
      arModel: "sofa",
      dimensions: { width: 150, height: 80 }
    }
  ]);
  
  const [showCamera, setShowCamera] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [arObjects, setArObjects] = useState([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [draggedObject, setDraggedObject] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    rating: 4.0
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const arCanvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      alert('Camera access denied or not available');
    }
  }, []);

  const startAR = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowAR(true);
    } catch (err) {
      alert('Camera access denied or not available');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setShowAR(false);
    setIsPlacing(false);
    setArObjects([]);
  }, []);

  const addProduct = () => {
    if (newProduct.name && newProduct.price && capturedImage) {
      const product = {
        id: Date.now(),
        name: newProduct.name,
        price: parseInt(newProduct.price),
        rating: newProduct.rating,
        image: capturedImage,
        category: newProduct.category || 'General',
        arModel: 'custom',
        dimensions: { width: 100, height: 100 }
      };
      
      setProducts([...products, product]);
      setNewProduct({ name: '', price: '', category: '', rating: 4.0 });
      setCapturedImage(null);
    }
  };

  const placeProductInAR = (product) => {
    setSelectedProduct(product);
    setIsPlacing(true);
    startAR();
  };

  const handleARCanvasClick = (e) => {
    if (!isPlacing || !selectedProduct) return;

    const rect = arCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newObject = {
      id: Date.now(),
      product: selectedProduct,
      x: x,
      y: y,
      scale: 1,
      rotation: 0,
      width: selectedProduct.dimensions.width,
      height: selectedProduct.dimensions.height
    };

    setArObjects([...arObjects, newObject]);
    setIsPlacing(false);
  };

  const handleObjectDrag = (e, objectId) => {
    if (draggedObject !== objectId) return;

    const rect = arCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setArObjects(arObjects.map(obj => 
      obj.id === objectId ? { ...obj, x, y } : obj
    ));
  };

  const scaleObject = (objectId, scaleChange) => {
    setArObjects(arObjects.map(obj => 
      obj.id === objectId 
        ? { 
            ...obj, 
            scale: Math.max(0.5, Math.min(3, obj.scale + scaleChange)),
            width: obj.product.dimensions.width * Math.max(0.5, Math.min(3, obj.scale + scaleChange)),
            height: obj.product.dimensions.height * Math.max(0.5, Math.min(3, obj.scale + scaleChange))
          } 
        : obj
    ));
  };

  const rotateObject = (objectId) => {
    setArObjects(arObjects.map(obj => 
      obj.id === objectId ? { ...obj, rotation: (obj.rotation + 45) % 360 } : obj
    ));
  };

  const removeArObject = (objectId) => {
    setArObjects(arObjects.filter(obj => obj.id !== objectId));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  // AR Canvas Drawing
  useEffect(() => {
    if (showAR && arCanvasRef.current && videoRef.current) {
      const canvas = arCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const drawFrame = () => {
        if (!showAR) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw AR grid for reference
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvas.width, i);
          ctx.stroke();
        }

        // Draw AR objects
        arObjects.forEach(obj => {
          ctx.save();
          ctx.translate(obj.x, obj.y);
          ctx.rotate((obj.rotation * Math.PI) / 180);
          
          // Draw product image/representation
          if (obj.product.arModel === 'door') {
            // Draw door
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            
            // Door handle
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(obj.width/2 - 15, 0, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (obj.product.arModel === 'sofa') {
            // Draw sofa
            ctx.fillStyle = '#4A3457';
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            ctx.fillStyle = '#6B4C57';
            ctx.fillRect(-obj.width/2 + 10, -obj.height/2 + 10, obj.width - 20, obj.height - 30);
          } else {
            // Draw generic product
            ctx.fillStyle = 'rgba(100, 150, 200, 0.8)';
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
          }
          
          // Draw selection indicator
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(-obj.width/2 - 5, -obj.height/2 - 5, obj.width + 10, obj.height + 10);
          ctx.setLineDash([]);
          
          ctx.restore();
        });

        // Draw placement indicator
        if (isPlacing) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Tap to place ' + selectedProduct?.name, canvas.width/2, 50);
        }

        requestAnimationFrame(drawFrame);
      };
      
      drawFrame();
    }
  }, [showAR, arObjects, isPlacing, selectedProduct]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Scan size={32} />
            <h1 className="text-2xl font-bold">AR Product Placement</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ShoppingCart size={24} />
            <span className="bg-white text-purple-600 px-3 py-1 rounded-full font-semibold">
              {products.length} Products
            </span>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Product Photo</h3>
              <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <video ref={videoRef} autoPlay className="w-full rounded-lg mb-4" />
            <div className="flex space-x-3">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Camera size={20} />
                <span>Capture</span>
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR View */}
      {showAR && (
        <div className="fixed inset-0 bg-black z-50">
          <video 
            ref={videoRef} 
            autoPlay 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={arCanvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            width="1280"
            height="720"
            onClick={handleARCanvasClick}
            onMouseMove={(e) => handleObjectDrag(e, draggedObject)}
            onMouseUp={() => setDraggedObject(null)}
          />
          
          {/* AR Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <span className="text-sm">
                {isPlacing ? `Placing: ${selectedProduct?.name}` : `AR Objects: ${arObjects.length}`}
              </span>
            </div>
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Object Controls */}
          {arObjects.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">AR Object Controls</h4>
                <div className="grid grid-cols-2 gap-2">
                  {arObjects.map((obj, index) => (
                    <div key={obj.id} className="bg-gray-700 p-2 rounded flex items-center justify-between">
                      <span className="text-sm truncate">{obj.product.name}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => scaleObject(obj.id, 0.1)}
                          className="bg-blue-600 p-1 rounded hover:bg-blue-700"
                        >
                          <ZoomIn size={12} />
                        </button>
                        <button
                          onClick={() => scaleObject(obj.id, -0.1)}
                          className="bg-blue-600 p-1 rounded hover:bg-blue-700"
                        >
                          <ZoomOut size={12} />
                        </button>
                        <button
                          onClick={() => rotateObject(obj.id)}
                          className="bg-green-600 p-1 rounded hover:bg-green-700"
                        >
                          <RotateCcw size={12} />
                        </button>
                        <button
                          onClick={() => removeArObject(obj.id)}
                          className="bg-red-600 p-1 rounded hover:bg-red-700"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Add Product Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Plus size={24} />
            <span>Add New Product</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <Camera size={20} />
                    <span>Take Photo</span>
                  </button>
                  <button
                    onClick={addProduct}
                    disabled={!newProduct.name || !newProduct.price || !capturedImage}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              {capturedImage ? (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured product"
                    className="w-48 h-48 object-cover rounded-lg border-4 border-green-500"
                  />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Camera size={48} className="mx-auto mb-2" />
                    <p>Take a photo</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => placeProductInAR(product)}
                    className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700"
                    title="View in AR"
                  >
                    <Scan size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">({product.rating})</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <IndianRupee size={20} className="text-green-600" />
                    <span className="text-xl font-bold text-green-600">
                      {product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2">
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => placeProductInAR(product)}
                    className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 flex items-center justify-center"
                    title="Try in AR"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ARProductPlacement;