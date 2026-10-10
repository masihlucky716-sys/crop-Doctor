
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        selectedFile.type
      )
    ) {
      setError("Please choose a JPG, PNG or WEBP image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    setError("");
    setResult(null);
    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a crop photo first.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server error (${response.status}). Please try again.`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Make sure the server is running."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRemove = () => {
    setImage(null);
    setFile(null);
    setError("");
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          🌾 <span>Crop Doctor</span>
        </div>

        <div className="language">🌐 English</div>
      </header>

      <main className="hero">
        <div className="hero-content">
          <div className="badge">
            🤖 AI-Powered Crop Health Assistant
          </div>

          <h1>
            Protect Your Crops
            <br />
            <span>With AI</span>
          </h1>

          <p>
            Upload a photo of your crop leaf for disease detection,
            treatment guidance and prevention tips.
          </p>

          <div className="upload-card">
            {!image ? (
              <>
                <div className="upload-icon">📷</div>

                <h2>Upload Crop Photo</h2>

                <p>
                  Choose a clear photo of the affected leaf.
                </p>

                <label className="upload-button">
                  📁 Choose Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>

                <span className="upload-hint">
                  JPG, PNG or WEBP · Maximum 10 MB
                </span>
              </>
            ) : (
              <>
                <img
                  src={image}
                  alt="Selected crop leaf preview"
                  className="preview-image"
                />

                <h2>Photo Ready ✓</h2>

                <p>{file?.name}</p>

                <button
                  className="analyze-button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing
                    ? "Uploading Photo..."
                    : "🤖 Analyze Crop"}
                </button>

                <button
                  className="upload-button"
                  onClick={handleRemove}
                  style={{ marginTop: "12px" }}
                  disabled={analyzing}
                >
                  ✕ Remove Photo
                </button>
              </>
            )}

            {analyzing && (
              <p role="status" style={{ marginTop: "16px" }}>
                🌱 Uploading your crop photo. Please wait...
              </p>
            )}

            {error && (
              <p
                role="alert"
                style={{
                  color: "#b42318",
                  marginTop: "16px",
                }}
              >
                {error}
              </p>
            )}

            {result && (
              <div
                role="status"
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#eaf7ec",
                  color: "#185c2c",
                  overflowWrap: "anywhere",
                }}
              >
                <h3>✅ Photo Uploaded Successfully!</h3>

                <p>
                  {result.message ||
                    "Your photo was received by the backend."}
                </p>

                {result.filename && (
                  <p>
                    <strong>File:</strong> {result.filename}
                  </p>
                )}

                <p>
                  <strong>Status:</strong> {result.status}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <section className="features">
        <div className="feature">
          <div>🤖</div>
          <h3>AI Detection</h3>
          <p>
            Check crop images for possible disease symptoms.
          </p>
        </div>

        <div className="feature">
          <div>🩺</div>
          <h3>Treatment Guidance</h3>
          <p>
            Explore practical ways to manage crop problems.
          </p>
        </div>

        <div className="feature">
          <div>🛡️</div>
          <h3>Prevention</h3>
          <p>
            Learn how to reduce the risk of future infections.
          </p>
        </div>

        <div className="feature">
          <div>🔊</div>
          <h3>Local Language</h3>
          <p>
            Make crop-health information easier to understand.
          </p>
        </div>
      </section>

      <footer>
        <p>🌾 Crop Doctor • AI for Small Farmers</p>
      </footer>
    </div>
  );
}

export default App;
