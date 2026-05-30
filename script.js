fetch("https://script.google.com/u/0/home/projects/1wjqk-TrpsDxIuJJXAj4_R3w0VmTOZ44Pk5ouaSdToUHkDxoEt6xrAuC0/edit", {
  method: "POST",
  body: formData
})
  
const PRICE_BY_QUANTITY = {
  1: "110 DH",
  2: "190 DH",
  3: "270 DH",
  4: "350 DH",
};
const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = ["Rouge", "Blanc"];

const productImages = {
  Rouge: {
    front: "assets/maillot-rouge.jpg",
    back: "assets/maillot-rouge-dos.jpg",
    altFront: "Maillot Maroc rouge face avant",
    altBack: "Maillot Maroc rouge dos",
    theme: "theme-red",
  },
  Blanc: {
    front: "assets/maillot-blanc.jpg",
    back: "assets/maillot-blanc-dos.jpg",
    altFront: "Maillot Maroc blanc face avant",
    altBack: "Maillot Maroc blanc dos",
    theme: "theme-white",
  },
};

const form = document.querySelector("#orderForm");
const jerseyImage = document.querySelector("#jerseyImage");
const selectedColorLabel = document.querySelector("#selectedColorLabel");
const selectedSizeLabel = document.querySelector("#selectedSizeLabel");
const selectedSideLabel = document.querySelector("#selectedSideLabel");
const flipPreviewButton = document.querySelector("#flipPreviewButton");
const selectedPrice = document.querySelector("#selectedPrice");
const priceInput = form.querySelector('input[name="prix"]');
const colorsInput = form.querySelector('input[name="couleurs"]');
const sizesInput = form.querySelector('input[name="tailles"]');
const sizeGroups = document.querySelector("#sizeGroups");
const formStatus = document.querySelector("#formStatus");
const submitButton = form.querySelector(".submit-button");

let previewSide = "front";

function updateActiveChoices(groupName) {
  document.querySelectorAll(`input[name="${groupName}"]`).forEach((input) => {
    input.closest(".choice")?.classList.toggle("active", input.checked);
  });
}

function getDefaultColor() {
  return form.querySelector('input[name="couleur"]:checked')?.value || "Rouge";
}

function getQuantity() {
  return Number(form.querySelector('input[name="quantite"]:checked')?.value || 1);
}

function getSelectedSizes() {
  return Array.from(sizeGroups.querySelectorAll("input[data-kind='size']:checked")).map(
    (input) => input.value,
  );
}

function getSelectedColors() {
  const quantity = getQuantity();
  const defaultColor = getDefaultColor();

  if (quantity === 1) {
    return [defaultColor];
  }

  const extraColors = Array.from(
    sizeGroups.querySelectorAll("input[data-kind='color']:checked")
  ).map((input) => input.value);

  return [defaultColor, ...extraColors];
}

function formatChoiceLabel(colors, sizes, quantity) {
  if (quantity === 1) {
    return `${colors[0] || "Rouge"} / ${sizes[0] || "M"}`;
  }

  return colors
    .map((color, index) => `${index + 1}-${color} ${sizes[index] || "M"}`)
    .join(" / ");
}

function updateColor(color) {
  const product = productImages[color];
  if (!product) return;

  document.body.classList.remove("theme-red", "theme-white");
  document.body.classList.add(product.theme);
  jerseyImage.src = product[previewSide];
  jerseyImage.alt = previewSide === "front" ? product.altFront : product.altBack;
  selectedColorLabel.textContent = `Couleur: ${color}`;
  selectedSideLabel.textContent = previewSide === "front" ? "Face avant" : "Dos";
  flipPreviewButton.setAttribute(
    "aria-label",
    previewSide === "front" ? "Voir le dos du maillot" : "Voir la face avant du maillot",
  );
}

function updatePrice() {
  const quantity = getQuantity();
  const price = PRICE_BY_QUANTITY[quantity] || PRICE_BY_QUANTITY[1];

  const colors = getSelectedColors();
  const sizes = getSelectedSizes();

  selectedPrice.textContent = price;
  priceInput.value = price;
  colorsInput.value = colors.join(", ");
  sizesInput.value = sizes.join(", ");

  selectedSizeLabel.textContent =
    formatChoiceLabel(colors, sizes);

  updateColor(colors[0]);
}

