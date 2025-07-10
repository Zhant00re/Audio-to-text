import React, { useState, useEffect } from "react";
import { FileText, Download, Trash2, Clock, FileAudio, Languages, Search, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { useTranscription } from "../contexts/TranscriptionContext";
import { useToast } from "../hooks/use-toast";
import { getTranscriptions, deleteTranscription as deleteTranscriptionAPI, getLanguageLabel, formatFileSize } from "../utils/mockData";

const Transcriptions = () => {
  const { transcriptions, setTranscriptions } = useTranscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load transcriptions from backend on component mount
  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    setLoading(true);
    try {
      const backendTranscriptions = await getTranscriptions();
      setTranscriptions(backendTranscriptions);
    } catch (error) {
      console.error('Failed to load transcriptions:', error);
      toast({
        title: "Failed to load transcriptions",
        description: "Could not fetch transcription history from server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTranscriptions = transcriptions.filter(t => {
    const matchesSearch = t.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = languageFilter === "all" || t.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const handleExport = (transcription, format) => {
    const content = `File: ${transcription.fileName}\nLanguage: ${getLanguageLabel(transcription.language)}\nDate: ${new Date(transcription.createdAt).toLocaleString()}\n\n${transcription.text}`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${transcription.fileName}_transcription.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Transcription exported as ${format.toUpperCase()}`,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteTranscriptionAPI(id);
      setTranscriptions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Transcription deleted",
        description: "The transcription has been removed from your history",
      });
    } catch (error) {
      console.error('Failed to delete transcription:', error);
      toast({
        title: "Failed to delete",
        description: "Could not delete transcription from server",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Transcription History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Transcription History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {transcriptions.length} transcription{transcriptions.length !== 1 ? 's' : ''} stored locally
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="kz">Kazakh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transcriptions Grid */}
      {filteredTranscriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {transcriptions.length === 0 ? "No transcriptions yet" : "No matches found"}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {transcriptions.length === 0 
              ? "Upload an audio file to create your first transcription"
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTranscriptions.map((transcription) => (
            <Card key={transcription.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FileAudio className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg truncate max-w-[200px]">
                        {transcription.fileName}
                      </CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(transcription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Languages className="w-3 h-3" />
                      <span>{getLanguageLabel(transcription.language)}</span>
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transcription</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this transcription? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(transcription.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{formatFileSize(transcription.fileSize)}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                    {transcription.text}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTranscription(transcription)}
                    className="flex-1"
                  >
                    View Full Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(transcription, "txt")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(transcription, "docx")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    DOCX
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Text Modal */}
      {selectedTranscription && (
        <AlertDialog open={!!selectedTranscription} onOpenChange={() => setSelectedTranscription(null)}>
          <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <FileAudio className="w-5 h-5" />
                <span>{selectedTranscription.fileName}</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="secondary">
                    {getLanguageLabel(selectedTranscription.language)}
                  </Badge>
                  <span>{new Date(selectedTranscription.createdAt).toLocaleString()}</span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedTranscription.text}
                </p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleExport(selectedTranscription, "txt")}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Transcriptions;