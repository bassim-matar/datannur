<div class="loading_dot"></div>

<style lang="scss">

  .loading_dot:after {
    display: inline-block;
    animation: loading_dot steps(1, end) 3s infinite;
    content: "";
  }

  @keyframes loading_dot {
    0% {
      content: "...";
    }
    25% {
      content: "..";
    }
    50% {
      content: ".";
    }
    75% {
      content: "..";
    }
    100% {
      content: "...";
    }
  }
</style>
