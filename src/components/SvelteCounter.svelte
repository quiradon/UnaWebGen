<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<div class="counter">
  <p>Count: {count}</p>
  <button on:click={increment}>Increment</button>
</div>
