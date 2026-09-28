# Componente ScrollSpy — Especificação, Funcionamento e Guia de Integração EDDIE

> Módulo UI / Componentes Globais DiskIngressos PDT & Storefront  
> Documento Oficial de Referência Técnica — Padrão Bootstrap / HTML5 & React / Next.js

---

## 1. O que é e Como Funciona

O **ScrollSpy** é um componente de observabilidade de rolagem de tela que atualiza automaticamente componentes de navegação, abas, barras laterais ou grupos de listas com base na posição do leitor na página ou em um container com rolagem interna, indicando qual âncora está visível na tela e aplicando a classe `.active`.

### Requisitos Técnicos de Funcionamento:
1. **Elemento de Navegação:** Deve ser utilizado com componentes de navegação (`.nav`, `.nav-pills`, `.navbar`) ou grupos de listas (`.list-group`).
2. **Posicionamento Relativo:** Requer `position: relative;` no container que está sendo monitorado (geralmente `<body>`, `<div class="content-wrapper">` ou `<div class="content-inner">`).
3. **Containers Internos:** Ao espionar elementos que não sejam o `<body>`, o elemento monitorado deve ter uma altura definida (`height`) e rolagem vertical aplicada (`overflow-y: scroll;` ou `overflow-y: auto;`).
4. **Âncoras Obrigatórias:** Links de navegação (`<a href="#id">`) são obrigatórios e seus valores de `href` devem corresponder ao `id` dos respectivos elementos de destino no DOM.
5. **Comutação de Classe Ativa:** Conforme a rolagem avança, a classe `.active` é removida dos itens anteriores e atribuída ao destino atual, incluindo suporte a dropdowns pais e navegações aninhadas (*nested navs*).

---

## 2. Padrões de Uso Suportados

### 2.1 Exemplo na Barra de Navegação (Navbar & Dropdown)
Monitora o conteúdo e destaca links diretos ou itens suspensos em dropdowns:

```html
<nav id="navbar-example2" class="navbar bg-light px-3">
  <a class="navbar-brand" href="#">Navbar</a>
  <ul class="nav nav-pills">
    <li class="nav-item">
      <a class="nav-link" href="#scrollspyHeading1">Primeiro</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#scrollspyHeading2">Segundo</a>
    </li>
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Suspenso</a>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#scrollspyHeading3">Terceiro</a></li>
        <li><a class="dropdown-item" href="#scrollspyHeading4">Quarto</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#scrollspyHeading5">Quinto</a></li>
      </ul>
    </li>
  </ul>
</nav>

<div data-bs-spy="scroll" data-bs-target="#navbar-example2" data-bs-offset="15" class="scrollspy-example" tabindex="0">
  <h4 id="scrollspyHeading1">Primeiro título</h4>
  <p>Conteúdo da primeira seção...</p>
  <h4 id="scrollspyHeading2">Segundo título</h4>
  <p>Conteúdo da segunda seção...</p>
  <h4 id="scrollspyHeading3">Terceiro título</h4>
  <p>Conteúdo da terceira seção...</p>
  <h4 id="scrollspyHeading4">Quarto cabeçalho</h4>
  <p>Conteúdo da quarta seção...</p>
  <h4 id="scrollspyHeading5">Quinto título</h4>
  <p>Conteúdo da quinta seção...</p>
</div>
```

---

### 2.2 Exemplo com Navegação Aninhada (Nested Navs)
Quando um item filho é selecionado, tanto o sub-item quanto o item pai recebem a classe `.active`:

```html
<div class="row">
  <div class="col-4">
    <nav class="nav nav-pills flex-column" id="scrollspy_nest">
      <a class="nav-link active" href="#item-1">Item 1</a>
      <nav class="nav nav-pills flex-column">
        <a class="nav-link ms-3 my-1" href="#item-1-1">Item 1-1</a>
        <a class="nav-link ms-3 my-1" href="#item-1-2">Item 1-2</a>
      </nav>
      <a class="nav-link" href="#item-2">Item 2</a>
      <a class="nav-link" href="#item-3">Item 3</a>
      <nav class="nav nav-pills flex-column">
        <a class="nav-link ms-3 my-1" href="#item-3-1">Item 3-1</a>
        <a class="nav-link ms-3 my-1" href="#item-3-2">Item 3-2</a>
      </nav>
    </nav>
  </div>
  <div class="col-8">
    <div data-bs-spy="scroll" data-bs-target="#scrollspy_nest" data-bs-offset="15" class="scrollspy-example" tabindex="0">
      <h4 id="item-1">Item 1</h4>
      <p>...</p>
      <h5 id="item-1-1">Item 1-1</h5>
      <p>...</p>
      <h5 id="item-1-2">Item 1-2</h5>
      <p>...</p>
      <h4 id="item-2">Item 2</h4>
      <p>...</p>
      <h4 id="item-3">Item 3</h4>
      <p>...</p>
      <h5 id="item-3-1">Item 3-1</h5>
      <p>...</p>
      <h5 id="item-3-2">Item 3-2</h5>
      <p>...</p>
    </div>
  </div>
</div>
```

