// src/pages/CreateAvatarPage.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';


const CreateAvatarPage = () => {
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    
    setImages([...images, ...newImages]);
    setPreview(newImages[0].url);
  };

  const handleDelete = (index) => {
    const newImages = [...images];
    const deleted = newImages.splice(index, 1);
    
    // Clean up memory
    URL.revokeObjectURL(deleted[0].url);
    
    setImages(newImages);
    setPreview(newImages.length > 0 ? newImages[0].url : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would upload the images to your backend
    alert('Avatar creation submitted!');
    // Reset form
    setImages([]);
    setPreview(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-8">
        <Link to="/" className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-8">Create New Avatar</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Upload Avatar Images</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-500">Click to upload images or drag and drop</p>
              <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                multiple
                accept="image/*"
              />
            </div>
          </div>

          {images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Image Preview</h2>
              <div className="flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image.url} 
                      alt={`Preview ${index}`}
                      className={`w-32 h-32 object-cover rounded-lg cursor-pointer ${preview === image.url ? 'ring-2 ring-indigo-500' : ''}`}
                      onClick={() => setPreview(image.url)}
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Selected Image</h2>
              <div className="flex justify-center">
                <img 
                  src={preview} 
                  alt="Selected Preview" 
                  className="max-h-80 rounded-lg shadow-md"
                />
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={images.length === 0}
            >
              Create Avatar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAvatarPage;