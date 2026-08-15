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
const passModal = document.querySelector("#passModal");
const passPreviewImage = document.querySelector("#passPreviewImage");
const closePassModal = document.querySelector("#closePassModal");
const modalDownloadPass = document.querySelector("#modalDownloadPass");
const modalShareButton = document.querySelector("#modalShareButton");
let currentStep = 1;
let lastApplication = null;

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
function renderSuccess(data) { lastApplication = data; document.querySelector("#summaryUsername").textContent = `@${data.username}`; document.querySelector("#summaryNetwork").textContent = data.network; document.querySelector("#summaryWallet").textContent = shortAddress(data.wallet); document.querySelector("#summaryId").textContent = data.id; const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent("I just applied for the Horsehood NFT whitelist. The race is on! 🏇")}`; document.querySelector("#shareButton").href = shareUrl; modalShareButton.href = shareUrl; goToStep(4); showPassModal(data); }
function fitCanvasText(context, text, x, y, maxWidth, startSize, minSize = 18) { let size = startSize; context.font = `900 ${size}px system-ui, sans-serif`; while (context.measureText(text).width > maxWidth && size > minSize) { size -= 1; context.font = `900 ${size}px system-ui, sans-serif`; } context.fillText(text, x, y); }
function drawRacePass(data) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  context.fillStyle = "#071a21";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#c7ff00";
  context.fillRect(45, 45, width - 90, height - 90);
  context.strokeStyle = "#f7fbeb";
  context.lineWidth = 6;
  context.strokeRect(70, 70, width - 140, height - 140);
  context.fillStyle = "#071a21";
  context.fillRect(92, 92, 330, height - 184);
  context.fillStyle = "#c7ff00";
  context.font = "900 38px system-ui, sans-serif";
  context.fillText("HORSEHOOD", 125, 154);
  context.font = "900 18px system-ui, sans-serif";
  context.fillText("RACE PASS", 125, 190);
  context.font = "900 16px system-ui, sans-serif";
  context.fillText("WHITELIST ENTRY • 2026", 125, 220);
  context.font = "108px system-ui, sans-serif";
  context.fillText("♞", 125, 408);
  context.font = "900 35px system-ui, sans-serif";
  context.fillText("STARTING", 125, 540);
  context.fillText("GATE", 125, 585);
  context.fillText("ACCESS", 125, 630);
  context.fillStyle = "#071a21";
  context.font = "900 26px system-ui, sans-serif";
  context.fillText("RIDER", 475, 210);
  fitCanvasText(context, `@${data.username}`, 475, 270, 500, 48, 26);
  context.font = "900 26px system-ui, sans-serif";
  context.fillText("STABLE", 475, 405);
  context.font = "900 41px system-ui, sans-serif";
  context.fillText("ETHEREUM / EVM", 475, 465);
  context.font = "900 26px system-ui, sans-serif";
  context.fillText("WALLET", 475, 600);
  context.font = "900 39px system-ui, sans-serif";
  context.fillText(shortAddress(data.wallet), 475, 660);
  context.fillStyle = "#386001";
  context.fillRect(475, 762, 505, 3);
  context.fillStyle = "#071a21";
  context.font = "900 34px system-ui, sans-serif";
  context.fillText("ENTRY ACCEPTED", 475, 825);
  context.font = "700 18px system-ui, sans-serif";
  context.fillText("KEEP THIS PASS FOR THE RACE.", 475, 865);
  context.font = "700 16px system-ui, sans-serif";
  context.fillText(`PASS ID: ${data.id}`, 475, 915);
  context.fillStyle = "#071a21";
  for (let x = 475; x < 890; x += 14) { for (let y = 1020; y < 1160; y += 14) { if ((x + y) % 28 === 0) context.fillRect(x, y, 9, 9); } }
  return canvas;
}
function showPassModal(data) { passPreviewImage.src = drawRacePass(data).toDataURL("image/png"); passModal.hidden = false; document.body.style.overflow = "hidden"; closePassModal.focus(); }
function hidePassModal() { passModal.hidden = true; document.body.style.overflow = ""; }
function downloadRacePass() {
  const data = lastApplication || { username: xUsername.value.trim().replace(/^@+/, "") || ticketUsername.textContent.replace(/^@/, ""), wallet: walletAddress.value.trim() || "0x0000000000000000000000000000000000000000", id: document.querySelector("#summaryId").textContent || "HORSEHOOD" };
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
modalDownloadPass.addEventListener("click", downloadRacePass);
closePassModal.addEventListener("click", hidePassModal);
passModal.addEventListener("click", (event) => { if (event.target === passModal) hidePassModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !passModal.hidden) hidePassModal(); });
xUsername.addEventListener("input", () => { if (xUsername.value) validateUsername(); updateRacePass(); }); walletAddress.addEventListener("input", () => { if (walletAddress.value) validateWallet(); updateRacePass(); });
document.querySelector("#resetDemo").addEventListener("click", resetDemo);
document.querySelector("#heroHorseImage").addEventListener("error", (event) => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false; });
createStars(); restoreApplication();
updateRacePass();
