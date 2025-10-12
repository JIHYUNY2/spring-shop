"use strict";
(() => {
  // src/api.ts
  var API_BASE = "";
  async function loadConfig() {
    const r = await fetch("/config.json");
    const cfg = await r.json();
    if (!cfg.API_BASE) throw new Error("config.json\uC5D0 API_BASE \uC5C6\uC74C");
    API_BASE = String(cfg.API_BASE).replace(/\/$/, "");
  }
  async function request(url, init2) {
    const res = await fetch(API_BASE + url, init2);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    const payload = await res.json();
    if (!payload.success) {
      throw new Error(payload.error?.message ?? "API \uD638\uCD9C \uC2E4\uD328");
    }
    return payload.data;
  }
  function buildJsonInit(body, method) {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    return {
      method,
      headers,
      body: body === void 0 ? void 0 : JSON.stringify(body)
    };
  }
  var http = {
    get: (url) => request(url),
    post: (url, body) => request(url, buildJsonInit(body, "POST")),
    put: (url, body) => request(url, buildJsonInit(body, "PUT")),
    patch: (url, body) => request(url, buildJsonInit(body, "PATCH")),
    del: (url) => request(url, { method: "DELETE" })
  };
  var ProductApi = {
    list: (page2 = 0, size2 = 10, sort2 = "id,desc") => http.get(`/products?page=${page2}&size=${size2}&sort=${encodeURIComponent(sort2)}`),
    get: (id) => http.get(`/products/${id}`),
    create: (p) => http.post(`/products`, p),
    update: (id, patch) => http.patch(`/products/${id}`, patch),
    remove: (id) => http.del(`/products/${id}`)
  };
  var StockApi = {
    create: (productId, quantity) => http.post(`/stocks/${productId}`, { quantity }),
    get: (productId) => http.get(`/stocks/${productId}`),
    set: (productId, quantity) => http.put(`/stocks/${productId}`, { quantity }),
    adjust: (productId, delta) => http.patch(`/stocks/${productId}/adjust`, { delta })
  };

  // src/ui.ts
  var $ = (sel) => document.querySelector(sel);
  var el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") {
        node.className = v;
      } else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v != null) {
        node.setAttribute(k, String(v));
      }
    });
    for (const c of children) node.append(c);
    return node;
  };

  // src/main.ts
  var themeBtn = $("#themeToggle");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    if (themeBtn) themeBtn.textContent = t === "light" ? "\u{1F319} \uB2E4\uD06C" : "\u2600\uFE0E \uB77C\uC774\uD2B8";
    localStorage.setItem("theme", t);
  }
  (function initTheme() {
    const saved = localStorage.getItem("theme") || "light";
    applyTheme(saved);
    themeBtn?.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
    });
  })();
  var toastEl = $("#toast");
  function showToast(msg, type = "ok", ms = 1800) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = type === "error" ? "error" : "";
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), ms);
  }
  var spinner = $("#globalSpinner");
  function setGlobalLoading(v) {
    spinner?.toggleAttribute("hidden", !v);
  }
  var createForm = $("#createForm");
  var nameInput = $("#name");
  var priceInput = $("#price");
  var descInput = $("#description");
  var initStockInput = $("#initStock");
  var createBtn = $("#createBtn");
  var createMsg = $("#createMsg");
  var pageInput = $("#page");
  var sizeInput = $("#size");
  var sortSelect = $("#sort");
  var refreshBtn = $("#refreshBtn");
  var listBody = $("#listBody");
  var pageInfo = $("#pageInfo");
  var prevBtn = $("#prevBtn");
  var nextBtn = $("#nextBtn");
  var listMsg = $("#listMsg");
  var page = 0;
  var size = 10;
  var sort = "id,desc";
  function parseIntOrZero(v) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  }
  async function load() {
    try {
      setGlobalLoading(true);
      listMsg.textContent = "";
      const data = await ProductApi.list(page, size, sort);
      listBody.innerHTML = "";
      for (const item of data.content) {
        let qty = 0;
        try {
          const st = await StockApi.get(item.id);
          qty = st.quantity ?? 0;
        } catch {
          qty = 0;
        }
        const tr = el(
          "tr",
          {},
          el("td", {}, String(item.id)),
          el("td", {}, item.name),
          el("td", {}, item.price.toLocaleString()),
          el("td", {}, item.description ?? ""),
          el("td", {}, String(qty)),
          el("td", {}, el(
            "div",
            { class: "actions" },
            el("button", { class: "btn btn-outline", onClick: () => onEdit(item) }, "\uC218\uC815"),
            el("button", { class: "btn btn-danger", onClick: () => onDelete(item.id) }, "\uC0AD\uC81C")
          ))
        );
        listBody.appendChild(tr);
      }
      pageInfo.textContent = `\uD398\uC774\uC9C0 ${data.number + 1} / ${Math.max(1, data.totalPages)} \xB7 \uCD1D ${data.totalElements}\uAC1C`;
      prevBtn.disabled = data.number <= 0;
      nextBtn.disabled = data.number + 1 >= data.totalPages;
    } catch (e) {
      listMsg.innerHTML = `<span class="bad">\uBAA9\uB85D \uB85C\uB4DC \uC2E4\uD328: ${e.message}</span>`;
      showToast("\uBAA9\uB85D \uB85C\uB4DC \uC2E4\uD328: " + e.message, "error");
    } finally {
      setGlobalLoading(false);
    }
  }
  function validateForm() {
    const errs = [];
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const initQty = Number(initStockInput.value || "0");
    if (!name) errs.push("\uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694.");
    if (name.length > 100) errs.push("\uC774\uB984\uC740 100\uC790 \uC774\uD558\uC785\uB2C8\uB2E4.");
    if (!Number.isFinite(price) || price <= 0) errs.push("\uAC00\uACA9\uC740 1\uC6D0 \uC774\uC0C1 \uC815\uC218\uC785\uB2C8\uB2E4.");
    if (!Number.isFinite(initQty) || initQty < 0) errs.push("\uCD08\uAE30 \uC7AC\uACE0\uB294 0 \uC774\uC0C1 \uC815\uC218\uC785\uB2C8\uB2E4.");
    if ((descInput.value ?? "").length > 1e3) errs.push("\uC124\uBA85\uC740 1000\uC790 \uC774\uD558\uC785\uB2C8\uB2E4.");
    return errs;
  }
  async function onCreate(ev) {
    ev.preventDefault();
    const errs = validateForm();
    if (errs.length) {
      showToast(errs[0], "error");
      return;
    }
    try {
      createMsg.textContent = "";
      createBtn.disabled = true;
      const prod = await ProductApi.create({
        name: nameInput.value.trim(),
        price: Number(priceInput.value),
        description: descInput.value.trim()
      });
      const initQty = Number(initStockInput.value || "0");
      if (initQty > 0) {
        await StockApi.create(prod.id, initQty);
      }
      showToast(`\uB4F1\uB85D \uC644\uB8CC: #${prod.id}`);
      createForm.reset();
      await load();
    } catch (e) {
      createMsg.innerHTML = `<span class="bad">\uB4F1\uB85D \uC2E4\uD328: ${e.message}</span>`;
      showToast("\uB4F1\uB85D \uC2E4\uD328: " + e.message, "error");
    } finally {
      createBtn.disabled = false;
    }
  }
  function onEdit(item) {
    const nextName = prompt("\uC774\uB984 \uC218\uC815 (\uC5D4\uD130=\uC720\uC9C0)", item.name) ?? item.name;
    const nextPriceStr = prompt("\uAC00\uACA9 \uC218\uC815 (\uC5D4\uD130=\uC720\uC9C0)", String(item.price)) ?? String(item.price);
    const nextDesc = prompt("\uC124\uBA85 \uC218\uC815 (\uC5D4\uD130=\uC720\uC9C0)", item.description ?? "") ?? (item.description ?? "");
    const patch = {};
    if (nextName !== item.name) patch.name = nextName.trim();
    if (Number(nextPriceStr) !== item.price) patch.price = Number(nextPriceStr);
    if (nextDesc !== (item.description ?? "")) patch.description = nextDesc.trim();
    if (Object.keys(patch).length === 0) return;
    setGlobalLoading(true);
    ProductApi.update(item.id, patch).then(() => {
      showToast("\uC218\uC815 \uC644\uB8CC");
      load();
    }).catch((e) => {
      showToast("\uC218\uC815 \uC2E4\uD328: " + e.message, "error");
    }).finally(() => setGlobalLoading(false));
  }
  function onDelete(id) {
    if (!confirm(`#${id} \uC0AD\uC81C\uD560\uAE4C\uC694?`)) return;
    setGlobalLoading(true);
    ProductApi.remove(id).then(() => {
      showToast("\uC0AD\uC81C \uC644\uB8CC");
      load();
    }).catch((e) => {
      showToast("\uC0AD\uC81C \uC2E4\uD328: " + e.message, "error");
    }).finally(() => setGlobalLoading(false));
  }
  createForm.addEventListener("submit", onCreate);
  refreshBtn.addEventListener("click", () => {
    page = parseIntOrZero(pageInput.value);
    size = parseIntOrZero(sizeInput.value) || 10;
    sort = sortSelect.value || "id,desc";
    load();
  });
  prevBtn.addEventListener("click", () => {
    if (page > 0) {
      page--;
      pageInput.value = String(page);
      load();
    }
  });
  nextBtn.addEventListener("click", () => {
    page++;
    pageInput.value = String(page);
    load();
  });
  (async function init() {
    try {
      await loadConfig();
      await load();
    } catch (e) {
      alert("\uCD08\uAE30\uD654 \uC2E4\uD328: " + e.message);
    }
  })();
})();
//# sourceMappingURL=main.js.map
