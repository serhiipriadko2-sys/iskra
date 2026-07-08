import { supabase } from './supabaseClient';

export type IskraAgentTrace = {
  facts: unknown[];
  hypotheses: unknown[];
  risks: unknown[];
};

export type IskraAgentInvokePayload = {
  message: string;
  route?: string;
  phase?: string;
  request_id?: string;
  context?: Record<string, unknown>;
};

export type IskraAgentInvokeResult = {
  reply: string;
  status: 'ok' | 'partial' | 'blocked' | 'error';
  actions: unknown[];
  trace: IskraAgentTrace;
  delta: Record<string, unknown>;
  artifact_receipt: Record<string, unknown> | null;
  request_id: string;
};
export async function invokeIskraAgent(
  payload: IskraAgentInvokePayload,
): Promise<IskraAgentInvokeResult> {
  const { data, error } = await supabase.functions.invoke<IskraAgentInvokeResult>('iskra-agent', {
    body: {
      route: 'chat',
      phase: 'runtime',
      ...payload,
      context: {
        sift: true,
        delta_receipt: true,
        ...(payload.context ?? {}),
      },
    },
  });

  if (error) {
    throw new Error(`iskra-agent invoke failed: ${error.message}`);
  }

  if (!data) {
    throw new Error('iskra-agent returned empty response');
  }

  return data;
}
