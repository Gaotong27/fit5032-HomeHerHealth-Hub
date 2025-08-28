<template>
  <div class="container py-5" style="max-width: 500px;">
    <h2 class="mb-4 text-center">Login or Register</h2>
    
    <!-- Login -->
    <form class="mb-4">
      <div class="mb-3">
        <label for="loginEmail" class="form-label">Email</label>
        <input type="email" class="form-control" id="loginEmail" placeholder="Enter your email" required>
      </div>
      <div class="mb-3">
        <label for="loginPassword" class="form-label">Password</label>
        <input type="password" class="form-control" id="loginPassword" placeholder="Enter password" required>
      </div>
      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>

    <!-- Register -->
    <form>
      <div class="mb-3">
        <label for="registerEmail" class="form-label">Email</label>
        <input type="email" class="form-control" id="registerEmail" placeholder="Enter your email" required>
      </div>
      <div class="mb-3">
        <label for="registerPassword" class="form-label">Password</label>
        <input type="password" class="form-control" id="registerPassword" placeholder="Create password" required>
      </div>
      <button type="submit" class="btn btn-success w-100">Register</button>
    </form>
  </div>
</template>
