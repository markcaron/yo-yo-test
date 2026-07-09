import { css } from 'lit';

export const formStyles = css`
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--yy-text);
    margin-block-end: var(--yy-space-xs);
  }

  input,
  select {
    font: inherit;
    width: 100%;
    min-height: 44px;
    padding: var(--yy-space-sm) var(--yy-space-md);
    background: var(--yy-bg-primary);
    border: 1px solid var(--yy-border);
    border-radius: var(--yy-radius-md);
    color: var(--yy-text);
    transition: border-color var(--yy-transition-fast);
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--yy-accent);
    outline-offset: 2px;
    border-color: var(--yy-accent);
  }

  input::placeholder {
    color: var(--yy-text-muted);
  }
`;
