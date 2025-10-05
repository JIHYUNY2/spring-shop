"use strict";
(() => {
  // src/api.ts
  var BASE = "".replace(/\/+$/, "");
  var USE_MOCK = !BASE;
  async function request(path, init2 = {}) {
    const url = BASE + path;
    const _body = init2.body;
    const headers = {
      "Content-Type": "application/json",
      ...init2.headers || {}
    };
    const opt = {
      ...init2,
      headers,
      body: _body && typeof _body !== "string" ? JSON.stringify(_body) : _body
    };
    const res = await fetch(url, opt);
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const msg = isJson ? data?.error?.message || JSON.stringify(data) : res.statusText;
      throw new Error(msg);
    }
    return data && typeof data === "object" && "data" in data ? data.data : data;
  }
  var mockSeq = 3;
  var mockData = [
    { id: 1, name: "Basic T-Shirt", price: 19900, description: "\uBCA0\uC774\uC9C1 \uD2F0\uC154\uCE20", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 2, name: "Hoodie", price: 39900, description: "\uD6C4\uB514", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 3, name: "Jeans", price: 49900, description: "\uB370\uB2D8", createdAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  function mockPage(page = 0, size = 20, sort = "id,desc") {
    const [key, dir] = sort.split(",");
    const sorted = [...mockData].sort(
      (a, b) => dir === "desc" ? a[key] < b[key] ? 1 : -1 : a[key] > b[key] ? 1 : -1
    );
    const start = page * size;
    const content = sorted.slice(start, start + size);
    const totalPages = Math.max(1, Math.ceil(sorted.length / size));
    return { content, totalPages, number: page };
  }
  var api = {
    // 상품 목록
    listProducts: (page, size, sort) => USE_MOCK ? Promise.resolve(mockPage(page, size, sort)) : request(`/api/v1/products?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`),
    // 상품 상세
    getProduct: (id) => USE_MOCK ? Promise.resolve(mockData.find((p) => p.id === id)) : request(`/api/v1/products/${id}`),
    // 상품 등록
    createProduct: (p) => {
      if (USE_MOCK) {
        const item = { id: ++mockSeq, createdAt: (/* @__PURE__ */ new Date()).toISOString(), ...p };
        mockData.unshift(item);
        return Promise.resolve(item);
      }
      return request("/api/v1/products", {
        method: "POST",
        body: p
        // ← 객체 그대로 전달해도 OK (request()에서 JSON 처리)
      });
    },
    // 상품 삭제
    deleteProduct: (id) => {
      if (USE_MOCK) {
        mockData = mockData.filter((p) => p.id !== id);
        return Promise.resolve();
      }
      return request(`/api/v1/products/${id}`, { method: "DELETE" });
    }
  };

  // src/ui.ts
  var qs = (s) => document.querySelector(s);
  var el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => k in n ? n[k] = v : n.setAttribute(k, v));
    children.forEach((c) => n.append(c instanceof Node ? c : document.createTextNode(String(c))));
    return n;
  };
  var fmtPrice = (n) => `${Number(n).toLocaleString("ko-KR")}\uC6D0`;
  var loading = (on) => qs("#loader")?.classList.toggle("show", !!on);
  var toast = (msg, type = "ok") => {
    const box = qs("#toast");
    if (!box) return;
    const t = el("div", { className: `toast ${type === "error" ? "error" : ""}` }, [msg]);
    box.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  };

  // src/main.ts
  var PAGE = { number: 0, size: 20, sort: "id,desc", totalPages: 0 };
  var THEME_KEY = "shop_theme";
  (function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
      document.documentElement.setAttribute("data-theme", prefersLight ? "light" : "dark");
    }
  })();
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem(THEME_KEY, cur);
  }
  async function loadList() {
    loading(true);
    try {
      const page = await api.listProducts(PAGE.number, PAGE.size, PAGE.sort);
      const items = page.content ?? page;
      PAGE.totalPages = page.totalPages ?? 1;
      renderList(Array.isArray(items) ? items : [], page);
    } catch (e) {
      console.error(e);
      renderList([], { number: 0, totalPages: 0 });
      toast("\uBAA9\uB85D \uB85C\uB4DC \uC2E4\uD328: " + e.message, "error");
    } finally {
      loading(false);
    }
  }
  function renderList(items, meta) {
    const list = qs("#list");
    list.innerHTML = "";
    const empty = qs("#empty");
    empty.style.display = items.length ? "none" : "block";
    items.forEach((p) => {
      const card = el("div", { className: "product" }, [
        el("h3", {}, [p.name]),
        el("div", { className: "price" }, [fmtPrice(p.price)]),
        el("div", { className: "muted" }, [p.description || ""]),
        el("div", { style: "display:flex; gap:8px; margin-top:10px" }, [
          el("button", { className: "ghost", onclick: () => openDetail(p.id) }, ["\uC0C1\uC138"])
        ])
      ]);
      list.append(card);
    });
    const cur = (meta.number ?? PAGE.number) + 1;
    const total = meta.totalPages ?? PAGE.totalPages ?? 1;
    setPageInfo(cur, total);
  }
  function setPageInfo(cur, total) {
    qs("#pageInfo").textContent = `${cur} / ${total}`;
    qs("#prev").disabled = cur <= 1;
    qs("#next").disabled = cur >= total;
  }
  async function openDetail(id) {
    loading(true);
    try {
      const p = await api.getProduct(id);
      const body = qs("#detailBody");
      body.innerHTML = "";
      body.append(
        el("div", { style: "display:grid; gap:8px" }, [
          el("div", {}, [el("div", { className: "muted" }, ["\uC0C1\uD488\uBA85"]), el("div", { style: "font-weight:700" }, [p.name])]),
          el("div", {}, [el("div", { className: "muted" }, ["\uAC00\uACA9"]), el("div", { className: "price" }, [fmtPrice(p.price)])]),
          el("div", {}, [el("div", { className: "muted" }, ["\uC124\uBA85"]), el("div", {}, [p.description || "\u2014"])]),
          el("div", {}, [el("div", { className: "muted" }, ["\uC0DD\uC131\uC77C"]), el("div", {}, [new Date(p.createdAt || Date.now()).toLocaleString("ko-KR")])])
        ])
      );
      qs("#deleteBtn").onclick = () => onDelete(id);
      qs("#detailModal").showModal();
    } catch (e) {
      toast("\uC0C1\uC138 \uC870\uD68C \uC2E4\uD328: " + e.message, "error");
    } finally {
      loading(false);
    }
  }
  async function onDelete(id) {
    if (!confirm("\uC815\uB9D0 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) return;
    loading(true);
    try {
      await api.deleteProduct(id);
      toast("\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      qs("#detailModal").close();
      loadList();
    } catch (e) {
      toast("\uC0AD\uC81C \uC2E4\uD328: " + e.message, "error");
    } finally {
      loading(false);
    }
  }
  async function onCreate(ev) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      price: Number(fd.get("price") || 0),
      description: String(fd.get("description") || "").trim()
    };
    if (!payload.name || !payload.price) {
      toast("\uC774\uB984/\uAC00\uACA9\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.", "error");
      return;
    }
    loading(true);
    try {
      await api.createProduct(payload);
      form.reset();
      PAGE.number = 0;
      toast("\uC0C1\uD488\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      loadList();
    } catch (e) {
      toast("\uB4F1\uB85D \uC2E4\uD328: " + e.message, "error");
    } finally {
      loading(false);
    }
  }
  function bindControls() {
    qs("#prev").onclick = () => {
      if (PAGE.number > 0) {
        PAGE.number--;
        loadList();
      }
    };
    qs("#next").onclick = () => {
      if (PAGE.number + 1 < PAGE.totalPages) {
        PAGE.number++;
        loadList();
      }
    };
    qs("#size").onchange = (e) => {
      PAGE.size = Number(e.target.value);
      PAGE.number = 0;
      loadList();
    };
    qs("#sort").onchange = (e) => {
      PAGE.sort = String(e.target.value);
      PAGE.number = 0;
      loadList();
    };
    qs("#openCreate").onclick = () => {
      qs('input[name="name"]').focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    qs("#closeModal").onclick = () => qs("#detailModal").close();
    qs("#closeModal2").onclick = () => qs("#detailModal").close();
    qs("#createForm").addEventListener("submit", onCreate);
    qs("#themeToggle").addEventListener("click", toggleTheme);
  }
  function init() {
    bindControls();
    loadList();
  }
  init();
})();
//# sourceMappingURL=main.js.map
