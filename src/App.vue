<script setup>
import { ref } from "vue";
import { BrowserProvider } from "ethers";

// One template literal: Vite bakes GREETING_TAG in at build time, so the
// built bundle contains the full contiguous string.
const greeting = `hello world oxzoo-web3-vue_${import.meta.env.GREETING_TAG}`;

const address = ref("");
const message = ref("");
const connecting = ref(false);

function truncate(addr) {
  return `${addr.slice(0, 6)}\u2026${addr.slice(-4)}`;
}

async function connect() {
  message.value = "";
  address.value = "";
  if (!window.ethereum) {
    message.value = "No injected wallet found \u2014 install MetaMask to connect.";
    return;
  }
  connecting.value = true;
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    address.value = await signer.getAddress();
  } catch (err) {
    message.value = `Wallet connection failed: ${err?.message ?? "unknown error"}`;
  } finally {
    connecting.value = false;
  }
}
</script>

<template>
  <main class="card">
    <h1>oxzoo-web3-vue</h1>
    <p class="greeting">{{ greeting }}</p>
    <button class="connect" type="button" :disabled="connecting" @click="connect">
      {{ connecting ? "Connecting\u2026" : "Connect Wallet" }}
    </button>
    <p v-if="address" class="wallet">wallet: {{ truncate(address) }}</p>
    <p v-if="message" class="message">{{ message }}</p>
  </main>
</template>
