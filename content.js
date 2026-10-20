
(() => {
  "use strict";

  // ============================================================
  // 1. CONFIGURAÇÃO CENTRALIZADA
  // Altere os seletores daqui para adaptar ao sistema corporativo.
  // ============================================================

  const CONFIG = {
    appName: "Precifica Assistente",
    defaultLabelQuantity: "1",
    allowLabelFallback: true,

    shortcuts: {
      copyAll: { alt: true, shift: true, key: "a" },
      fillAll: { alt: true, shift: true, key: "v" }
    },

    // fields: {
    //   title: {
    //     enabled: true,
    //     label: "Título",
    //     selectors: [
    //       "#titulo",
    //       "#title",
    //       'input[name="titulo"]',
    //       'textarea[name="titulo"]',
    //       'input[name="title"]',
    //       'textarea[name="title"]',
    //       '[data-field="title"]'
    //     ],
    //     labels: [
    //       /título do produto/i,
    //       /^título$/i,
    //       /^nome do produto$/i
    //     ],
    //     type: "text"
    //   },

    //   price: {
    //     enabled: true,
    //     label: "Preço",
    //     selectors: [
    //       "#preco",
    //       "#price",
    //       'input[name="preco"]',
    //       'input[name="price"]',
    //       '[data-field="price"]'
    //     ],
    //     labels: [
    //       /preço do produto/i,
    //       /^preço$/i,
    //       /^valor$/i
    //     ],
    //     type: "text"
    //   },

    //   image: {
    //     enabled: true,
    //     label: "Foto / URL da imagem",
    //     selectors: [
    //       "#image_url",
    //       "#imageUrl",
    //       "#foto_url",
    //       "#imagem_url",
    //       'input[name="image_url"]',
    //       'input[name="imageUrl"]',
    //       'input[name="foto_url"]',
    //       'input[name="imagem_url"]',
    //       '[data-field="image-url"]'
    //     ],
    //     labels: [
    //       /url da imagem/i,
    //       /link da imagem/i
    //     ],
    //     type: "url"
    //   },

    //   category: {
    //     enabled: true,
    //     label: "Categoria pai",
    //     selectors: [
    //       "#categoria",
    //       "#category",
    //       "#categoriaPai",
    //       "#categoria_pai",
    //       'select[name="categoria"]',
    //       'select[name="category"]',
    //       'select[name="categoriaPai"]',
    //       'select[name="categoria_pai"]',
    //       '[data-field="parent-category"]'
    //     ],
    //     labels: [
    //       /categoria pai/i,
    //       /^categoria$/i
    //     ],
    //     type: "select"
    //   },

    //   labelQuantity: {
    //     enabled: false,
    //     label: "Quantidade de etiquetas",
    //     selectors: [
    //       "#quantidadeEtiquetas",
    //       "#quantidade_etiquetas",
    //       "#labelQuantity",
    //       "#label_quantity",
    //       'input[name="quantidadeEtiquetas"]',
    //       'input[name="quantidade_etiquetas"]',
    //       'input[name="labelQuantity"]',
    //       'input[name="label_quantity"]'
    //     ],
    //     labels: [
    //       /quantidade de etiquetas/i,
    //       /^quantidade$/i
    //     ],
    //     type: "text"
    //   }
    // },

    fields: {
      title: {
        enabled: true,
        label: "Nome",
        selectors: [],
        labels: [/^nome$/i],
        type: "text"
      },
      price: {
        enabled: true,
        label: "Preço original (ML)",
        selectors: [],
        labels: [/^preço original\s*\(\s*ml\s*\)$/i],
        type: "number"
      },
      image: {
        enabled: false,
        label: "Imagem do produto",
        selectors: [],
        labels: [],
        type: "manual"
      },
      category: {
        enabled: true,
        label: "Categoria ML",
        selectors: [],
        labels: [/^categoria ml$/i],
        type: "select"
      },
      labelQuantity: {
        enabled: true,
        label: "Quantidade",
        selectors: [],
        labels: [/^quantidade$/i],
        type: "text"
      },
      search: {
        enabled: true,
        inputSelector: "input.ds-search-input",
        buttonText: "Buscar"
      }
    },

    // Se preenchido, permite usar este texto como categoria
    // quando o rascunho estiver sem categoria.
    categoryOptionText: "",

    // Não preencher automaticamente até confirmar o seletor real.
    fillLabelQuantity: false
  };

  // ============================================================
  // 2. PROTEÇÃO CONTRA INICIALIZAÇÃO DUPLICADA
  // ============================================================

  const ROOT_ID = "precifica-assistente-root";

  if (document.getElementById(ROOT_ID)) return;

  // ============================================================
  // 3. INTERFACE FLUTUANTE
  // ============================================================

  const root = document.createElement("div");
  root.id = ROOT_ID;

  root.innerHTML = `
    <button class="pa-float" id="pa-toggle"
      title="Abrir Precifica Assistente"
      aria-label="Abrir Precifica Assistente"
      aria-expanded="false">PA</button>

    <section class="pa-panel" id="pa-panel" hidden
      role="dialog" aria-label="Precifica Assistente">

      <header class="pa-header">
        <div>
          <h2 class="pa-heading">Precifica Assistente</h2>
          <div class="pa-subtitle">
            Captura e preenchimento assistido
          </div>
        </div>
        <button class="pa-close" id="pa-close"
          aria-label="Fechar painel">✕</button>
      </header>

      <label class="pa-label" for="pa-title">
        Título do produto
      </label>
      <textarea class="pa-input" id="pa-title" rows="2"
        placeholder="Nome do produto"></textarea>

      <label class="pa-label" for="pa-gtin">
        GTIN / EAN do produto
      </label>
      <input
        class="pa-input"
        id="pa-gtin"
        placeholder="GTIN-8, UPC-12, EAN-13 ou GTIN-14"
      />
      <button class="pa-button" id="pa-search-gtin">
        Buscar GTIN com Gemini
      </button>

      <label class="pa-label" for="pa-price">
        Preço de referência (R$)
      </label>
      <input class="pa-input" id="pa-price"
        placeholder="Ex.: 249,90" inputmode="decimal">

      <label class="pa-label" for="pa-image">
        URL da imagem
      </label>
      <input class="pa-input" id="pa-image"
        placeholder="https://..." type="url">

      <label class="pa-label" for="pa-category-level1">
        Categoria ML — nível 1
      </label>
      <input
        class="pa-input"
        id="pa-category-level1"
        placeholder="Categoria principal"
      />

      <label class="pa-label" for="pa-category-level2">
        Categoria ML — nível 2
      </label>
      <input
        class="pa-input"
        id="pa-category-level2"
        placeholder="Subcategoria"
      />

      <label class="pa-label" for="pa-quantity">
        Quantidade de etiquetas
      </label>
      <input class="pa-input" id="pa-quantity"
        type="number" min="1" step="1" value="1">

      <label class="pa-label" for="pa-source">
        Fonte do anúncio
      </label>
      <input class="pa-input" id="pa-source" readonly>

      <img id="pa-preview" class="pa-image"
        hidden alt="Prévia do produto">

      <button class="pa-button" id="pa-capture">
        Capturar anúncio desta página
      </button>

      <button class="pa-button" id="pa-copy">
        Copiar todos os dados (Alt + Shift + A)
      </button>

      <button class="pa-button" id="pa-fill">
        Preencher campos (Alt + Shift + V)
      </button>

      <button class="pa-button secondary" id="pa-save">
        Salvar revisão
      </button>

      <button class="pa-button secondary" id="pa-clear">
        Limpar rascunho
      </button>

      <p class="pa-status" id="pa-status"
        role="status" aria-live="polite"></p>

      <pre class="pa-report" id="pa-report" hidden></pre>

      <p class="pa-note">
        Confira os dados antes de cadastrar.
        Nenhum cadastro ou impressão será confirmado automaticamente.
      </p>
    </section>
  `;

  document.documentElement.appendChild(root);

  const $ = (id) => root.querySelector("#" + id);
  const panel = $("pa-panel");
  const toggle = $("pa-toggle");
  const status = $("pa-status");
  const report = $("pa-report");

  function say(message, error = false) {
    status.textContent = message;
    status.style.color = error ? "#b42318" : "#164e63";
  }

  function showReport(results) {
    report.textContent = results.map((item) =>
      `${item.ok ? "✓" : "•"} ${item.field}: ${item.reason}`
    ).join("\n");

    report.hidden = false;
  }

  // ============================================================
  // 4. RASCUNHO LOCAL
  // Trata falhas de armazenamento e contexto da extensão.
  // ============================================================

  function getDraft() {
    return {
      title: $("pa-title")?.value?.trim() || "",
      price: $("pa-price")?.value?.trim() || "",
      imageUrl: $("pa-image")?.value?.trim() || "",
      category: $("pa-category-level1")?.value?.trim() || "",
      categoryLevel1: $("pa-category-level1")?.value?.trim() || "",
      categoryLevel2: $("pa-category-level2")?.value?.trim() || "",
      labelQuantity: $("pa-quantity")?.value?.trim() || "1",
      sourceUrl: $("pa-source")?.value?.trim() || "",
      updatedAt: new Date().toISOString()
    };
  }

  function render(data = {}) {
    $("pa-title").value = data.title || "";
    $("pa-price").value = data.price || "";
    $("pa-image").value = data.imageUrl || "";
    $("pa-category-level1").value = data.categoryLevel1 || "";
    $("pa-category-level2").value = data.categoryLevel2 || "";
    $("pa-quantity").value =
      data.labelQuantity || CONFIG.defaultLabelQuantity;
    $("pa-source").value = data.sourceUrl || "";

    const preview = $("pa-preview");
    preview.hidden = true;
    preview.removeAttribute("src");

    if (data.imageUrl) {
      preview.onload = () => {
        preview.hidden = false;
      };

      preview.onerror = () => {
        preview.hidden = true;
      };

      preview.src = data.imageUrl;
    }
  }

  function storageAvailable() {
    return typeof chrome !== "undefined" &&
      !!chrome.storage?.local;
  }

  async function saveDraft() {
    if (!storageAvailable()) {
      throw new Error(
        "Contexto da extensão indisponível. Recarregue a página."
      );
    }

    await chrome.storage.local.set({
      productDraft: getDraft()
    });

    return getDraft();
  }

  async function loadDraft() {
    if (!storageAvailable()) {
      throw new Error(
        "Contexto da extensão indisponível. Recarregue a página."
      );
    }

    const result = await chrome.storage.local.get("productDraft");
    render(result.productDraft || {});
  }

  // ============================================================
  // 5. CAPTURA DO ANÚNCIO
  // ============================================================

  function extractFromPage() {
    const meta = (selector) =>
      document.querySelector(selector)?.content?.trim() || "";

    const clean = (value) =>
      String(value || "").replace(/\s+/g, " ").trim();

    let title =
      meta('meta[property="og:title"]') ||
      meta('meta[name="twitter:title"]') ||
      clean(document.querySelector("h1")?.innerText) ||
      clean(document.title);

    let imageUrl =
      meta('meta[property="og:image"]') ||
      meta('meta[name="twitter:image"]');

    let price =
      meta('meta[property="product:price:amount"]') ||
      meta('meta[property="og:price:amount"]') ||
      meta('meta[itemprop="price"]') ||
      meta('meta[name="price"]') ||
      document.querySelector('[itemprop="price"]')?.getAttribute("content") ||
      document.querySelector('[itemprop="price"]')?.innerText ||
      "";

    const objects = [];

    function visit(node) {
      if (!node || typeof node !== "object") return;

      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }

      objects.push(node);

      if (node["@graph"]) visit(node["@graph"]);
      if (node.itemListElement) visit(node.itemListElement);
    }

    document.querySelectorAll(
      'script[type="application/ld+json"]'
    ).forEach((script) => {
      try {
        visit(JSON.parse(script.textContent));
      } catch {
        // Ignora JSON inválido.
      }
    });

    const product = objects.find((obj) => {
      const types = Array.isArray(obj["@type"])
        ? obj["@type"]
        : [obj["@type"]];

      return types.some(
        (type) => String(type).toLowerCase() === "product"
      );
    });

    if (product) {
      title = title || clean(product.name);

      const image = Array.isArray(product.image)
        ? product.image[0]
        : product.image;

      imageUrl = imageUrl ||
        (typeof image === "string" ? image : image?.url) ||
        "";

      const offers = Array.isArray(product.offers)
        ? product.offers[0]
        : product.offers;

      const rawPrice = offers?.price ?? offers?.lowPrice;

      price = price ||
        (rawPrice != null ? String(rawPrice) : "");
    }

    if (price) {
      price = String(price)
        .replace(/[^\d,.-]/g, "")
        .trim();

      if (/^\d+\.\d{2}$/.test(price)) {
        price = price.replace(".", ",");
      }
    }

    try {
      imageUrl = imageUrl
        ? new URL(imageUrl, location.href).href
        : "";
    } catch {
      imageUrl = "";
    }

    const categories = extractMercadoLivreCategory();

    return {
      title,
      price,
      imageUrl,
      category: categories.categoryLevel1 || "",
      categoryLevel1: categories.categoryLevel1 || "",
      categoryLevel2: categories.categoryLevel2 || "",
      labelQuantity: CONFIG.defaultLabelQuantity,
      sourceUrl: location.href
    };
  }


  const GEMINI_API_KEY = "AIzaSyC2Z8HMBJdr_MZ8GabPd5-JFvf528SerV0";
  const GEMINI_MODEL = "gemini-3.8-flash";

  function isValidGTIN(code) {
    if (!/^(?:\d{8}|\d{12,14})$/.test(code)) {
      return false;
    }

    const digits = code.split("").map(Number);
    const checkDigit = digits.pop();

    let sum = 0;

    for (let i = digits.length - 1, position = 0;
      i >= 0;
      i--, position++) {
      sum += digits[i] * (position % 2 === 0 ? 3 : 1);
    }

    return (10 - (sum % 10)) % 10 === checkDigit;
  }

  async function searchGtinWithGemini() {
    const title = $("pa-title").value.trim();
    const sourceUrl = $("pa-source").value.trim();
    const button = $("pa-search-gtin");

    if (!GEMINI_API_KEY ||
      GEMINI_API_KEY === "COLE_SUA_CHAVE_AQUI") {
      say("Configure sua chave da API do Gemini no código.", true);
      return;
    }

    if (!title) {
      say("Capture ou informe o título do produto primeiro.", true);
      return;
    }

    button.disabled = true;
    say("Pesquisando GTIN na web com o Gemini...");

    try {
      const prompt = `
Pesquise na web o código de barras GTIN/EAN deste produto.

Título: ${title}
Página de origem: ${sourceUrl || "Não informada"}

Regras:
- Pesquise o produto exato, incluindo marca, modelo e variante.
- Priorize fabricante, catálogo oficial e fontes confiáveis.
- Não invente nem deduza um GTIN sem evidência.
- Não confunda códigos de modelos, cores, tamanhos ou kits diferentes.
- Informe um candidato apenas se houver evidência de correspondência.
- GTIN pode ter 8, 12, 13 ou 14 dígitos.
- Se não encontrar evidência suficiente, diga "NÃO ENCONTRADO".
- Cite as URLs das fontes que sustentam o resultado.

Responda em português com:
Produto identificado:
GTIN candidato:
Marca e modelo:
Evidência:
Fontes:
Confiança: alta, média ou baixa.
`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        GEMINI_MODEL + ":generateContent?key=" +
        encodeURIComponent(GEMINI_API_KEY),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            tools: [{
              google_search: {}
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1200
            }
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
          `Erro HTTP ${response.status}`
        );
      }

      const answer = (
        result.candidates?.[0]?.content?.parts || []
      )
        .map(part => part.text || "")
        .join("\n")
        .trim();

      if (!answer) {
        throw new Error("O Gemini não retornou um resultado.");
      }

      // Extrai possíveis códigos de 8, 12, 13 ou 14 dígitos.
      const candidates = [
        ...new Set(
          answer.match(/(?<!\d)\d{8}|\d{12,14}(?!\d)/g) || []
        )
      ];

      // Não preenche automaticamente códigos sem dígito
      // verificador válido.
      const valid = candidates.filter(isValidGTIN);

      if (valid.length === 1) {
        $("pa-gtin").value = valid[0];
      } else {
        $("pa-gtin").value = "";
      }

      // Exibe a resposta e as fontes para conferência.
      let sources = [];

      for (const candidate of result.candidates || []) {
        const chunks =
          candidate.groundingMetadata?.groundingChunks || [];

        for (const chunk of chunks) {
          const web = chunk.web;

          if (web?.uri) {
            sources.push({
              title: web.title || web.uri,
              uri: web.uri
            });
          }
        }
      }

      sources = sources.filter(
        (source, index, array) =>
          array.findIndex(item => item.uri === source.uri) === index
      );

      const sourceText = sources.length
        ? "\n\nFontes retornadas pela pesquisa:\n" +
        sources.map(source =>
          `${source.title}\n${source.uri}`
        ).join("\n\n")
        : "\n\nNenhuma fonte verificável foi retornada pela ferramenta.";

      report.textContent =
        answer + sourceText +
        (valid.length === 1
          ? "\n\nGTIN candidato preenchido. Confirme se pertence à variante exata."
          : "\n\nNenhum GTIN único com dígito verificador válido foi preenchido.");

      report.hidden = false;

      say(
        valid.length === 1
          ? "GTIN candidato encontrado. Confira as fontes antes de usar."
          : "Pesquisa concluída, mas não foi possível validar um GTIN único.",
        valid.length !== 1
      );
    } catch (error) {
      console.error("[Precifica Assistente] Gemini:", error);
      say("Erro na pesquisa do GTIN: " + error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  function extractMercadoLivreCategory() {
    const clean = (value) =>
      String(value || "").replace(/\s+/g, " ").trim();

    const normalize = (value) =>
      clean(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");

    // Primeiro tenta a trilha de navegação do anúncio.
    const selectors = [
      'nav[aria-label*="breadcrumb" i] a',
      ".ui-breadcrumb a",
      ".andes-breadcrumb a",
      'ol[class*="breadcrumb"] a'
    ];

    for (const selector of selectors) {
      const links = [
        ...document.querySelectorAll(selector)
      ];

      const names = links
        .map((el) => clean(el.innerText))
        .filter(Boolean);

      if (names.length >= 2) {
        // Usa os dois últimos itens da trilha,
        // que normalmente representam as categorias mais específicas.
        return {
          categoryLevel1: names[names.length - 2],
          categoryLevel2: names[names.length - 1]
        };
      }
    }

    // Fallback: procura BreadcrumbList no JSON-LD.
    function visit(node) {
      if (!node || typeof node !== "object") return null;

      if (Array.isArray(node)) {
        for (const item of node) {
          const result = visit(item);
          if (result) return result;
        }
        return null;
      }

      const types = Array.isArray(node["@type"])
        ? node["@type"]
        : [node["@type"]];

      if (types.includes("BreadcrumbList")) {
        const names = (node.itemListElement || [])
          .map((item) =>
            clean(item?.item?.name || item?.name)
          )
          .filter(Boolean);

        if (names.length >= 2) {
          return {
            categoryLevel1: names[names.length - 2],
            categoryLevel2: names[names.length - 1]
          };
        }
      }

      for (const value of Object.values(node)) {
        const result = visit(value);
        if (result) return result;
      }

      return null;
    }

    for (const script of document.querySelectorAll(
      'script[type="application/ld+json"]'
    )) {
      try {
        const result = visit(JSON.parse(script.textContent));
        if (result) return result;
      } catch {
        // Ignora JSON inválido.
      }
    }

    return {
      categoryLevel1: "",
      categoryLevel2: ""
    };
  }

  // ============================================================
  // 6. LOCALIZAÇÃO DOS CAMPOS
  // ============================================================

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);

    return rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      !el.disabled &&
      !el.readOnly;
  }

  function describeElement(el) {
    const labels = el.labels
      ? [...el.labels].map((label) => label.innerText).join(" ")
      : "";

    return [
      el.name,
      el.id,
      el.placeholder,
      el.getAttribute("aria-label"),
      el.getAttribute("data-field"),
      labels
    ].join(" ").toLowerCase();
  }

  function findField(fieldConfig) {
    if (!fieldConfig.enabled) {
      return {
        element: null,
        reason: "Campo desativado na configuração."
      };
    }

    // Prioridade 1: seletores CSS específicos.
    for (const selector of fieldConfig.selectors || []) {
      let matches = [];

      try {
        matches = [...document.querySelectorAll(selector)]
          .filter(isVisible);
      } catch {
        // Seletor inválido: tenta o próximo.
      }

      if (matches.length === 1) {
        return {
          element: matches[0],
          reason: "Seletor configurado."
        };
      }

      if (matches.length > 1) {
        return {
          element: null,
          reason: `Seletor ambíguo: ${selector}`
        };
      }
    }

    // Prioridade 2: rótulos acessíveis.
    if (CONFIG.allowLabelFallback && fieldConfig.labels?.length) {
      const candidates = [
        ...document.querySelectorAll(
          'input:not([type="hidden"]), textarea, select'
        )
      ].filter(isVisible);

      const matches = candidates.filter((el) => {
        const description = describeElement(el);

        return fieldConfig.labels.some((regex) =>
          regex.test(description)
        );
      });

      if (matches.length === 1) {
        return {
          element: matches[0],
          reason: "Rótulo identificado."
        };
      }

      if (matches.length > 1) {
        return {
          element: null,
          reason: "Mais de um campo corresponde ao rótulo."
        };
      }
    }

    return {
      element: null,
      reason: "Campo não encontrado."
    };
  }


  function findOriginalPriceMLField() {
    const normalize = (value) =>
      String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/:$/, "")
        .toLowerCase();

    const labels = [...document.querySelectorAll("label")]
      .filter((label) =>
        /^preco original\s*\(\s*ml\s*\)$/.test(
          normalize(label.innerText || label.textContent)
        )
      );

    const matches = new Set();

    for (const label of labels) {
      // Associação explícita: <label for="...">
      if (label.htmlFor) {
        const associated = document.getElementById(label.htmlFor);

        if (
          associated instanceof HTMLInputElement &&
          associated.type !== "hidden" &&
          isVisible(associated)
        ) {
          matches.add(associated);
        }
      }

      // Associação HTML nativa: label.control
      const control = label.control;

      if (
        control instanceof HTMLInputElement &&
        control.type !== "hidden" &&
        isVisible(control)
      ) {
        matches.add(control);
      }

      // Procura no contêiner do campo e em ancestrais próximos.
      let container = label.parentElement;

      for (let depth = 0; container && depth < 4; depth++) {
        const inputs = [
          ...container.querySelectorAll(
            'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
          )
        ].filter(isVisible);

        if (inputs.length === 1) {
          matches.add(inputs[0]);
          break;
        }

        // Evita escolher um campo quando o contêiner tem vários inputs.
        if (inputs.length > 1) break;

        container = container.parentElement;
      }
    }

    return matches.size === 1
      ? [...matches][0]
      : null;
  }

  // ============================================================
  // 7. PREENCHIMENTO DOS CAMPOS
  // ============================================================

  function setSelectValue(select, requestedValue) {
    const target = String(requestedValue).trim();

    if (!target) {
      return {
        ok: false,
        reason: "Categoria não informada."
      };
    }

    const options = [...select.options].filter((option) =>
      !option.disabled && option.value !== ""
    );

    const matches = options.filter((option) =>
      option.value.trim().toLowerCase() === target.toLowerCase() ||
      option.textContent.trim().toLowerCase() === target.toLowerCase()
    );

    if (matches.length !== 1) {
      return {
        ok: false,
        reason: matches.length
          ? "Mais de uma opção corresponde à categoria."
          : "Não existe uma opção exata para essa categoria."
      };
    }

    select.value = matches[0].value;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));

    return {
      ok: true,
      reason: `Categoria selecionada: ${matches[0].textContent.trim()}`
    };
  }

  function setNativeValue(el, value) {
    if (!el || value == null || value === "") {
      return {
        ok: false,
        reason: "Valor vazio ou campo inexistente."
      };
    }

    if (el instanceof HTMLSelectElement) {
      return setSelectValue(el, value);
    }

    if (el instanceof HTMLInputElement && el.type === "file") {
      return {
        ok: false,
        reason: "Upload exige um arquivo, não apenas uma URL."
      };
    }

    if (
      !(el instanceof HTMLInputElement) &&
      !(el instanceof HTMLTextAreaElement)
    ) {
      return {
        ok: false,
        reason: "Tipo de elemento não suportado."
      };
    }

    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

    const setter =
      Object.getOwnPropertyDescriptor(proto, "value")?.set;

    if (setter) {
      setter.call(el, String(value));
    } else {
      el.value = String(value);
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));

    return {
      ok: true,
      reason: "Valor preenchido; confira o resultado."
    };
  }


  function fillOriginalPriceML(value) {
    const field = findOriginalPriceMLField();

    if (!field) {
      return {
        field: "Preço original (ML)",
        ok: false,
        reason: "Campo não encontrado ou identificação ambígua."
      };
    }

    let normalized = String(value ?? "")
      .trim()
      .replace(/\s/g, "")
      .replace(/^R\$/i, "");

    // Formato brasileiro: 1.249,90
    if (/^\d{1,3}(?:\.\d{3})+,\d{2}$/.test(normalized)) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else if (/^\d+,\d{1,2}$/.test(normalized)) {
      normalized = normalized.replace(",", ".");
    } else if (/^\d{1,3}(?:,\d{3})+\.\d{2}$/.test(normalized)) {
      // Formato americano: 1,249.90
      normalized = normalized.replace(/,/g, "");
    }

    const price = Number(normalized);

    if (
      normalized === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return {
        field: "Preço original (ML)",
        ok: false,
        reason: `Preço ausente ou inválido: "${value}".`
      };
    }

    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;

    if (!setter) {
      return {
        field: "Preço original (ML)",
        ok: false,
        reason: "Não foi possível preencher o campo."
      };
    }

    field.focus();
    setter.call(field, price.toFixed(2));

    field.dispatchEvent(
      new Event("input", { bubbles: true })
    );
    field.dispatchEvent(
      new Event("change", { bubbles: true })
    );
    field.blur();

    return {
      field: "Preço original (ML)",
      ok: true,
      reason: `Valor aplicado: ${price.toFixed(2)}.`
    };
  }

  function fillConfiguredField(key, value) {
    const config = CONFIG.fields[key];

    if (!config?.enabled) {
      return {
        field: config?.label || key,
        ok: false,
        reason: "Campo desativado na configuração."
      };
    }

    const found = findField(config);

    if (!found.element) {
      return {
        field: config.label,
        ok: false,
        reason: found.reason
      };
    }

    const result = setNativeValue(found.element, value);

    return {
      field: config.label,
      ok: result.ok,
      reason: result.reason
    };
  }

  function fillPage(data) {
    const results = [];

    results.push(
      fillConfiguredField("title", data.title)
    );

    results.push(
      fillConfiguredField("price", data.price)
    );

    results.push(
      fillOriginalPriceML(data.price)
    );

    results.push(
      fillConfiguredField("image", data.imageUrl)
    );

    const category = data.category || CONFIG.categoryOptionText;

    if (category) {
      results.push(
        fillConfiguredField("category", category)
      );
    } else {
      results.push({
        field: CONFIG.fields.category.label,
        ok: false,
        reason: "Informe a categoria no painel."
      });
    }

    if (CONFIG.fillLabelQuantity) {
      results.push(
        fillConfiguredField("labelQuantity", data.labelQuantity)
      );
    }

    return results;
  }

  // ============================================================
  // 8. COPIAR TODOS OS DADOS
  // ============================================================


  async function copyAllProductData() {
    try {
      const captured = extractFromPage();
      const current = getDraft();

      const data = {
        ...captured,
        category: current.category || captured.category || "",
        categoryLevel1:
          captured.categoryLevel1 || current.categoryLevel1 || "",
        categoryLevel2:
          captured.categoryLevel2 || current.categoryLevel2 || "",
        labelQuantity:
          current.labelQuantity || CONFIG.defaultLabelQuantity,
        sourceUrl: location.href,
        updatedAt: new Date().toISOString()
      };

      if (!data.title && !data.price && !data.imageUrl) {
        say("Não consegui capturar os dados deste anúncio.", true);
        return;
      }

      render(data);

      try {
        if (storageAvailable()) {
          await chrome.storage.local.set({
            productDraft: data
          });
        }
      } catch (error) {
        console.warn(
          "[Precifica Assistente] Erro ao salvar rascunho:",
          error
        );
      }

      const text = [
        `Título: ${data.title}`,
        `Preço: ${data.price}`,
        `Imagem: ${data.imageUrl}`,
        `Categoria: ${data.category}`,
        `Categoria ML nível 1: ${data.categoryLevel1}`,
        `Categoria ML nível 2: ${data.categoryLevel2}`,
        `Quantidade de etiquetas: ${data.labelQuantity}`,
        `Anúncio: ${data.sourceUrl}`
      ].join("\n");

      try {
        await navigator.clipboard.writeText(text);
        say("Dados capturados e copiados, incluindo as categorias disponíveis.");
      } catch (error) {
        console.warn(
          "[Precifica Assistente] Clipboard indisponível:",
          error
        );

        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.left = "-9999px";
        root.appendChild(area);
        area.select();

        const copied = document.execCommand("copy");
        area.remove();

        say(
          copied
            ? "Dados capturados e copiados."
            : "Dados capturados, mas a cópia foi bloqueada.",
          !copied
        );
      }
    } catch (error) {
      console.error("[Precifica Assistente]", error);
      say("Erro ao capturar: " + (error?.message || String(error)), true);
    }
  }


  function normalizeCategory(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("pt-BR");
  }

  function findCategorySelect(labelText) {
    const labels = [...document.querySelectorAll("label")].filter(
      (label) =>
        normalizeCategory(label.innerText).includes(
          normalizeCategory(labelText)
        )
    );

    const matches = labels
      .map((label) => label.parentElement?.querySelector("select"))
      .filter((select) => select && select.isConnected);

    return matches.length === 1 ? matches[0] : null;
  }

  function selectExactOption(select, requestedText) {
    if (!select || !requestedText) return false;

    const normalize = (value) =>
      normalizeCategory(value)
        .replace(/\s*\[[^\]]*\]/g, "")
        .replace(/\s*\([^)]*\)/g, "")
        .trim();

    const target = normalize(requestedText);

    const matches = [...select.options].filter((option) => {
      if (option.value === "" || option.disabled) return false;

      const optionText = normalize(option.textContent);

      return optionText === target;
    });

    if (matches.length !== 1) return false;

    const setter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      "value"
    )?.set;

    if (!setter) return false;

    setter.call(select, matches[0].value);

    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));

    return select.value === matches[0].value;
  }

  function waitForCategoryOptions(select, timeout = 8000) {
    return new Promise((resolve) => {
      const started = Date.now();

      function check() {
        if (!select || !select.isConnected) {
          resolve(false);
          return;
        }

        const available = [...select.options].some(
          (option) => option.value !== "" && !option.disabled
        );

        if (!select.disabled && available) {
          resolve(true);
          return;
        }

        if (Date.now() - started >= timeout) {
          resolve(false);
          return;
        }

        setTimeout(check, 200);
      }

      check();
    });
  }

  async function fillProductCategories(data) {
    const results = [];

    const primary = findCategorySelect(
      "Categoria primária (nível 1 ML)"
    );

    const secondary = findCategorySelect(
      "Categoria secundária (nível 2"
    );

    if (!primary || !secondary) {
      return [{
        field: "Categorias ML",
        ok: false,
        reason: "Não encontrei os dois seletores na tela atual."
      }];
    }

    if (!data.categoryLevel1) {
      results.push({
        field: "Categoria nível 1",
        ok: false,
        reason: "Categoria não capturada. Escolha manualmente."
      });

      return results;
    }

    const primaryOK = selectExactOption(
      primary,
      data.categoryLevel1
    );

    results.push({
      field: "Categoria nível 1",
      ok: primaryOK,
      reason: primaryOK
        ? "Opção exata selecionada."
        : "Não existe correspondência exata. Nenhuma opção foi escolhida."
    });

    if (!primaryOK) return results;

    const ready = await waitForCategoryOptions(secondary);

    if (!ready) {
      results.push({
        field: "Categoria nível 2",
        ok: false,
        reason: "As opções não carregaram ou não estão disponíveis."
      });

      return results;
    }

    if (!data.categoryLevel2) {
      results.push({
        field: "Categoria nível 2",
        ok: false,
        reason: "Subcategoria não capturada. Escolha manualmente."
      });

      return results;
    }

    const secondaryOK = selectExactOption(
      secondary,
      data.categoryLevel2
    );

    results.push({
      field: "Categoria nível 2",
      ok: secondaryOK,
      reason: secondaryOK
        ? "Opção exata selecionada."
        : "Não existe correspondência exata. Nenhuma opção foi escolhida."
    });

    return results;
  }

  // ============================================================
  // BUSCAR PRODUTO NO SISTEMA
  // ============================================================


  async function searchProduct() {
    try {
      const data = getDraft();

      // Usa a Fonte do anúncio (sourceUrl) como termo de pesquisa.
      const sourceUrl = data.sourceUrl?.trim();

      if (!sourceUrl) {
        say(
          "Preencha o campo Fonte do anúncio antes de pesquisar.",
          true
        );
        $("pa-source").focus();
        return;
      }

      const input = document.querySelector("input.ds-search-input");

      if (!input) {
        throw new Error(
          "Campo de pesquisa do As Vezes Tem não encontrado."
        );
      }

      const button = [...document.querySelectorAll("button")].find(
        (btn) =>
          btn.textContent.trim() === "Buscar" &&
          btn.classList.contains("bg-brand-500")
      );

      if (
        !button ||
        input.disabled ||
        input.readOnly ||
        button.disabled
      ) {
        throw new Error("Campo ou botão Buscar indisponível.");
      }

      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;

      if (!setter) {
        throw new Error(
          "Não foi possível preencher a pesquisa."
        );
      }

      input.focus();
      setter.call(input, sourceUrl);

      input.dispatchEvent(
        new Event("input", { bubbles: true })
      );
      input.dispatchEvent(
        new Event("change", { bubbles: true })
      );

      if (input.value !== sourceUrl) {
        throw new Error(
          "A Fonte do anúncio não foi aplicada à pesquisa."
        );
      }

      button.click();

      say(
        "Pesquisa iniciada usando a Fonte do anúncio. Aguardando os campos de categoria..."
      );

      // Aguarda a interface carregar os seletores de categoria.
      const started = Date.now();
      let primary = null;
      let secondary = null;

      while (Date.now() - started < 10000) {
        primary = findCategorySelect(
          "Categoria primária (nível 1 ML)"
        );

        secondary = findCategorySelect(
          "Categoria secundária (nível 2"
        );

        if (primary && secondary) break;

        await new Promise((resolve) =>
          setTimeout(resolve, 250)
        );
      }

      if (!primary || !secondary) {
        say(
          "Busca enviada. Os campos de categoria não apareceram; confira a tela.",
          true
        );
        return;
      }


      const results = [];

      // A busca já foi enviada e os campos de categoria apareceram.
      // Agora tenta preencher o título e o preço.
      results.push(
        fillConfiguredField("title", data.title)
      );

      results.push(
        fillOriginalPriceML(data.price)
      );

      // Preenche as categorias depois do título e do preço.
      const categoryResults = await fillProductCategories(data);
      results.push(...categoryResults);

      showReport(results);

      const successful = results.filter(
        (item) => item.ok
      ).length;

      const pending = results.length - successful;

      say(
        `Busca concluída: ${successful} campo(s) preenchido(s), ` +
        `${pending} pendente(s). Confira o relatório.`,
        pending > 0
      );
    } catch (error) {
      console.error(
        "[Precifica Assistente] Erro na pesquisa:",
        error
      );

      say(
        "Falha ao pesquisar: " +
        (error?.message || String(error)),
        true
      );
    }
  }

  // ============================================================
  // 9. PREENCHER TODOS OS CAMPOS
  // ============================================================


  async function fillAllProductFields() {
    const data = getDraft();

    if (!data.sourceUrl) {
      say(
        "Preencha a Fonte do anúncio antes de pesquisar.",
        true
      );
      $("pa-source").focus();
      return;
    }

    if (!data.title && !data.price) {
      say(
        "Capture o anúncio ou informe o título e o preço antes de preencher.",
        true
      );
      return;
    }

    try {
      // A busca acontece primeiro.
      // searchProduct preencherá título, preço e categorias
      // depois que a tela de destino estiver pronta.
      await searchProduct();

      // Salva o rascunho sem bloquear o preenchimento.
      try {
        await saveDraft();
      } catch (error) {
        console.warn(
          "[Precifica Assistente] Erro ao salvar:",
          error
        );
      }
    } catch (error) {
      console.error("[Precifica Assistente]", error);

      say(
        "Falha ao preencher os campos: " +
        (error?.message || String(error)),
        true
      );
    }
  }

  // ============================================================
  // 10. EVENTOS DA INTERFACE
  // ============================================================

  toggle.addEventListener("click", async () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));

    if (!panel.hidden) {
      try {
        await loadDraft();
        say("Painel aberto. Confira os dados.");
      } catch {
        say(
          "Contexto da extensão indisponível. Recarregue esta página.",
          true
        );
      }
    }
  });

  $("pa-close").addEventListener("click", () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  });

  $("pa-capture").addEventListener("click", async () => {
    try {
      const data = extractFromPage();
      render(data);

      try {
        await saveDraft();
      } catch {
        say(
          "Captura concluída, mas o rascunho não pôde ser salvo.",
          true
        );
        return;
      }

      say("Captura concluída. Revise os dados antes de preencher.");
    } catch {
      say("Não foi possível capturar os dados desta página.", true);
    }
  });

  $("pa-copy").addEventListener("click", () => {
    copyAllProductData().catch(() => {
      say("Falha ao copiar os dados.", true);
    });
  });

  $("pa-fill").addEventListener("click", () => {
    fillAllProductFields().catch(error => {
      console.error("[Precifica Assistente]", error);
      say("Falha ao preencher os campos.", true);
    });
  });

  $("pa-save").addEventListener("click", async () => {
    try {
      await saveDraft();
      say("Revisão salva localmente no Chrome.");
    } catch {
      say(
        "Não foi possível salvar. Recarregue a página e tente novamente.",
        true
      );
    }
  });

  $("pa-clear").addEventListener("click", async () => {
    try {
      if (!storageAvailable()) {
        throw new Error("Extensão indisponível.");
      }

      await chrome.storage.local.remove("productDraft");
      render({});
      report.hidden = true;
      say("Rascunho local apagado.");
    } catch {
      say("Não foi possível apagar o rascunho.", true);
    }
  });

  $("pa-search-gtin").addEventListener("click", () => {
    searchGtinWithGemini();
  });

  // ============================================================
  // 11. ATALHOS GLOBAIS
  // Alt + Shift + A = copiar todos os dados
  // Alt + Shift + V = preencher os campos da página atual
  // ============================================================

  document.addEventListener("keydown", (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey) return;
    if (!event.altKey || !event.shiftKey) return;

    const key = event.key.toLowerCase();

    if (key === CONFIG.shortcuts.copyAll.key) {
      event.preventDefault();

      copyAllProductData().catch(() => {
        say("Falha ao copiar os dados.", true);
      });
    }

    if (key === CONFIG.shortcuts.fillAll.key) {
      event.preventDefault();

      fillAllProductFields().catch(error => {
        console.error("[Precifica Assistente]", error);
        say("Falha ao preencher os campos.", true);
      });
    }

    if (key === "escape" && !panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // ============================================================
  // 12. RESTAURAR RASCUNHO AO INICIAR
  // ============================================================

  loadDraft().catch(() => {
    // A interface continua utilizável mesmo sem armazenamento.
    // O painel informará se for necessário recarregar a página.
  });

})();