function createItemColorOptions(index, selectedColor) {
  const label = document.createElement("span");
  label.className = "item-option-label";
  label.textContent = "Couleur";

  const options = document.createElement("div");
  options.className = "option-grid item-color-options";

  COLORS.forEach((color) => {
    const choice = document.createElement("label");
    choice.className = `choice${color === selectedColor ? " active" : ""}`;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `couleur_${index + 1}`;
    input.value = color;
    input.checked = color === selectedColor;
    input.dataset.kind = "color";

    const swatch = document.createElement("span");
    swatch.className = `mini-swatch ${color === "Rouge" ? "swatch-red" : "swatch-white"}`;

    const text = document.createElement("span");
    text.textContent = color;

    choice.append(input, swatch, text);
    options.appendChild(choice);
  });

  return [label, options];
}

function createItemSizeOptions(index, selectedSize) {
  const label = document.createElement("span");
  label.className = "item-option-label";
  label.textContent = "Taille";

  const options = document.createElement("div");
  options.className = "option-grid size-options";

  SIZES.forEach((size) => {
    const choice = document.createElement("label");
    choice.className = `choice${size === selectedSize ? " active" : ""}`;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `taille_${index + 1}`;
    input.value = size;
    input.checked = size === selectedSize;
    input.dataset.kind = "size";

    const text = document.createElement("span");
    text.textContent = size;

    choice.append(input, text);
    options.appendChild(choice);
  });

  return [label, options];
}

function renderSizeGroups() {
  const quantity = getQuantity();
  const previousSizes = getSelectedSizes();
  const previousColors = getSelectedColors();
  const defaultColor = getDefaultColor();

  sizeGroups.innerHTML = "";

  for (let index = 0; index < quantity; index += 1) {
    const selectedSize = previousSizes[index] || "M";

    const group = document.createElement("div");
    group.className = "size-group";

    const title = document.createElement("span");
    title.className = "size-group-title";
    title.textContent = `Maillot ${index + 1}`;
    group.appendChild(title);

    // First jersey uses the main color selection
    if (quantity > 1 && index > 0) {
      const selectedColor =
        previousColors[index] || defaultColor;

      group.append(
        ...createItemColorOptions(index, selectedColor)
      );
    }

    group.append(
      ...createItemSizeOptions(index, selectedSize)
    );

    sizeGroups.appendChild(group);
  }

  updatePrice();
}

document.querySelectorAll('input[name="couleur"]').forEach((input) => {
  input.addEventListener("change", () => {
    updateActiveChoices("couleur");
    renderSizeGroups();
    updateColor(input.value);
  });
});

document.querySelectorAll('input[name="quantite"]').forEach((input) => {
  input.addEventListener("change", () => {
    updateActiveChoices("quantite");
    renderSizeGroups();
  });
});

flipPreviewButton.addEventListener("click", () => {
  previewSide = previewSide === "front" ? "back" : "front";
  updateColor(getSelectedColors()[0] || getDefaultColor());
});

sizeGroups.addEventListener("change", (event) => {
  if (!event.target.matches("input[type='radio']")) return;

  const optionGrid = event.target.closest(".option-grid");
  optionGrid.querySelectorAll(".choice").forEach((choice) => {
    choice.classList.toggle("active", choice.contains(event.target));
  });

  updatePrice();
});

function setStatus(message, type = "") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

function buildOrderPayload() {
  const data = new FormData(form);
  data.append("source", window.location.href);
  data.append("date", new Date().toISOString());
  return new URLSearchParams(data);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!GOOGLE_SCRIPT_URL) {
    setStatus(
      "Ajoutez d'abord l'URL Google Apps Script dans script.js pour recevoir les commandes.",
      "error",
    );
    return;
  }

  submitButton.disabled = true;
  setStatus("Envoi de la commande...");

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: buildOrderPayload(),
    });

    form.reset();
    document.querySelector('input[name="couleur"][value="Rouge"]').checked = true;
    document.querySelector('input[name="quantite"][value="1"]').checked = true;
    updateActiveChoices("couleur");
    updateActiveChoices("quantite");
    renderSizeGroups();
    setStatus("Commande envoyée. Merci, nous vous contacterons rapidement.", "success");
  } catch (error) {
    setStatus("Impossible d'envoyer la commande. Vérifiez la connexion et l'URL Google Script.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

renderSizeGroups();
