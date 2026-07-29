import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DepthConsentDialog from '../../components/DepthConsentDialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const renderDialog = async (
  onGrant = vi.fn(),
  onDeny = vi.fn(),
) => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <DepthConsentDialog
        open
        title="Разрешить глубокое исследование?"
        actionLabel="Разрешить исследование"
        contextItems={[
          'Введённая тема будет передана модели.',
          'Будут использованы найденные узлы памяти.',
        ]}
        onGrant={onGrant}
        onDeny={onDeny}
      />,
    );
  });

  return { onGrant, onDeny };
};

const buttonByText = (text: string): HTMLButtonElement | undefined =>
  Array.from(container?.querySelectorAll('button') ?? [])
    .find(button => button.textContent?.includes(text));

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  container?.remove();
  root = null;
  container = null;
});

describe('DepthConsentDialog', () => {
  it('shows the exact context and passes the selected expiry to grant', async () => {
    const { onGrant } = await renderDialog();

    expect(container?.textContent).toContain('Введённая тема будет передана модели.');
    expect(container?.textContent).toContain('Будут использованы найденные узлы памяти.');
    expect(container?.textContent).toContain('после использования');

    await act(async () => {
      buttonByText('1 час')?.click();
      buttonByText('Разрешить исследование')?.click();
    });

    expect(onGrant).toHaveBeenCalledWith(60);
  });

  it('records an explicit denial without invoking grant', async () => {
    const { onGrant, onDeny } = await renderDialog();

    await act(async () => {
      buttonByText('Не разрешать')?.click();
    });

    expect(onDeny).toHaveBeenCalledOnce();
    expect(onGrant).not.toHaveBeenCalled();
  });
});
