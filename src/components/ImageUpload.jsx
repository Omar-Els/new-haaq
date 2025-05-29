import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "./ImageUpload.css";

/**
 * ImageUpload Component
 *
 * This component handles image uploads with preview functionality.
 * It converts images to base64 for storage and display.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onImageUpload - Callback function when image is uploaded
 * @param {string} props.initialImage - Initial image (base64 or URL) if any
 * @param {string} props.label - Label for the upload button
 * @param {string} props.id - ID for the container (used for focusing)
 */
const ImageUpload = ({
  onImageUpload,
  initialImage = "",
  label = "رفع صورة",
  id = ""
}) => {
  const [image, setImage] = useState(initialImage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Update image when initialImage prop changes
  useEffect(() => {
    setImage(initialImage);
    // Clear any existing errors when image changes
    if (error) {
      setError("");
    }
    // Reset file input when initialImage changes
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialImage, error]);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      setError("يرجى اختيار ملف صورة صالح");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setError("");
    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      const imageData = event.target.result;
      setImage(imageData);
      onImageUpload(imageData);
      setIsLoading(false);
    };

    reader.onerror = () => {
      setError("حدث خطأ أثناء قراءة الملف");
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage("");
    onImageUpload("");
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const containerId = id || Math.random().toString(36).substring(7);

  return (
    <div className="image-upload-container" id={containerId}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading-indicator">جاري تحميل الصورة...</div>
      ) : image ? (
        <div className="image-preview-container">
          <motion.img
            src={image}
            alt="Preview"
            className="image-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <button
            type="button"
            className="remove-image-btn"
            onClick={handleRemoveImage}
          >
            ×
          </button>
        </div>
      ) : (
        <motion.button
          type="button"
          className="upload-btn"
          onClick={handleClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="upload-icon">+</span>
          <span className="upload-text">{label}</span>
        </motion.button>
      )}
    </div>
  );
};

export default ImageUpload;

