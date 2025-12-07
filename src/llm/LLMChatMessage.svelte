<script lang="ts">
  import { safeHtml } from '@lib/html-sanitizer'

  type MessageRole = 'user' | 'assistant' | 'tool'

  let {
    role,
    content,
    html,
    name,
    elementRef = $bindable(null),
  }: {
    role: MessageRole
    content: string
    html?: string
    name?: string
    elementRef?: HTMLElement | null
  } = $props()
</script>

{#if role === 'user'}
  <div class="message user">
    <div class="user-bubble">
      <div class="message-content">{content}</div>
    </div>
  </div>
{:else if role === 'tool'}
  <div class="message tool">
    <div class="tool-call-box">
      <div class="tool-call-header">
        <i class="fa-solid fa-database"></i>
        <span>{name ?? 'unknown'}</span>
      </div>
    </div>
  </div>
{:else if role === 'assistant' && content}
  <div class="message assistant" bind:this={elementRef}>
    <div class="message-content markdown" use:safeHtml={html ?? ''}></div>
  </div>
{/if}

<style lang="scss">
  @use 'main.scss' as *;

  .message {
    padding: 0 0.5rem;
    margin-bottom: 0;
    animation: slideIn 0.2s ease-out;

    &.user {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin: 10px auto;
      background: transparent;
    }

    &.assistant {
      background: transparent;
    }

    &.tool {
      background: transparent;
      padding: 0.25rem 0.5rem;
    }

    .user-bubble {
      display: inline-block;
      background: $background-2;
      padding: 0.75rem 1rem;
      border-radius: $rounded;
      max-width: 85%;

      .message-content {
        white-space: pre-wrap;
      }
    }

    .message-content {
      color: $color-1;
      word-wrap: break-word;

      &.markdown {
        :global(p) {
          margin: 0.5em 0;
          &:first-child {
            margin-top: 0;
          }
          &:last-child {
            margin-bottom: 0;
          }
        }

        :global(pre) {
          background: $background-3;
          padding: 0.75rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.75em 0;
          border: 1px solid $color-5;
        }

        :global(code) {
          background: $background-3;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }

        :global(pre code) {
          background: none;
          padding: 0;
          border: none;
        }

        :global(ul),
        :global(ol) {
          padding-left: 2em;
        }

        :global(ul) {
          list-style-type: disc;
        }

        :global(ol) {
          list-style-type: decimal;
        }

        :global(blockquote) {
          border-left: 3px solid $color-3;
          padding-left: 1em;
          margin: 0.75em 0;
          opacity: 0.9;
        }

        :global(a) {
          color: $color-3;
          text-decoration: none;
          border-bottom: 1px solid currentColor;

          &:hover {
            opacity: 0.8;
          }
        }

        :global(h1),
        :global(h2),
        :global(h3) {
          margin: 1em 0 0.5em;
          font-weight: 600;
        }
      }
    }

    .tool-call-box {
      display: inline-flex;
      align-items: center;
      background: $background-2;
      border: 1px solid $color-5;
      border-radius: $rounded;
      padding: 0.4rem 0.75rem;
      margin: 0.25rem 0;
      font-size: 0.85em;
      color: $color-2;
      opacity: 0.9;

      .tool-call-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i {
          font-size: 0.9em;
          color: $color-3;
        }

        span {
          font-weight: 500;
        }
      }
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
