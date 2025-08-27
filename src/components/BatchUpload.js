import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Users, UserPlus } from 'lucide-react';
import { useI18n } from '../utils/translationHelpers';
import api from '../services/api';

const BatchUpload = () => {
  const { tBatchUpload, tCommon } = useI18n();
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    results: null,
    error: null
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploadState({
      isUploading: true,
      results: null,
      error: null
    });

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('pdfs', file);
      });

      console.log('Uploading files:', acceptedFiles.map(f => f.name));

      const response = await api.post('/batch-analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadState({
        isUploading: false,
        results: response.data,
        error: null
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        isUploading: false,
        results: null,
        error: error.response?.data?.message || tBatchUpload('messages.uploadError')
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploadState.isUploading
  });

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      results: null,
      error: null
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            {tBatchUpload('title')}
          </h2>
          <p className="text-gray-600 mt-2">
            {tBatchUpload('description')}
          </p>
        </div>

        <div className="p-6">
          {/* Zone de drop */}
          {!uploadState.results && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              } ${uploadState.isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              
              {uploadState.isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-lg font-medium text-gray-700">
                    {tBatchUpload('processing')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tBatchUpload('extractingInfo')}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isDragActive
                        ? tBatchUpload('dropFiles')
                        : tBatchUpload('dropZone')
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {tBatchUpload('fileConstraints')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Erreur */}
          {uploadState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">{tBatchUpload('uploadError')}</h3>
                <p className="text-red-700 mt-1">{uploadState.error}</p>
                <button
                  onClick={resetUpload}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                >
                  {tCommon('retry')}
                </button>
              </div>
            </div>
          )}

          {/* Résultats */}
          {uploadState.results && (
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">{tBatchUpload('stats.total')}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {uploadState.results.stats.total}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">{tBatchUpload('stats.successful')}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {uploadState.results.stats.successful}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">{tBatchUpload('stats.newPatients')}</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {uploadState.results.stats.newPatients}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">{tBatchUpload('stats.existingPatients')}</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {uploadState.results.stats.existingPatients}
                  </p>
                </div>
              </div>

              {/* Message de succès */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">{tBatchUpload('processingCompleted')}</h3>
                    <p className="text-green-700 mt-1">{uploadState.results.message}</p>
                  </div>
                </div>
              </div>

              {/* Fichiers traités avec succès */}
              {uploadState.results.results.successful.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {tBatchUpload('successfulFiles', { count: uploadState.results.results.successful.length })}
                  </h3>
                  <div className="space-y-2">
                    {uploadState.results.results.successful.map((file, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-800">{file.filename}</p>
                              <p className="text-sm text-green-700">
                                {tBatchUpload('patient')}: <span className="font-medium">{file.patientName}</span>
                              </p>
                              <p className="text-sm text-green-700">
                                {tBatchUpload('phone')}: <span className="font-medium">{file.patientPhone}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              file.status === 'new_patient' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {file.status === 'new_patient' ? tBatchUpload('newPatient') : tBatchUpload('existingPatient')}
                            </span>
                            {/* <span className="text-xs text-green-600">
                              {file.confidence}% confiance
                            </span> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fichiers échoués */}
              {uploadState.results.results.failed.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {tBatchUpload('failedFiles', { count: uploadState.results.results.failed.length })}
                  </h3>
                  <div className="space-y-2">
                    {uploadState.results.results.failed.map((file, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-800">{file.filename}</p>
                            <p className="text-sm text-red-700">{file.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton pour recommencer */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={resetUpload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {tBatchUpload('uploadMoreFiles')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchUpload;