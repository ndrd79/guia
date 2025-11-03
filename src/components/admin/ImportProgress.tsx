import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react';

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

interface ImportProgressProps {
  result: ImportResult;
  onClose: () => void;
  onViewDetails?: (batchId: string) => void;
}

export const ImportProgress: React.FC<ImportProgressProps> = ({
  result,
  onClose,
  onViewDetails
}) => {
  const successRate = ((result.success ?? 0) / (result.total ?? 1)) * 100;
  const hasErrors = (result.failed ?? 0) > 0;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          {hasErrors ? (
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
          ) : (
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {hasErrors ? 'Importação Concluída com Avisos' : 'Importação Concluída com Sucesso'}
            </h3>
            <p className="text-sm text-gray-500">
              Lote #{result.batchId ?? 'N/A'} • {formatDuration(result.duration ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Progresso da Importação</span>
            <span>{successRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                hasErrors ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Importadas</p>
                <p className="text-2xl font-bold text-green-900">{result.success ?? 0}</p>
              </div>
            </div>
          </div>

          {(result.failed ?? 0) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">Falharam</p>
                  <p className="text-2xl font-bold text-red-900">{result.failed ?? 0}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Total</p>
                <p className="text-2xl font-bold text-blue-900">{result.total ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Tempo Total</p>
                <p className="text-lg font-semibold text-gray-900">{formatDuration(result.duration ?? 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Velocidade</p>
                <p className="text-lg font-semibold text-gray-900">
                  {((result.total ?? 0) / (result.duration ?? 1)).toFixed(1)} empresas/s
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Errors Section */}
        {(result.errors?.length ?? 0) > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Erros Encontrados ({result.errors?.length ?? 0})
            </h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {(result.errors ?? []).map((error, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-red-800">{error.empresa}:</span>
                    <span className="text-red-700 ml-2">{error.error}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {!hasErrors && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800">
                  Importação realizada com sucesso!
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Todas as {result.success ?? 0} empresas foram importadas sem erros. 
                  Elas já estão disponíveis no sistema e podem ser visualizadas na lista de empresas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(result.batchId ?? '')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Ver detalhes completos
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};