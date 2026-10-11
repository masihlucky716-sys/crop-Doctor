
import { useEffect, useState } from "react";
import "./App.css";
import treatmentGuidance from "./treatmentGuidance";
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `Server error (${response.status}).`
        );
      }

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
  
const getGuidance = (label = "") => {
  const normalizedLabel = label
    .replace(/___/g, " ")
    .replace(/_/g, " ")
    .toLowerCase();

  if (normalizedLabel.includes("bacterial spot")) {
    return treatmentGuidance["Bacterial spot"];
  }

  return null;
};

  const formatDisease = (label = "") =>
    label
      .replace(/___/g, " — ")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();
const guidance = result?.predicted_disease
  ? getGuidance(result.predicted_disease)
  : null; 
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
            Upload a photo of your crop leaf to get an AI-based
            disease prediction and helpful next steps.
          </p>

          <div className="upload-card">
            {!image ? (
              <>
                <div className="upload-icon">📷</div>
                <h2>Upload Crop Photo</h2>
                <p>Choose a clear photo of the affected leaf.</p>

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
                    ? "Analyzing..."
                    : "🤖 Analyze Crop"}
                </button>

                <button
                  className="upload-button"
                  onClick={handleRemove}
                  disabled={analyzing}
                  style={{ marginTop: "12px" }}
                >
                  ✕ Remove Photo
                </button>
              </>
            )}

            {analyzing && (
              <p role="status" style={{ marginTop: "16px" }}>
                🌱 AI is analyzing your image. Please wait...
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
                ⚠️ {error}
              </p>
            )}

            {result && (
              <div
                className="result-card"
                role="status"
                style={{
                  marginTop: "22px",
                  padding: "20px",
                  borderRadius: "14px",
                  background: "#f0f8f0",
                  color: "#204b2a",
                  textAlign: "left",
                  overflowWrap: "anywhere",
                  border: "1px solid #cde5d0",
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  🌿 AI Analysis Result
                </h2>

                <p>{result.message}</p>

                {result.status === "prediction_complete" &&
                  result.predicted_disease && (
                    <>
                      <p>
                        <strong>Predicted Disease:</strong>
                      </p>

                      <h3>
                        {formatDisease(result.predicted_disease)}
                      </h3>

                      {typeof result.confidence === "number" && (
                        <>
                          <p>
                            <strong>Model confidence:</strong>{" "}
                            {result.confidence.toFixed(2)}%
                          </p>

                          <div
                            style={{
                              height: "10px",
                              background: "#d5e5d8",
                              borderRadius: "10px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, result.confidence)
                                )}%`,
                                height: "100%",
                                background: "#238636",
                                borderRadius: "10px",
                              }}
                            />
                          </div>

                          <p
                            style={{
                              fontSize: "14px",
                              marginTop: "12px",
                              color: "#725018",
                            }}
                          >
                            ⚠️ This is an AI estimate, not a
                            confirmed diagnosis. Verify the result
                            before choosing any treatment.
                          </p>
                        </>
                      )}
                    </>
                  )}
                {guidance && (
  <section
    style={{
      marginTop: "20px",
      padding: "16px",
      borderRadius: "12px",
      background: "#ffffff",
      color: "#204b2a",
      border: "1px solid #cde5d0",
      textAlign: "left",
    }}
  >
    <h3>🩺 Treatment & Management Guidance</h3>
    <h4>{guidance.title}</h4>
    <p>{guidance.overview}</p>

    <h4>Practical Next Steps</h4>
    <ul>
      {guidance.actions.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>

    <h4>🛡️ Prevention</h4>
    <ul>
      {guidance.prevention.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>

    <p>
      <strong>Important: </strong>
      {guidance.warning}
    </p>
  </section>
)}
                {result.filename && (
                  <p>
                    <strong>Image:</strong> {result.filename}
                  </p>
                )}

                <p>
                  <strong>Status:</strong> {result.status}
                </p>

                <button
                  className="upload-button"
                  onClick={handleRemove}
                  style={{ marginTop: "10px" }}
                >
                  Analyze Another Photo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <section className="features">
        <div className="feature">
          <div>🤖</div>
          <h3>AI Detection</h3>
          <p>Get a prediction from your crop leaf image.</p>
        </div>

        <div className="feature">
          <div>🩺</div>
          <h3>Treatment Guidance</h3>
          <p>Verify the diagnosis before deciding on treatment.</p>
        </div>

        <div className="feature">
          <div>🛡️</div>
          <h3>Prevention</h3>
          <p>Learn ways to reduce future crop disease risks.</p>
        </div>

        <div className="feature">
          <div>🌍</div>
          <h3>Farmer Friendly</h3>
          <p>Built to make crop-health information more accessible.</p>
        </div>
      </section>

      <footer>
        <p>🌾 Crop Doctor • AI for Small Farmers</p>
      </footer>
    </div>
  );
}

export default App;
 