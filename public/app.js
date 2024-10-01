const { useState } = React;

const TranslationInterface = () => {
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    if (!sourceLanguage || !targetLanguage) {
      setError('Please select both source and target languages');
      return;
    }
    if (!inputText.trim()) {
      setError('Please enter some text to translate');
      return;
    }
    setError(null);
    try {
      const response = await fetch('/api/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, sourceLanguage, targetLanguage }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setError(`Translation failed: ${error.message}`);
    }
  };

  const handleFileUpload = async (event) => {
    if (!sourceLanguage || !targetLanguage) {
      setError('Please select both source and target languages');
      return;
    }
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) {
      setError('Please select a file to upload');
      return;
    }
    setFile(uploadedFile);
    setError(null);

    const formData = new FormData();
    formData.append('document', uploadedFile);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);

    try {
      const response = await fetch('/api/translate-document', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTranslatedText(data.translatedText);
      setDownloadUrl(data.downloadUrl);
    } catch (error) {
      console.error('Document translation error:', error);
      setError(`Document translation failed: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI-Powered Translation Platform</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="border p-2"
            required
          >
            <option value="">Source Language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="border p-2"
            required
          >
            <option value="">Target Language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate"
          className="w-full h-32 p-2 border"
        />
        <textarea
          value={translatedText}
          readOnly
          placeholder="Translation will appear here"
          className="w-full h-32 p-2 border bg-gray-100"
        />
        <div className="flex items-center space-x-4">
          <button onClick={handleTranslate} className="bg-blue-500 text-white px-4 py-2 rounded">
            Translate
          </button>
          <label className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded">
            Upload Document
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
            />
          </label>
          {file && <span>{file.name}</span>}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Download Translated PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<TranslationInterface />, document.getElementById('root'));