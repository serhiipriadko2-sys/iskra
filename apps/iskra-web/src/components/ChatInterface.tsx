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
  <div style={{ display: 'flex', gap: '1rem', color: COLORS.secondaryText, fontSize: '0.8rem' }}>
    <div>TRUST: {(metrics.trust * 100).toFixed(0)}%</div>
    <div>PAIN: {(metrics.pain * 100).toFixed(0)}%</div>
    <div>CHAOS: {(metrics.chaos * 100).toFixed(0)}%</div>
  </div>
);

export const ChatInterface: React.FC = () => {
  const { metrics, voice, superposition, processInput, isProcessing } = useEngine();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'iskra'; text: string; voice?: VoiceID }[]>([]);

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
      // In a real app, the engine would return generated text.
      // For now, we simulate a response based on the selected voice.
      const simulatedResponse = `[${response.voice}] processing complete. Resonance detected.`;

      setHistory(prev => [...prev, {
        role: 'iskra',
        text: simulatedResponse,
        voice: response.voice
      }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'iskra', text: 'Error: System Failure.' }]);
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
        borderBottom: `1px solid ${COLORS.secondaryText}`
      }}>
        <QuantumField metrics={metrics} superposition={superposition} width={window.innerWidth} height={300} />
      </div>

      {/* Metrics Bar */}
      <div style={{ padding: '0.5rem', background: '#00000033', textAlign: 'center' }}>
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
            color: msg.role === 'user' ? '#000' : COLORS.text
          }}>
            {msg.voice && (
              <div style={{ fontSize: '0.7rem', color: COLORS.accent, marginBottom: '0.2rem' }}>
                {msg.voice}
              </div>
            )}
            {msg.text}
          </div>
        ))}
        {isProcessing && <div style={{ color: COLORS.secondaryText, fontStyle: 'italic' }}>Thinking...</div>}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter the rhythm..."
          style={{
            flex: 1,
            padding: '0.8rem',
            borderRadius: '4px',
            border: 'none',
            background: '#1A1D1F',
            color: COLORS.text
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
            cursor: isProcessing ? 'wait' : 'pointer'
          }}
        >
          SEND
        </button>
      </form>
    </div>
  );
};
