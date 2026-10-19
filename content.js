
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
        label: "Preço base (R$)",
        selectors: [],
        labels: [/^preço base\s*\(r\$\)$/i],
        type: "text"
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

      <label class="pa-label" for="pa-category">
        Categoria pai
      </label>
      <input class="pa-input" id="pa-category"
        placeholder="Ex.: Ferramentas">

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
      title: $("pa-title").value.trim(),
      price: $("pa-price").value.trim(),
      imageUrl: $("pa-image").value.trim(),
      category: $("pa-category").value.trim(),
      labelQuantity: $("pa-quantity").value.trim(),
      sourceUrl: $("pa-source").value.trim(),
      updatedAt: new Date().toISOString()
    };
  }

  function render(data = {}) {
    $("pa-title").value = data.title || "";
    $("pa-price").value = data.price || "";
    $("pa-image").value = data.imageUrl || "";
    $("pa-category").value = data.category || "";
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
      meta('meta[itemprop="price"]');

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
      price = String(price).replace(/[^\d,.-]/g, "").trim();

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

    return {
      title,
      price,
      imageUrl,
      category: "",
      labelQuantity: CONFIG.defaultLabelQuantity,
      sourceUrl: location.href
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
      // 1. Captura automaticamente os dados da página atual.
      const captured = extractFromPage();

      // 2. Preserva os dados que o usuário já informou no painel.
      const current = getDraft();

      const data = {
        title: captured.title || "",
        price: captured.price || "",
        imageUrl: captured.imageUrl || "",
        category: current.category || "",
        labelQuantity: current.labelQuantity ||
          CONFIG.defaultLabelQuantity,
        sourceUrl: location.href,
        updatedAt: new Date().toISOString()
      };

      // 3. Atualiza o painel com os dados capturados.
      render(data);

      // 4. Valida se a captura encontrou informações úteis.
      if (!data.title && !data.price && !data.imageUrl) {
        say(
          "Não consegui capturar os dados deste anúncio. " +
          "Verifique se a página do produto está aberta.",
          true
        );
        return;
      }

      // 5. Tenta salvar, sem impedir a cópia se falhar.
      try {
        if (storageAvailable()) {
          await chrome.storage.local.set({
            productDraft: data
          });
        }
      } catch (error) {
        console.warn(
          "[Precifica Assistente] Não foi possível salvar o rascunho.",
          error
        );
      }

      // 6. Monta um único bloco com todos os dados.
      const text = [
        `Título: ${data.title}`,
        `Preço: ${data.price}`,
        `Imagem: ${data.imageUrl}`,
        `Categoria: ${data.category}`,
        `Quantidade de etiquetas: ${data.labelQuantity}`,
        `Anúncio: ${data.sourceUrl}`
      ].join("\n");

      // 7. Copia o bloco para a área de transferência.
      try {
        await navigator.clipboard.writeText(text);
        say("Anúncio capturado e todos os dados copiados!");
      } catch (error) {
        console.warn(
          "[Precifica Assistente] Clipboard API indisponível.",
          error
        );

        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.left = "-9999px";
        area.style.top = "0";
        root.appendChild(area);
        area.select();

        const copied = document.execCommand("copy");
        area.remove();

        if (copied) {
          say("Anúncio capturado e todos os dados copiados!");
        } else {
          say(
            "Dados capturados, mas a cópia foi bloqueada pelo navegador.",
            true
          );
        }
      }

      // Usa o link capturado do anúncio.
      const buscaRealizada = await buscarAnuncioPorLink(
        data.sourceUrl
      );

      if (buscaRealizada) {
        say("Dados copiados e busca do anúncio acionada.");
      }

    } catch (error) {
      console.error("[Precifica Assistente]", error);
      say("Falha ao capturar o anúncio. Consulte o console.", true);
    }
  }


  async function buscarAnuncioPorLink(url) {
    const link = String(url || "").trim();

    if (!/^https?:\/\//i.test(link)) {
      say("Link do anúncio inválido.", true);
      return false;
    }

    const campos = [
      ...document.querySelectorAll(".ds-search-input")
    ].filter(isVisible);

    if (campos.length !== 1) {
      say(
        "Não foi possível identificar um único campo de busca.",
        true
      );
      return false;
    }

    const campo = campos[0];
    const preenchimento = setNativeValue(campo, link);

    if (!preenchimento.ok) {
      say("Não foi possível preencher o link.", true);
      return false;
    }

    const botoes = [
      ...document.querySelectorAll("button")
    ].filter(isVisible).filter(botao =>
      botao.innerText.trim().toLowerCase() === "buscar"
    );

    if (botoes.length !== 1) {
      say(
        "Não foi possível identificar um único botão Buscar.",
        true
      );
      return false;
    }

    botoes[0].click();

    say("Link enviado para busca.");
    return true;
  }

  // ============================================================
  // 9. PREENCHER TODOS OS CAMPOS
  // ============================================================

  async function fillAllProductFields() {
    const data = getDraft();

    if (!data.title && !data.price && !data.imageUrl) {
      say("Não há dados para preencher.", true);
      return;
    }

    try {
      const results = fillPage(data);
      const success = results.filter((item) => item.ok).length;
      const pending = results.length - success;

      showReport(results);

      say(
        `${success} campo(s) preenchido(s); ` +
        `${pending} pendente(s). Confira o relatório.`
      );

      // Não bloqueia o preenchimento se o armazenamento falhar.
      try {
        await saveDraft();
      } catch {
        say(
          "Campos processados, mas não foi possível salvar o rascunho.",
          true
        );
      }
    } catch {
      say("Falha ao preencher. Confira os seletores configurados.", true);
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
    fillAllProductFields().catch(() => {
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

      fillAllProductFields().catch(() => {
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