/**
 * SHADOW VIEW - Shadow Protocol UI
 *
 * Canon: Shadow is where Iskra holds uncertain, raw, unexplored thoughts.
 * This view allows controlled access to shadow layer:
 * - Review shadow thoughts
 * - Promote shadow → archive (after verification)
 * - Understand the shadow-to-honesty journey
 */

import React, { useState, useEffect, useCallback } from 'react';
import { memoryService } from '../services/memoryService';
import { shadowPromotionService } from '../services/shadowPromotionService';
import { symbiosisService } from '../services/symbiosisService';
import { MemoryNode } from '../types';

interface ShadowViewProps {
  onClose?: () => void;
}

const ShadowView: React.FC<ShadowViewProps> = ({ onClose }) => {
  const [shadowNodes, setShadowNodes] = useState<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'uncertain'>('all');
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [promotionReasons, setPromotionReasons] = useState<string[]>([]);

  useEffect(() => {
    loadShadowNodes();
  }, [filter]);

  const loadShadowNodes = () => {
    let nodes = memoryService.getShadow();

    switch (filter) {
      case 'recent': {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        nodes = nodes.filter(n => new Date(n.timestamp).getTime() > weekAgo);
        break;
      }
      case 'uncertain':
        nodes = nodes.filter(n => n.tags?.includes('uncertain'));
        break;
    }

    // Sort by timestamp, newest first
    nodes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setShadowNodes(nodes);
  };

  const promoteToArchive = useCallback((node: MemoryNode) => {
    const consent = symbiosisService.grantConsent(
      'memory.promote.shadow',
      `Перенести выбранную запись Shadow "${node.title || node.id}" в Archive после проверки SIFT.`,
    );
    const result = shadowPromotionService.promote({
      node,
      userConfirmed: true,
      consent,
    });

    if (!result.ok) {
      setPromotionReasons(result.reasons);
      return;
    }

    setPromotionReasons([]);
    loadShadowNodes();
    setSelectedNode(null);
    setShowPromoteDialog(false);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    memoryService.deleteShadowNode(nodeId);
    loadShadowNodes();
    setSelectedNode(null);
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'insight': return '💡';
      case 'decision': return '🎯';
      case 'event': return '📅';
      case 'feedback': return '📝';
      case 'artifact': return '🔧';
      default: return '🌑';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="shadow-view" style={{
      backgroundColor: '#1a1a2e',
      minHeight: '100vh',
      padding: '20px',
      color: '#e0e0e0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid #333',
        paddingBottom: '16px',
      }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🌑</span>
            Shadow Protocol
          </h1>
          <p style={{ margin: '8px 0 0', color: '#888', fontSize: '14px' }}>
            Слой неопределенности. Сырые мысли. Путь к честности.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Закрыть
          </button>
        )}
      </div>

      {/* Warning Banner */}
      <div style={{
        backgroundColor: 'rgba(139, 69, 19, 0.3)',
        border: '1px solid #8B4513',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '24px' }}>⚠️</span>
        <div>
          <strong>Осторожно:</strong> Shadow содержит необработанные мысли.
          Они могут быть неточными, противоречивыми или болезненными.
          Здесь хранится то, что ещё не прошло проверку Искрива 🪞.
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
      }}>
        {(['all', 'recent', 'uncertain'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === f ? '#4a4a6a' : '#2a2a3e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {f === 'all' ? 'Все' : f === 'recent' ? 'Недавние' : 'Неопределенные'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#888' }}>
          {shadowNodes.length} записей
        </span>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Node List */}
        <div style={{
          flex: '1',
          maxWidth: '400px',
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
        }}>
          {shadowNodes.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
            }}>
              <span style={{ fontSize: '48px' }}>🌙</span>
              <p>Shadow пуст.</p>
              <p style={{ fontSize: '12px' }}>
                Сюда попадают мысли, требующие проверки.
              </p>
            </div>
          ) : (
            shadowNodes.map(node => (
              <div
                key={node.id}
                data-testid={`shadow-node-${node.id}`}
                onClick={() => setSelectedNode(node)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: selectedNode?.id === node.id ? '#3a3a5e' : '#2a2a3e',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${node.tags?.includes('uncertain') ? '#ff6b6b' : '#666'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{getNodeIcon(node.type)}</span>
                  <span style={{ fontWeight: 500 }}>
                    {node.title || 'Без названия'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  {formatDate(node.timestamp)}
                </div>
                {node.tags && node.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {node.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: '#444',
                          borderRadius: '4px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Node Detail */}
        {selectedNode && (
          <div style={{
            flex: '2',
            backgroundColor: '#2a2a3e',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getNodeIcon(selectedNode.type)}
                {selectedNode.title || 'Без названия'}
              </h2>
              <span style={{ color: '#888', fontSize: '14px' }}>
                {formatDate(selectedNode.timestamp)}
              </span>
            </div>

            {/* Content */}
            <div style={{
              backgroundColor: '#1a1a2e',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              whiteSpace: 'pre-wrap',
            }}>
              {typeof selectedNode.content === 'string'
                ? selectedNode.content
                : JSON.stringify(selectedNode.content, null, 2)}
            </div>

            {/* Tags */}
            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#888', fontSize: '12px' }}>Теги:</strong>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {selectedNode.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: tag === 'uncertain' ? '#8B4513' : '#444',
                        borderRadius: '4px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SIFT Info if available */}
            {selectedNode.sift && (
              <div style={{
                backgroundColor: '#3a3a5e',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
              }}>
                <strong>SIFT Блок:</strong>
                <div style={{ marginTop: '8px' }}>
                  <div>📍 Source: {selectedNode.sift.source}</div>
                  <div>🔍 Inference: {selectedNode.sift.inference}</div>
                  <div>✓ Fact: {selectedNode.sift.fact}</div>
                  <div>🔗 Trace: {selectedNode.sift.trace}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                data-testid="shadow-promote-open"
                onClick={() => {
                  setPromotionReasons([]);
                  setShowPromoteDialog(true);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>📚</span> Перенести в Archive
              </button>
              <button
                onClick={() => deleteNode(selectedNode.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#c62828',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🗑️</span> Удалить
              </button>
            </div>

            {/* Promote Dialog */}
            {showPromoteDialog && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}>
                <div style={{
                  backgroundColor: '#2a2a3e',
                  padding: '24px',
                  borderRadius: '12px',
                  maxWidth: '400px',
                }}>
                  <h3 style={{ margin: '0 0 16px' }}>
                    📚 Перенос в Archive
                  </h3>
                  <p style={{ color: '#ccc' }}>
                    Перенос выполняется только для этой записи и только после явного подтверждения.
                    Система проверит evidence, статус SIFT, одноразовый consent и сохранит receipt
                    с read-back результатом. Если любое условие не выполнено, запись останется в Shadow.
                  </p>
                  {promotionReasons.length > 0 && (
                    <div
                      data-testid="shadow-promotion-decision"
                      role="alert"
                      style={{
                        backgroundColor: 'rgba(198, 40, 40, 0.2)',
                        border: '1px solid #c62828',
                        borderRadius: '8px',
                        color: '#ffcdd2',
                        padding: '12px',
                        margin: '16px 0',
                      }}
                    >
                      Перенос заблокирован политикой: {promotionReasons.join(', ')}
                    </div>
                  )}
                  <div style={{
                    backgroundColor: '#1a1a2e',
                    padding: '12px',
                    borderRadius: '8px',
                    margin: '16px 0',
                  }}>
                    <strong>{selectedNode.title}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setPromotionReasons([]);
                        setShowPromoteDialog(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Отмена
                    </button>
                    <button
                      data-testid="shadow-promote-confirm"
                      onClick={() => promoteToArchive(selectedNode)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2e7d32',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Подтвердить
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#2a2a3e',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#888',
      }}>
        <strong style={{ color: '#ccc' }}>О Shadow Protocol:</strong>
        <p style={{ margin: '8px 0 0' }}>
          Shadow — это слой, где Искра хранит неопределенные, сырые, необработанные мысли.
          Здесь могут быть противоречия, незавершенные идеи, болезненные признания.
          Перенос в Archive означает, что информация прошла проверку и может использоваться
          как верифицированное знание.
        </p>
        <p style={{ margin: '8px 0 0' }}>
          <strong>Путь честности:</strong> Shadow → (проверка Искривом 🪞) → Archive
        </p>
      </div>
    </div>
  );
};

export default ShadowView;
