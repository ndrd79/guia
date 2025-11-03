import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import { useToastActions } from '../../../components/admin/ToastProvider';
import { supabase } from '../../../lib/supabase';
import { 
  FileUpload, 
  DataPreview, 
  ValidationResults, 
  ImportProgress 
} from '../../../src/components/admin';

interface ParsedEmpresa {
  nome: string;
  categoria: string;
  telefone: string;
  endereco: string;
  descricao: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  horario_funcionamento?: string;
  imagem?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidatedEmpresa extends ParsedEmpresa {
  errors?: ValidationError[];
  warnings?: ValidationError[];
  isDuplicate?: boolean;
  duplicateOf?: string;
}

interface ValidationResult {
  valid: ValidatedEmpresa[];
  invalid: ValidatedEmpresa[];
  warnings: ValidatedEmpresa[];
  duplicates: ValidatedEmpresa[];
}

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{
    empresa: string;
    error: string;
  }>;
  batchId: string;
  duration: number;
}

type ImportStep = 'upload' | 'preview' | 'validation' | 'importing' | 'complete';

export default function ImportarEmpresas() {
  const router = useRouter();
  const { showToast } = useToastActions();
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEmpresa[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Get auth token from Supabase session
  const getAuthToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  };

  // Handle file upload and parsing
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/empresas/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar arquivo');
      }

      setParsedData(result.data);
      setCurrentStep('preview');
      showToast(`${result.data.length} empresas encontradas no arquivo`, 'success');

    } catch (error) {
      console.error('Erro no upload:', error);
      showToast(error instanceof Error ? error.message : 'Erro ao processar arquivo', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle data validation
  const handleDataValidation = async () => {
    setIsProcessing(true);

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/empresas/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ empresas: parsedData })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na validação');
      }

      setValidationResult(result);
      setCurrentStep('validation');

      const { valid, invalid, warnings, duplicates } = result;
      showToast(
        `Validação concluída: ${valid.length} válidas, ${invalid.length} inválidas, ${warnings.length} com avisos, ${duplicates.length} duplicatas`,
        'success'
      );

    } catch (error) {
      console.error('Erro na validação:', error);
      showToast(error instanceof Error ? error.message : 'Erro na validação', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle import execution
  const handleImportExecution = async (validEmpresas: ValidatedEmpresa[]) => {
    setIsProcessing(true);
    setCurrentStep('importing');

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/empresas/import-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ empresas: validEmpresas })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na importação');
      }

      setImportResult(result);
      setCurrentStep('complete');

      if (result.failed === 0) {
        showToast(`${result.success} empresas importadas com sucesso!`, 'success');
      } else {
        showToast(`${result.success} importadas, ${result.failed} falharam`, 'info');
      }

    } catch (error) {
      console.error('Erro na importação:', error);
      showToast(error instanceof Error ? error.message : 'Erro na importação', 'error');
      setCurrentStep('validation'); // Voltar para permitir nova tentativa
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle template download
  const handleDownloadTemplate = async (format: 'xlsx' | 'csv') => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/admin/empresas/template?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_importacao_empresas.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Template baixado com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao baixar template:', error);
      showToast('Erro ao baixar template', 'error');
    }
  };

  // Reset to start over
  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setParsedData([]);
    setValidationResult(null);
    setImportResult(null);
    setIsProcessing(false);
  };

  // Navigate to details page
  const handleViewDetails = (batchId: string) => {
    router.push(`/admin/empresas/relatorios?batch=${batchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin/empresas')}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Admin
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Importação em Lote de Empresas
          </h1>
          <p className="mt-2 text-gray-600">
            Importe múltiplas empresas de uma vez usando arquivos Excel ou CSV
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {[
                { id: 'upload', name: 'Upload', status: currentStep === 'upload' ? 'current' : 
                  ['preview', 'validation', 'importing', 'complete'].includes(currentStep) ? 'complete' : 'upcoming' },
                { id: 'preview', name: 'Prévia', status: currentStep === 'preview' ? 'current' : 
                  ['validation', 'importing', 'complete'].includes(currentStep) ? 'complete' : 'upcoming' },
                { id: 'validation', name: 'Validação', status: currentStep === 'validation' ? 'current' : 
                  ['importing', 'complete'].includes(currentStep) ? 'complete' : 'upcoming' },
                { id: 'complete', name: 'Concluído', status: currentStep === 'complete' ? 'complete' : 'upcoming' }
              ].map((step, stepIdx) => (
                <li key={step.id} className={`${stepIdx !== 3 ? 'pr-8 sm:pr-20' : ''} relative`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${step.status === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  </div>
                  <div className={`relative w-8 h-8 flex items-center justify-center rounded-full ${
                    step.status === 'complete' ? 'bg-blue-600' : 
                    step.status === 'current' ? 'bg-blue-600 border-2 border-white' : 'bg-white border-2 border-gray-300'
                  }`}>
                    <span className={`text-sm font-medium ${
                      step.status === 'complete' || step.status === 'current' ? 'text-white' : 'text-gray-500'
                    }`}>
                      {stepIdx + 1}
                    </span>
                  </div>
                  <span className={`mt-2 block text-sm font-medium ${
                    step.status === 'complete' || step.status === 'current' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {currentStep === 'upload' && (
            <div className="p-6">
              <FileUpload
                onFileUpload={handleFileUpload}
                isUploading={isProcessing}
                onDownloadTemplate={handleDownloadTemplate}
              />
            </div>
          )}

          {currentStep === 'preview' && parsedData.length > 0 && (
            <DataPreview
              data={parsedData}
              fileName={uploadedFile?.name || 'arquivo'}
              onConfirm={handleDataValidation}
              onCancel={handleReset}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'validation' && validationResult && (
            <ValidationResults
              validEmpresas={validationResult.valid}
              invalidEmpresas={validationResult.invalid}
              warningEmpresas={validationResult.warnings}
              duplicateEmpresas={validationResult.duplicates}
              onProceed={handleImportExecution}
              onCancel={handleReset}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'importing' && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Importando empresas...
              </h3>
              <p className="text-gray-600">
                Aguarde enquanto processamos os dados. Isso pode levar alguns minutos.
              </p>
            </div>
          )}

          {currentStep === 'complete' && importResult && (
            <ImportProgress
              result={importResult}
              onClose={handleReset}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
}