import { css } from 'lit';

export const buttonStyles = css`
  button {
    font: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--yy-space-sm);
    min-height: 44px;
    padding: var(--yy-space-sm) var(--yy-space-md);
    background: var(--yy-bg-surface);
    border: 1px solid var(--yy-border);
    border-radius: var(--yy-radius-md);
    color: var(--yy-text);
    transition: background var(--yy-transition-fast),
      border-color var(--yy-transition-fast);
  }

  button:hover {
    background: var(--yy-hover-overlay);
  }

  button:focus-visible {
    outline: 2px solid var(--yy-accent);
    outline-offset: 2px;
  }

  button.primary {
    background: var(--yy-accent);
    border-color: var(--yy-accent);
    color: var(--yy-text-white);
  }

  button.primary:hover {
    background: var(--yy-accent-hover);
    border-color: var(--yy-accent-hover);
  }

  button.danger {
    background: var(--yy-danger);
    border-color: var(--yy-danger);
    color: var(--yy-text-white);
  }

  button.danger:hover {
    background: var(--yy-danger-hover);
    border-color: var(--yy-danger-hover);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
