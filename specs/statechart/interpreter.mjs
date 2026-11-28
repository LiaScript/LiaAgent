// A small statechart interpreter for XState-v5-compatible JSON configs (E20 prototype).
// It covers the subset the LiaAgent machines use: nested states, `initial`, eventless `always` transitions with
// named guards, `on` transitions with named guards and named actions, `#id` / `#id.child` / sibling targets and
// `meta`. Guards and actions are passed in by name, as in XState's `setup({ guards, actions })`, so the same JSON
// runs unchanged in XState (`createMachine(config).provide(...)`) once the package may be installed.
//
// Two uses:
// - resolve(context): the state a journal is in, read from its facts (rehydration – the journal is the truth);
// - transition(path, event, context): what an event (a task's write) leads to; the model-based test checks that
//   the declared target is the state the changed facts resolve to.

export function createMachine(config, { guards = {}, actions = {} } = {}) {
  const ids = new Map();
  const index = (node, path) => {
    node.path = path;
    if (node.id) ids.set(node.id, path);
    for (const [key, child] of Object.entries(node.states ?? {})) index(child, [...path, key]);
  };
  index(config, []);
  if (config.id) ids.set(config.id, []);

  const nodeAt = path => path.reduce((node, key) => {
    const next = node.states?.[key];
    if (!next) throw new Error(`no state ${path.join(".")}`);
    return next;
  }, config);

  const test = (guard, context, event) => {
    if (!guard) return true;
    const fn = guards[guard];
    if (!fn) throw new Error(`unknown guard ${guard}`);
    return Boolean(fn({ context, event }));
  };

  const run = (names, context, event) => [].concat(names ?? []).reduce((ctx, name) => {
    const fn = actions[name];
    if (!fn) throw new Error(`unknown action ${name}`);
    return { ...ctx, ...fn({ context: ctx, event }) };
  }, context);

  // "#unit.written.passed", "#passed", ".child" (relative to the source), "sibling".
  const targetPath = (target, source) => {
    if (target.startsWith("#")) {
      const [id, ...rest] = target.slice(1).split(".");
      if (!ids.has(id)) throw new Error(`unknown id ${id}`);
      return [...ids.get(id), ...rest];
    }
    if (target.startsWith(".")) return [...source, ...target.slice(1).split(".")];
    return [...source.slice(0, -1), ...target.split(".")];
  };

  // Enter a state: follow its eventless transitions and its initial child down to a leaf.
  const enter = (path, context, event, seen = 0) => {
    if (seen > 50) throw new Error(`always loop at ${path.join(".")}`);
    const node = nodeAt(path);
    for (const candidate of [].concat(node.always ?? [])) {
      if (test(candidate.guard, context, event)) {
        const next = run(candidate.actions, context, event);
        return enter(targetPath(candidate.target, path), next, event, seen + 1);
      }
    }
    if (node.states) {
      const first = node.initial ?? Object.keys(node.states)[0];
      return enter([...path, first], context, event, seen + 1);
    }
    return { path, context };
  };

  const machine = {
    config,
    nodeAt,
    resolve: context => enter([], context, { type: "xstate.init" }),
    // The first `on` handler from the leaf upwards whose guard holds; null when the event is not allowed here.
    transition(path, event, context) {
      for (let depth = path.length; depth >= 0; depth--) {
        const source = path.slice(0, depth);
        const handlers = nodeAt(source).on?.[event.type];
        if (!handlers) continue;
        for (const handler of [].concat(handlers).map(item => typeof item === "string" ? { target: item } : item)) {
          if (!test(handler.guard, context, event)) continue;
          const next = run(handler.actions, context, event);
          const target = handler.target ? targetPath(handler.target, source) : path;
          return { ...enter(target, next, event), declared: target };
        }
      }
      return null;
    },
    // Every event an `on` map from the leaf upwards names.
    events(path) {
      const names = new Set();
      for (let depth = path.length; depth >= 0; depth--) Object.keys(nodeAt(path.slice(0, depth)).on ?? {}).forEach(name => names.add(name));
      return [...names];
    },
    // The leaf's meta, merged from the root down (a child overrides its parent).
    meta: path => path.reduce((acc, _, i) => ({ ...acc, ...(nodeAt(path.slice(0, i + 1)).meta ?? {}) }), { ...(config.meta ?? {}) }),
    leaves() {
      const out = [];
      const walk = (node, path) => node.states ? Object.entries(node.states).forEach(([key, child]) => walk(child, [...path, key])) : out.push(path);
      walk(config, []);
      return out;
    }
  };
  return machine;
}

// Mermaid stateDiagram-v2 of a config: the process as a picture (Stately Studio shows the same JSON interactively).
export function toMermaid(config, { title } = {}) {
  const lines = ["stateDiagram-v2"];
  if (title) lines.unshift(`---\ntitle: ${title}\n---`);
  const name = path => path.length ? path.join("_") : "root";
  const ids = new Map();
  const index = (node, path) => { if (node.id) ids.set(node.id, path); for (const [k, c] of Object.entries(node.states ?? {})) index(c, [...path, k]); };
  index(config, []);
  const resolveTarget = (target, source) => {
    if (target.startsWith("#")) { const [id, ...rest] = target.slice(1).split("."); return [...(ids.get(id) ?? []), ...rest]; }
    if (target.startsWith(".")) return [...source, ...target.slice(1).split(".")];
    return [...source.slice(0, -1), ...target.split(".")];
  };
  const edges = [];
  const rootEvents = [];
  const walk = (node, path, indent) => {
    const pad = "  ".repeat(indent);
    if (node.states) {
      if (path.length) lines.push(`${pad}state "${path.at(-1)}" as ${name(path)} {`);
      const inner = path.length ? pad + "  " : pad;
      const first = node.initial ?? Object.keys(node.states)[0];
      if (!node.always) lines.push(`${inner}[*] --> ${name([...path, first])}`);
      for (const [key, child] of Object.entries(node.states)) walk(child, [...path, key], path.length ? indent + 1 : indent);
      if (path.length) lines.push(`${pad}}`);
    } else {
      const action = node.meta?.action;
      lines.push(`${pad}state "${path.at(-1)}${action ? `<br/><i>${action}</i>` : ""}" as ${name(path)}`);
    }
    for (const [event, handlers] of Object.entries(node.on ?? {})) {
      for (const handler of [].concat(handlers).map(item => typeof item === "string" ? { target: item } : item)) {
        // Events on the machine itself (allowed in every state) are listed in a note, not drawn from everywhere.
        if (handler.target && path.length) edges.push(`${name(path)} --> ${name(resolveTarget(handler.target, path))}: ${event}`);
        else if (handler.target) rootEvents.push(`${event} → ${resolveTarget(handler.target, path).join(".")}`);
      }
    }
  };
  walk(config, [], 1);
  const note = rootEvents.length ? [`  note "in every state: ${[...new Set(rootEvents)].join(", ")}" as everywhere`] : [];
  return [...lines, ...edges.map(edge => "  " + edge), ...note].join("\n");
}
