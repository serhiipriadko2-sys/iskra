import { Fragment, type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  type BetaAccess,
  type BetaAccessDenyReason,
  getBetaSession,
  requestMagicLink,
  signOutBetaSession,
  supabase,
} from '../services/supabaseClient';
import { isE2eAuthBypassEnabled } from '../config/e2eAuth';
import { storageService } from '../services/storageService';

interface AuthGateProps {
  children: ReactNode;
}

type GateState =
  | { kind: 'loading' }
  | { kind: 'granted'; principalId: string }
  | { kind: 'storage-error' }
  | { kind: 'denied'; reason: BetaAccessDenyReason };

function toGateState(access: BetaAccess): GateState {
  if (access.status === 'granted') {
    return { kind: 'granted', principalId: access.session.userId };
  }

  return { kind: 'denied', reason: access.reason };
}

function accessMessage(reason: BetaAccessDenyReason): string {
  switch (reason) {
    case 'anonymous-session':
      return 'Гостевой вход не даёт доступа к закрытой beta. Войдите по приглашённому email.';
    case 'membership-inactive':
      return 'Этот аккаунт пока не активирован для закрытой beta.';
    case 'membership-unavailable':
      return 'Не удалось проверить доступ к закрытой beta. Обновите страницу или попробуйте позже.';
    case 'not-configured':
      return 'Закрытая beta ещё не настроена для этого окружения.';
    case 'no-session':
      return 'Войдите по magic link, отправленной на приглашённый email.';
  }
}

export default function AuthGate(props: AuthGateProps) {
  if (isE2eAuthBypassEnabled()) {
    storageService.bindPrincipal('e2e-local');
    return <>{props.children}</>;
  }

  return <ClosedBetaAuthGate {...props} />;
}

function ClosedBetaAuthGate({ children }: AuthGateProps) {
  const [gate, setGate] = useState<GateState>({ kind: 'loading' });
  const [email, setEmail] = useState('');
  const [requestState, setRequestState] = useState<{ kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ kind: 'idle' });
  const accessGeneration = useRef(0);

  const applyAccess = useCallback((access: BetaAccess): void => {
    try {
      if (access.status === 'granted') {
        storageService.bindPrincipal(access.session.userId);
      } else {
        storageService.releasePrincipal();
      }
      setGate(toGateState(access));
    } catch {
      storageService.releasePrincipal();
      setGate({ kind: 'storage-error' });
    }
  }, []);

  const refreshAccess = useCallback(async (): Promise<void> => {
    const generation = ++accessGeneration.current;
    try {
      const access = await getBetaSession();
      if (generation === accessGeneration.current) {
        applyAccess(access);
      }
    } catch {
      if (generation === accessGeneration.current) {
        applyAccess({ status: 'denied', reason: 'membership-unavailable' });
      }
    }
  }, [applyAccess]);

  const closeSignedOutBoundary = useCallback((): void => {
    accessGeneration.current += 1;
    try {
      storageService.releasePrincipal({ clear: true });
      setGate({ kind: 'denied', reason: 'no-session' });
    } catch {
      storageService.releasePrincipal();
      setGate({ kind: 'storage-error' });
    }
  }, []);

  useEffect(() => {
    void refreshAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        closeSignedOutBoundary();
        return;
      }
      void refreshAccess();
    });

    return () => {
      accessGeneration.current += 1;
      subscription.unsubscribe();
    };
  }, [closeSignedOutBoundary, refreshAccess]);

  const submitMagicLink = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setRequestState({ kind: 'sending' });

    const result = await requestMagicLink(email);
    if (result.ok) {
      setRequestState({ kind: 'sent', message: 'Ссылка отправлена. После перехода доступ проверится автоматически.' });
      return;
    }

    setRequestState({ kind: 'error', message: result.error });
  };

  const signOut = async (): Promise<void> => {
    try {
      await signOutBetaSession();
      closeSignedOutBoundary();
    } catch {
      setRequestState({ kind: 'error', message: 'Не удалось завершить сессию. Попробуйте ещё раз.' });
    }
  };

  if (gate.kind === 'granted') {
    return <Fragment key={gate.principalId}>{children}</Fragment>;
  }

  if (gate.kind === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-text" aria-busy="true">
        <p className="text-sm text-text-muted">Проверяем доступ к закрытой beta…</p>
      </main>
    );
  }

  if (gate.kind === 'storage-error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-text">
        <p className="text-sm text-red-400" role="alert">
          Не удалось безопасно открыть локальное хранилище. Разрешите доступ к данным сайта и обновите страницу.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-text">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-deep">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">IskraSpace · closed beta</p>
        <h1 className="mt-3 font-serif text-3xl">Вход по приглашению</h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">{accessMessage(gate.reason)}</p>

        <form className="mt-6 space-y-4" onSubmit={submitMagicLink}>
          <label className="block text-sm font-medium" htmlFor="beta-email">
            Приглашённый email
          </label>
          <input
            id="beta-email"
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text outline-none ring-primary focus:ring-2"
            type="email"
            autoComplete="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />
          <button
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={requestState.kind === 'sending'}
          >
            {requestState.kind === 'sending' ? 'Отправляем…' : 'Отправить magic link'}
          </button>
        </form>

        {requestState.message && (
          <p
            className={`mt-4 text-sm ${requestState.kind === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
            role={requestState.kind === 'error' ? 'alert' : 'status'}
          >
            {requestState.message}
          </p>
        )}

        {gate.reason !== 'no-session' && (
          <button
            className="mt-5 text-sm text-text-muted underline decoration-border underline-offset-4 hover:text-text"
            type="button"
            onClick={() => { void signOut(); }}
          >
            Выйти из текущей сессии
          </button>
        )}
      </section>
    </main>
  );
}
