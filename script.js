"use strict";

const STORAGE_KEY = "pixelHorsesWhitelistApplication";
const APPLICATION_API_URL = "https://oaejqzflynzgcdulheng.supabase.co/functions/v1/submit-whitelist";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gIMwiHfvb0x34qlXzJpcGA_6QPgTnnn";
const form = document.querySelector("#whitelistForm");
const steps = [...document.querySelectorAll(".form-step")];
const progressItems = [...document.querySelectorAll(".progress li")];
const xUsername = document.querySelector("#xUsername");
const walletAddress = document.querySelector("#walletAddress");
const network = { value: "Ethereum / EVM" };
let currentStep = 1;

function createStars() {
  const container = document.querySelector(".pixel-stars");
  for (let i = 0; i < 38; i += 1) { const star = document.createElement("i"); star.className = "star"; star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 100}%`; star.style.setProperty("--speed", `${3 + Math.random() * 5}s`); container.append(star); }
}
function setError(id, message) { document.querySelector(`#${id}`).textContent = message; }
function setFieldState(input, valid) { const wrap = input.closest(".input-wrap"); wrap.classList.toggle("is-invalid", !valid); wrap.classList.toggle("is-valid", valid); }
function validateUsername() {
  const value = xUsername.value.trim().replace(/^@+/, "");
  xUsername.value = value;
  let message = "";
  if (!value) message = "Please enter your X username.";
  else if (/\s/.test(value)) message = "X usernames cannot contain spaces.";
  else if (value.length > 15) message = "X usernames can have up to 15 characters.";
  else if (!/^[A-Za-z0-9_]+$/.test(value)) message = "Use only letters, numbers and underscores.";
  setError("xUsernameError", message); setFieldState(xUsername, !message); return !message;
}
function validateMissions() { const valid = document.querySelector("#missionFollow").checked && document.querySelector("#missionPost").checked; setError("missionsError", valid ? "" : "Please confirm both missions to continue."); return valid; }
function walletMessage(value, selectedNetwork) {
  if (!value) return "Please enter your wallet address.";
  if (selectedNetwork === "Ethereum / EVM" && !/^0x[a-fA-F0-9]{40}$/.test(value)) return "Enter a valid EVM address: 0x followed by 40 hexadecimal characters.";
  return "";
}
function validateWallet() { const message = walletMessage(walletAddress.value.trim(), network.value); setError("walletError", message); setFieldState(walletAddress, !message); return !message; }
function validateConfirmation() { const valid = document.querySelector("#walletConfirm").checked; setError("confirmError", valid ? "" : "Please confirm that this wallet belongs to you."); return valid; }
function goToStep(step) { currentStep = step; steps.forEach((item) => { const active = Number(item.dataset.step) === step; item.hidden = !active; item.classList.toggle("active", active); }); progressItems.forEach((item, index) => { item.classList.toggle("active", index + 1 === step); item.classList.toggle("done", index + 1 < step); }); if (step < 4) document.querySelector(`[data-step="${step}"] input, [data-step="${step}"] select`)?.focus(); }
function nextStep() { if (currentStep === 1 && !validateUsername()) return; if (currentStep === 2 && !validateMissions()) return; goToStep(currentStep + 1); }
function shortAddress(address) { return `${address.slice(0, 6)}…${address.slice(-4)}`; }
function randomId() { return `PH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }
function renderSuccess(data) { document.querySelector("#summaryUsername").textContent = `@${data.username}`; document.querySelector("#summaryNetwork").textContent = data.network; document.querySelector("#summaryWallet").textContent = shortAddress(data.wallet); document.querySelector("#summaryId").textContent = data.id; document.querySelector("#shareButton").href = `https://x.com/intent/tweet?text=${encodeURIComponent("I just applied for the Horsehood NFT whitelist. The race is on! 🏇")}`; goToStep(4); }
async function submitApplication() {
  if (!validateWallet() || !validateConfirmation()) return;
  const button = document.querySelector("#submitButton");
  const defaultButtonContent = "Submit Application <span>→</span>";
  button.disabled = true;
  button.innerHTML = "Submitting <span class=\"loading\">•••</span>";
  setError("walletError", "");

  try {
    const response = await fetch(APPLICATION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        username: xUsername.value,
        wallet: walletAddress.value.trim(),
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "Your application could not be submitted. Please try again.");
    }

    renderSuccess({
      username: xUsername.value,
      network: network.value,
      wallet: walletAddress.value.trim(),
      id: result.id,
    });
  } catch (error) {
    setError("walletError", error instanceof Error ? error.message : "Your application could not be submitted. Please try again.");
  } finally {
    button.disabled = false;
    button.innerHTML = defaultButtonContent;
  }
}
function restoreApplication() { localStorage.removeItem(STORAGE_KEY); }
function resetDemo() { form.reset(); [xUsername, walletAddress].forEach((input) => setFieldState(input, false)); ["xUsernameError", "missionsError", "walletError", "confirmError"].forEach((id) => setError(id, "")); document.querySelector("#submitButton").innerHTML = "Submit Application <span>→</span>"; goToStep(1); }

form.addEventListener("keydown", (event) => { if (event.key === "Enter") event.preventDefault(); });
form.addEventListener("click", (event) => { const action = event.target.closest("[data-action]")?.dataset.action; if (action === "next") nextStep(); if (action === "back") goToStep(currentStep - 1); });
document.querySelector("#submitButton").addEventListener("click", submitApplication);
xUsername.addEventListener("input", () => { if (xUsername.value) validateUsername(); }); walletAddress.addEventListener("input", () => { if (walletAddress.value) validateWallet(); });
document.querySelector("#resetDemo").addEventListener("click", resetDemo);
document.querySelector("#heroHorseImage").addEventListener("error", (event) => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false; });
createStars(); restoreApplication();
