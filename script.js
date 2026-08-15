"use strict";

const STORAGE_KEY = "pixelHorsesWhitelistApplication";
const APPLICATION_API_URL = "https://oaejqzflynzgcdulheng.supabase.co/functions/v1/submit-whitelist";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWpxemZseW56Z2NkdWxoZW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODYwMTUsImV4cCI6MjEwMjM2MjAxNX0.S2_V-G9qs9JmO18YVe66I32vhWkO006e_YOb5JMsEiI";
const form = document.querySelector("#whitelistForm");
const steps = [...document.querySelectorAll(".form-step")];
const progressItems = [...document.querySelectorAll(".progress li")];
const xUsername = document.querySelector("#xUsername");
const walletAddress = document.querySelector("#walletAddress");
const network = { value: "Ethereum / EVM" };
const ticketUsername = document.querySelector("#ticketUsername");
const ticketWallet = document.querySelector("#ticketWallet");
const ticketStatus = document.querySelector("#ticketStatus");
const downloadPassButton = document.querySelector("#downloadPassButton");
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
function updateRacePass() { const username = xUsername.value.trim().replace(/^@+/, ""); const wallet = walletAddress.value.trim(); ticketUsername.textContent = username ? `@${username}` : "AWAITING RIDER"; ticketWallet.textContent = wallet ? shortAddress(wallet) : "AWAITING WALLET"; const labels = ["ENTRY PENDING", "RIDER CHECK", "MISSIONS CHECKED", "WALLET CHECK", "ENTRY ACCEPTED"]; ticketStatus.textContent = labels[currentStep] || labels[0]; }
function goToStep(step) { currentStep = step; steps.forEach((item) => { const active = Number(item.dataset.step) === step; item.hidden = !active; item.classList.toggle("active", active); }); progressItems.forEach((item, index) => { item.classList.toggle("active", index + 1 === step); item.classList.toggle("done", index + 1 < step); }); updateRacePass(); if (step < 4) document.querySelector(`[data-step="${step}"] input, [data-step="${step}"] select`)?.focus(); }
function nextStep() { if (currentStep === 1 && !validateUsername()) return; if (currentStep === 2 && !validateMissions()) return; goToStep(currentStep + 1); }
function shortAddress(address) { return `${address.slice(0, 6)}…${address.slice(-4)}`; }
function randomId() { return `PH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }
function renderSuccess(data) { document.querySelector("#summaryUsername").textContent = `@${data.username}`; document.querySelector("#summaryNetwork").textContent = data.network; document.querySelector("#summaryWallet").textContent = shortAddress(data.wallet); document.querySelector("#summaryId").textContent = data.id; document.querySelector("#shareButton").href = `https://x.com/intent/tweet?text=${encodeURIComponent("I just applied for the Horsehood NFT whitelist. The race is on! 🏇")}`; goToStep(4); }
function drawRacePass(data) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = 1200;
  const height = 675;
  canvas.width = width;
  canvas.height = height;

  context.fillStyle = "#071a21";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#c7ff00";
  context.fillRect(42, 42, width - 84, height - 84);
  context.strokeStyle = "#f7fbeb";
  context.lineWidth = 6;
  context.strokeRect(64, 64, width - 128, height - 128);
  context.fillStyle = "#071a21";
  context.fillRect(80, 80, 360, height - 160);
  context.fillStyle = "#c7ff00";
  context.font = "900 30px system-ui, sans-serif";
  context.fillText("HORSEHOOD", 116, 132);
  context.font = "900 20px system-ui, sans-serif";
  context.fillText("RACE PASS • WHITELIST ENTRY 2026", 116, 171);
  context.font = "100px system-ui, sans-serif";
  context.fillText("♞", 116, 305);
  context.font = "900 45px system-ui, sans-serif";
  context.fillText("STARTING GATE", 116, 382);
  context.fillText("ACCESS", 116, 432);
  context.fillStyle = "#071a21";
  context.font = "900 28px system-ui, sans-serif";
  context.fillText("RIDER", 505, 175);
  context.font = "900 42px system-ui, sans-serif";
  context.fillText(`@${data.username}`, 505, 223);
  context.font = "900 28px system-ui, sans-serif";
  context.fillText("STABLE", 505, 310);
  context.font = "900 42px system-ui, sans-serif";
  context.fillText("ETHEREUM / EVM", 505, 358);
  context.font = "900 28px system-ui, sans-serif";
  context.fillText("WALLET", 505, 445);
  context.font = "900 36px system-ui, sans-serif";
  context.fillText(shortAddress(data.wallet), 505, 493);
  context.fillStyle = "#386001";
  context.fillRect(505, 543, 545, 3);
  context.fillStyle = "#071a21";
  context.font = "900 25px system-ui, sans-serif";
  context.fillText("ENTRY ACCEPTED", 505, 590);
  context.font = "700 18px system-ui, sans-serif";
  context.fillText(`PASS ID: ${data.id}`, 505, 622);
  return canvas;
}
function downloadRacePass() {
  const data = { username: xUsername.value.trim().replace(/^@+/, "") || ticketUsername.textContent.replace(/^@/, ""), wallet: walletAddress.value.trim() || "0x0000000000000000000000000000000000000000", id: document.querySelector("#summaryId").textContent || "HORSEHOOD" };
  const link = document.createElement("a");
  link.href = drawRacePass(data).toDataURL("image/png");
  link.download = `horsehood-race-pass-${data.username.toLowerCase().replace(/[^a-z0-9_]/g, "") || "rider"}.png`;
  document.body.append(link);
  link.click();
  link.remove();
}
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
downloadPassButton.addEventListener("click", downloadRacePass);
xUsername.addEventListener("input", () => { if (xUsername.value) validateUsername(); updateRacePass(); }); walletAddress.addEventListener("input", () => { if (walletAddress.value) validateWallet(); updateRacePass(); });
document.querySelector("#resetDemo").addEventListener("click", resetDemo);
document.querySelector("#heroHorseImage").addEventListener("error", (event) => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false; });
createStars(); restoreApplication();
updateRacePass();
