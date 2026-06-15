/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense } from 'react';
import Layout from './components/Layout';

// Dynamic lazy loaded tools splitting imports
const MathCASGrapher = React.lazy(() => import('./components/MathCASGrapher'));
const MathTypeWYSIWYG = React.lazy(() => import('./components/MathTypeWYSIWYG'));
const CountWordPro = React.lazy(() => import('./components/CountWordPro'));
const TextTransformerStudio = React.lazy(() => import('./components/TextTransformerStudio'));
const TranslationTool = React.lazy(() => import('./components/TranslationTool'));
const TextToSpeech = React.lazy(() => import('./components/TextToSpeech'));
const UniversalConverter = React.lazy(() => import('./components/UniversalConverter'));
const AdvancedPragmaticTools = React.lazy(() => import('./components/AdvancedPragmaticTools'));
const VideoDynamics = React.lazy(() => import('./components/VideoDynamics'));
const CocProgressBuilder = React.lazy(() => import('./components/CocProgressBuilder'));
const DateDiagnostics = React.lazy(() => import('./components/DateDiagnostics'));
const CompoundedInvestment = React.lazy(() => import('./components/CompoundedInvestment'));
const PomodoroProductivity = React.lazy(() => import('./components/PomodoroProductivity'));

export default function App() {
  const [activeToolId, setActiveToolId] = useState('math_cas_grapher');

  const renderActiveTool = () => {
    switch (activeToolId) {
      case 'math_cas_grapher':
        return <MathCASGrapher />;
      case 'math_type_wysiwyg':
        return <MathTypeWYSIWYG />;
      case 'count_word_pro':
        return <CountWordPro />;
      case 'text_transformer_studio':
        return <TextTransformerStudio />;
      case 'translation_tool':
        return <TranslationTool />;
      case 'text_to_speech':
        return <TextToSpeech />;
      case 'universal_converter':
        return <UniversalConverter />;
      case 'advanced_pragmatic_tools':
        return <AdvancedPragmaticTools />;
      case 'video_dynamics':
        return <VideoDynamics />;
      case 'coc_progress_builder':
        return <CocProgressBuilder />;
      case 'date_diagnostics':
        return <DateDiagnostics />;
      case 'compounded_investment':
        return <CompoundedInvestment />;
      case 'pomodoro_productivity':
        return <PomodoroProductivity />;
      default:
        return <MathCASGrapher />;
    }
  };

  return (
    <Layout activeToolId={activeToolId} onSelectTool={setActiveToolId}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] select-none text-center">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold text-slate-401 uppercase tracking-widest animate-pulse">
              Đang phân rã mã nguồn & Khởi tạo tài nguyên...
            </p>
          </div>
        }
      >
        {renderActiveTool()}
      </Suspense>
    </Layout>
  );
}
