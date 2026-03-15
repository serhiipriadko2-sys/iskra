import React, { useState } from 'react';
import { useEngine } from '../hooks/useEngine';
import { useSomaticFeedback } from '../hooks/useSomaticFeedback';
import { QuantumField } from './QuantumField';
import type { IskraMetrics, VoiceID } from '@iskra/core';

const COLORS = {
  background: '#05080A',
  primary: '#FF7A00',
  accent: '#4DA3FF',
  text: '#E0E0E0',
  secondaryText: '#808080'
};

const MetricsDisplay: React.FC<{ metrics: IskraMetrics }> = ({ metrics }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', color: COLORS.secondaryText, fontSize: '0.8rem' }}>
    <div>RHYTHM: {metrics.rhythm.toFixed(0)}</div>
    <div>TRUST: {(metrics.trust * 100).toFixed(0)}%</div>
    <div>PAIN: {(metrics.pain * 100).toFixed(0)}%</div>
    <div>CHAOS: {(metrics.chaos * 100).toFixed(0)}%</div>
    <div>DRIFT: {(metrics.drift * 100).toFixed(0)}%</div>
  </div>
);

export const ChatInterface: React.FC = () => {
  const { metrics, voice, superposition, processInput, isProcessing, context } = useEngine();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'iskra'; text: string; voice?: VoiceID; contextCount?: number }[]>([]);

  // Enable somatic feedback based on metrics
  useSomaticFeedback(metrics);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);

    try {
      const response = await processInput(userMsg);

      // Real-time engine integration:
      // Since LLM generation is Task 4.2, we show the system status and context retrieval for now.
      const statusText = `[${response.value.voice}] Active. Retrieved ${response.value.context.length} memory nodes. Resonance: ${response.value.superposition?.[0]?.prob.toFixed(2) || '0.00'}`;

      setHistory(prev => [...prev, {
        role: 'iskra',
        text: statusText,
        voice: response.value.voice,
        contextCount: response.value.context.length
      }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'iskra', text: 'Error: System Failure. Neural link disconnected.' }]);
    }
  };

  return (
    <div style={{
      background: COLORS.background,
      color: COLORS.text,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header / Visualization */}
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1px solid ${COLORS.secondaryText}`,
        position: 'relative'
      }}>
        <QuantumField metrics={metrics} superposition={superposition} width={window.innerWidth} height={300} />
        <div style={{
           position: 'absolute',
           top: '10px',
           right: '10px',
           fontSize: '0.7rem',
           color: COLORS.accent,
           textAlign: 'right'
        }}>
           CORE_ENGINE_VΩ.6<br/>
           PHASE: QUANTUM_ACTIVE
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ padding: '0.5rem', background: '#00000033', borderBottom: `1px solid #1A1D1F` }}>
        <MetricsDisplay metrics={metrics} />
      </div>

      {/* Chat History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '0.8rem',
            borderRadius: '8px',
            background: msg.role === 'user' ? COLORS.primary : '#1A1D1F',
            color: msg.role === 'user' ? '#000' : COLORS.text,
            boxShadow: msg.role === 'iskra' ? '0 2px 10px rgba(0,0,0,0.5)' : 'none'
          }}>
            {msg.voice && (
              <div style={{ fontSize: '0.7rem', color: COLORS.accent, marginBottom: '0.2rem', fontWeight: 'bold' }}>
                VOICE::{msg.voice}
              </div>
            )}
            {msg.text}
            {msg.contextCount !== undefined && (
               <div style={{ fontSize: '0.6rem', color: COLORS.secondaryText, marginTop: '0.4rem', borderTop: '1px solid #ffffff11', paddingTop: '0.2rem' }}>
                  REF: {msg.contextCount} nodes in fractal space
               </div>
            )}
          </div>
        ))}
        {isProcessing && <div style={{ color: COLORS.accent, fontStyle: 'italic', fontSize: '0.9rem' }}>Analyzing neural oscillations...</div>}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{ padding: '1rem', display: 'flex', gap: '0.5rem', background: '#000' }}>
        <input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Transmit signal..."
          style={{
            flex: 1,
            padding: '0.8rem',
            borderRadius: '4px',
            border: '1px solid #333',
            background: '#1A1D1F',
            color: COLORS.text,
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isProcessing}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '4px',
            border: 'none',
            background: COLORS.accent,
            color: '#fff',
            cursor: isProcessing ? 'wait' : 'pointer',
            fontWeight: 'bold',
            transition: 'opacity 0.2s'
          }}
        >
          {isProcessing ? '...' : 'SEND'}
        </button>
      </form>
    </div>
  );
};
