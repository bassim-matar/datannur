<script lang="ts"></script>

<div class="loading-dot"></div>

<style lang="scss">
  .loading-dot:after {
    display: inline-block;
    animation: loading-dot steps(1, end) 3s infinite;
    content: '';
  }

  @keyframes loading-dot {
    0% {
      content: '...';
    }
    25% {
      content: '..';
    }
    50% {
      content: '.';
    }
    75% {
      content: '..';
    }
    100% {
      content: '...';
    }
  }
</style>