---

### 2.3 Exemplo com Grupo de Lista (.list-group)
Ideal para menus laterais de configurações, relatórios ou filtros analíticos:

```html
<div class="row">
  <div class="col-4">
    <div id="scrollspy_list_group" class="list-group">
      <a class="list-group-item list-group-item-action" href="#list-item-1">Item 1</a>
      <a class="list-group-item list-group-item-action" href="#list-item-2">Item 2</a>
      <a class="list-group-item list-group-item-action" href="#list-item-3">Item 3</a>
      <a class="list-group-item list-group-item-action" href="#list-item-4">Item 4</a>
    </div>
  </div>
  <div class="col-8">
    <div data-bs-spy="scroll" data-bs-target="#scrollspy_list_group" data-bs-offset="15" class="scrollspy-example" tabindex="0">
      <h5 id="list-item-1">Item 1</h5>
      <p>...</p>
      <h5 id="list-item-2">Item 2</h5>
      <p>...</p>
      <h5 id="list-item-3">Item 3</h5>
      <p>...</p>
      <h5 id="list-item-4">Item 4</h5>
      <p>...</p>
    </div>
  </div>
</div>
```

---

### 2.4 Exemplo de Barra Lateral Fixa (.content-inner & .sidebar-sticky)
Para dashboards operacionais e formulários extensos:

```html
<div class="content-inner" data-bs-spy="scroll" data-bs-target=".sidebar-component-right">
  <div class="content-body">
    ...
  </div>
  <div class="sidebar sidebar-component sidebar-component-right sidebar-sticky">
    <div class="sidebar-content">
      ...
    </div>
  </div>
</div>
```

---

## 3. Utilização via JavaScript

### 3.1 Inicialização
```javascript
// Inicialização direta no elemento
const scrollspyElement = document.querySelector('.content-inner');
const scrollSpy = new bootstrap.ScrollSpy(scrollspyElement, {
  target: '.sidebar-component-right',
  offset: 15
});
```

### 3.2 Os 4 Métodos Suportados
1. **`refresh()`**: Recalcula as coordenadas e atualiza alvos do DOM após adições ou remoções dinâmicas de seções.
   ```javascript
   const instance = bootstrap.ScrollSpy.getInstance(element);
   instance.refresh();
   ```
2. **`dispose()`**: Destrói a instância do ScrollSpy e remove todos os listeners de eventos acoplados.
   ```javascript
   instance.dispose();
   ```
3. **`getInstance(element)`**: Método estático que retorna a instância existente associada ao elemento DOM, ou `undefined`.
   ```javascript
   const instance = bootstrap.ScrollSpy.getInstance(element);
   ```
4. **`getOrCreateInstance(element, options)`**: Método estático que retorna a instância existente ou instancia uma nova caso ainda não exista.
   ```javascript
   const instance = bootstrap.ScrollSpy.getOrCreateInstance(element, { target: '#meu-nav' });
   ```

---

## 4. Tabela Oficial de Opções

| Nome (PT / EN) | Tipo | Padrão | Descrição |
|---|---|---|---|
| `desvio` / `offset` | número | `10` | Pixels a serem deslocados do topo ao calcular a posição da rolagem. |
| `metodo` / `method` | string | `'auto'` | Encontra a seção ativa: `'auto'`, `'offset'` (`getBoundingClientRect`) ou `'position'` (`offsetTop / offsetLeft`). |
| `alvo` / `target` | string \| DOM | — | Especifica o seletor ou elemento de navegação ao qual o Scrollspy será aplicado. |

---

## 5. Eventos do Scrollspy

| Tipo de Evento | Descrição |
|---|---|
| `activate.bs.scrollspy` | Disparado no container de rolagem e no `window` sempre que um novo destino é ativado pelo Scrollspy. O detalhe traz `e.detail.relatedTarget` com o `#id` do destino ativo. |

Exemplo de consumo:
```javascript
const scrollSpyEl = document.querySelector('[data-bs-spy="scroll"]');
scrollSpyEl.addEventListener('activate.bs.scrollspy', function (e) {
  console.log('Novo alvo ativo:', e.detail.relatedTarget);
});
```

---

## 6. Utilização em React / Next.js no EDDIE

No frontend Next.js do EDDIE, além dos atributos HTML convencionais, é fornecido o React Hook `useScrollSpy`:

```typescript
import { useScrollSpy } from '@/components/scrollspy';

export function MinhaPagina() {
  const { activeId, scrollTo, refresh } = useScrollSpy({
    target: '#minha-navbar',
    offset: 20,
    onActiveChange: (id) => console.log('Seção ativa:', id)
  });

  return (
    <div>
      <p>Seção Atual: {activeId}</p>
      <button onClick={() => scrollTo('secao-financeiro')}>Ir para Financeiro</button>
    </div>
  );
}
```
