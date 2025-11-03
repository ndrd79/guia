import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Users,
  AlertCircle
} from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidatedEmpresa {
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
  errors?: ValidationError[];
  warnings?: ValidationError[];
  isDuplicate?: boolean;
  duplicateOf?: string;
}

interface ValidationResultsProps {
  validEmpresas: ValidatedEmpresa[];
  invalidEmpresas: ValidatedEmpresa[];
  warningEmpresas: ValidatedEmpresa[];
  duplicateEmpresas: ValidatedEmpresa[];
  onProceed: (validEmpresas: ValidatedEmpresa[]) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  validEmpresas,
  invalidEmpresas,
  warningEmpresas,
  duplicateEmpresas,
  onProceed,
  onCancel,
  isProcessing
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    valid: true,
    warnings: true,
    invalid: true,
    duplicates: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyErrorsToClipboard = () => {
    const errorText = invalidEmpresas.map((empresa, index) => {
      const errors = empresa.errors?.map(e => `  - ${e.field}: ${e.message}`).join('\n') || '';
      return `Linha ${index + 1} (${empresa.nome}):\n${errors}`;
    }).join('\n\n');

    navigator.clipboard.writeText(errorText);
  };

  const totalEmpresas = validEmpresas.length + invalidEmpresas.length + warningEmpresas.length + duplicateEmpresas.length;
  const canProceed = validEmpresas.length > 0;

  const StatCard = ({ 
    title, 
    count, 
    icon: Icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    count: number; 
    icon: any; 
    color: string; 
    bgColor: string; 
  }) => (
    <div className={`${bgColor} border border-gray-200 rounded-lg p-4`}>
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${color} mr-3`} />
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );

  const EmpresaRow = ({ 
    empresa, 
    index, 
    showErrors = false, 
    showWarnings = false 
  }: { 
    empresa: ValidatedEmpresa; 
    index: number; 
    showErrors?: boolean; 
    showWarnings?: boolean; 
  }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{empresa.nome}</h4>
          <p className="text-sm text-gray-600">{empresa.categoria} • {empresa.telefone}</p>
          <p className="text-sm text-gray-500 mt-1">{empresa.endereco}</p>
          
          {empresa.isDuplicate && empresa.duplicateOf && (
            <p className="text-sm text-orange-600 mt-2">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Duplicata de: {empresa.duplicateOf}
            </p>
          )}
        </div>
        <span className="text-xs text-gray-400">Linha {index + 1}</span>
      </div>

      {showErrors && empresa.errors && empresa.errors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <h5 className="text-sm font-medium text-red-800 mb-2">Erros:</h5>
          <ul className="text-sm text-red-700 space-y-1">
            {empresa.errors.map((error, i) => (
              <li key={i}>• <strong>{error.field}:</strong> {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {showWarnings && empresa.warnings && empresa.warnings.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h5 className="text-sm font-medium text-yellow-800 mb-2">Avisos:</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            {empresa.warnings.map((warning, i) => (
              <li key={i}>• <strong>{warning.field}:</strong> {warning.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const Section = ({ 
    title, 
    count, 
    items, 
    sectionKey, 
    icon: Icon, 
    color, 
    showErrors = false, 
    showWarnings = false 
  }: {
    title: string;
    count: number;
    items: ValidatedEmpresa[];
    sectionKey: string;
    icon: any;
    color: string;
    showErrors?: boolean;
    showWarnings?: boolean;
  }) => (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div className="flex items-center">
          <Icon className={`h-5 w-5 ${color} mr-3`} />
          <span className="font-medium text-gray-900">{title}</span>
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            {count}
          </span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      {expandedSections[sectionKey] && count > 0 && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="mt-4 max-h-96 overflow-y-auto">
            {items.map((empresa, index) => (
              <EmpresaRow
                key={index}
                empresa={empresa}
                index={index}
                showErrors={showErrors}
                showWarnings={showWarnings}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Resultado da Validação
            </h3>
            <p className="text-sm text-gray-500">
              {totalEmpresas} empresas processadas
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Válidas"
            count={validEmpresas.length}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Com Avisos"
            count={warningEmpresas.length}
            icon={AlertTriangle}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="Inválidas"
            count={invalidEmpresas.length}
            icon={XCircle}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            title="Duplicatas"
            count={duplicateEmpresas.length}
            icon={Copy}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>
      </div>

      {/* Results Sections */}
      <div className="p-6 space-y-4">
        <Section
          title="Empresas Válidas"
          count={validEmpresas.length}
          items={validEmpresas}
          sectionKey="valid"
          icon={CheckCircle}
          color="text-green-600"
        />

        <Section
          title="Empresas com Avisos"
          count={warningEmpresas.length}
          items={warningEmpresas}
          sectionKey="warnings"
          icon={AlertTriangle}
          color="text-yellow-600"
          showWarnings={true}
        />

        <Section
          title="Empresas Inválidas"
          count={invalidEmpresas.length}
          items={invalidEmpresas}
          sectionKey="invalid"
          icon={XCircle}
          color="text-red-600"
          showErrors={true}
        />

        <Section
          title="Empresas Duplicadas"
          count={duplicateEmpresas.length}
          items={duplicateEmpresas}
          sectionKey="duplicates"
          icon={Copy}
          color="text-orange-600"
        />
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {invalidEmpresas.length > 0 && (
              <button
                onClick={copyErrorsToClipboard}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Erros
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            {canProceed ? (
              <button
                onClick={() => onProceed(validEmpresas)}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Importar {validEmpresas.length} Empresas
                  </>
                )}
              </button>
            ) : (
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded-md">
                <AlertCircle className="w-4 h-4 mr-2" />
                Nenhuma empresa válida para importar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};