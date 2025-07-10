import React, { useState } from "react";
import { Upload, FileAudio, Languages, Download, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { useTranscription } from "../contexts/TranscriptionContext";
import { useToast } from "../hooks/use-toast";
import { transcribeAudio } from "../utils/mockData";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [transcriptionResult, setTranscriptionResult] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const { isProcessing, setIsProcessing, addTranscription } = useTranscription();
  const { toast } = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 2GB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setTranscriptionResult("");
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an audio file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 85) {
          return prev;
        }
        return prev + Math.random() * 5;
      });
    }, 1000);

    try {
      // Real transcription using Vosk
      const result = await transcribeAudio(selectedFile, selectedLanguage);
      
      if (result.success) {
        setTranscriptionResult(result.text);
        
        // Add to transcriptions history
        addTranscription({
          fileName: selectedFile.name,
          language: result.language,
          text: result.text,
          fileSize: selectedFile.size,
        });

        setProcessingProgress(100);
        
        toast({
          title: "Transcription completed!",
          description: `Successfully transcribed ${selectedFile.name}`,
        });
      } else {
        throw new Error(result.error || "Transcription failed");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Transcription failed",
        description: error.message || "An error occurred during transcription",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 2000);
    }
  };

  const handleExport = (format) => {
    if (!transcriptionResult) return;

    const blob = new Blob([transcriptionResult], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Transcription exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            100% Local Processing with Vosk
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
          Secure Audio
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {" "}Transcription
          </span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Upload your audio files and get accurate transcriptions in Russian, Kazakh, and English. 
          Your data never leaves your device.
        </p>
      </div>

      {/* Main Upload Area */}
      <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Audio File</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileAudio className="w-10 h-10 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  MP3, WAV, M4A, OGG, FLAC (Max 2GB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileAudio className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Badge variant="secondary">
                {selectedFile.type.split("/")[1]?.toUpperCase() || "AUDIO"}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <Languages className="w-4 h-4" />
                <span>Language</span>
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="kz">Kazakh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Action
              </label>
              <Button
                onClick={handleTranscribe}
                disabled={!selectedFile || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? "Processing..." : "Start Transcription"}
              </Button>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Processing with Vosk...</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {Math.round(processingProgress)}%
                </span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcription Result */}
      {transcriptionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transcription Result</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("txt")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export TXT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("docx")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export DOCX
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcriptionResult}
              onChange={(e) => setTranscriptionResult(e.target.value)}
              rows={12}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Transcription will appear here..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;