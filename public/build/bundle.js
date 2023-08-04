
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.31.2 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.31.2 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.31.2 */
    const file = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true });
    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("to" in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("to" in $$props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$new_props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 8320) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			 $$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			 $$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 23553) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /**
     * An action to be added at a root element of your application to
     * capture all relative links and push them onto the history stack.
     *
     * Example:
     * ```html
     * <div use:links>
     *   <Router>
     *     <Route path="/" component={Home} />
     *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
     *     {#each projects as project}
     *       <a href="/p/{project.id}">{project.title}</a>
     *     {/each}
     *   </Router>
     * </div>
     * ```
     */
    function links(node) {
      function findClosest(tagName, el) {
        while (el && el.tagName !== tagName) {
          el = el.parentNode;
        }
        return el;
      }

      function onClick(event) {
        const anchor = findClosest("A", event.target);

        if (
          anchor &&
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event) &&
          !anchor.hasAttribute("noroute")
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src\components\Navbar.svelte generated by Svelte v3.31.2 */
    const file$1 = "src\\components\\Navbar.svelte";

    // (58:4) <Router>
    function create_default_slot(ctx) {
    	let a0;
    	let t0;
    	let t1;
    	let a1;
    	let t2;
    	let t3;
    	let a2;
    	let t4;
    	let t5;
    	let a3;
    	let t6;
    	let t7;
    	let a4;
    	let t8;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			t0 = text("About");
    			t1 = space();
    			a1 = element("a");
    			t2 = text("Experience");
    			t3 = space();
    			a2 = element("a");
    			t4 = text("Projects");
    			t5 = space();
    			a3 = element("a");
    			t6 = text("Contact");
    			t7 = space();
    			a4 = element("a");
    			t8 = text("Resume");
    			this.h();
    		},
    		l: function claim(nodes) {
    			a0 = claim_element(nodes, "A", {
    				href: true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true,
    				noroute: true
    			});

    			var a0_nodes = children(a0);
    			t0 = claim_text(a0_nodes, "About");
    			a0_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);

    			a1 = claim_element(nodes, "A", {
    				href: true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true,
    				noroute: true
    			});

    			var a1_nodes = children(a1);
    			t2 = claim_text(a1_nodes, "Experience");
    			a1_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);

    			a2 = claim_element(nodes, "A", {
    				href: true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true,
    				noroute: true
    			});

    			var a2_nodes = children(a2);
    			t4 = claim_text(a2_nodes, "Projects");
    			a2_nodes.forEach(detach_dev);
    			t5 = claim_space(nodes);

    			a3 = claim_element(nodes, "A", {
    				href: true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true,
    				noroute: true
    			});

    			var a3_nodes = children(a3);
    			t6 = claim_text(a3_nodes, "Contact");
    			a3_nodes.forEach(detach_dev);
    			t7 = claim_space(nodes);

    			a4 = claim_element(nodes, "A", {
    				href: true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				"data-aos-duration": true,
    				target: true,
    				noroute: true
    			});

    			var a4_nodes = children(a4);
    			t8 = claim_text(a4_nodes, "Resume");
    			a4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a0, "href", "/#about");
    			attr_dev(a0, "data-aos", "zoom-in");
    			attr_dev(a0, "data-aos-delay", "100");
    			attr_dev(a0, "data-aos-duration", "700");
    			attr_dev(a0, "class", "ml-auto nav-text");
    			attr_dev(a0, "noroute", "");
    			add_location(a0, file$1, 58, 6, 1747);
    			attr_dev(a1, "href", "/#experience");
    			attr_dev(a1, "data-aos", "zoom-in");
    			attr_dev(a1, "data-aos-delay", "200");
    			attr_dev(a1, "data-aos-duration", "700");
    			attr_dev(a1, "class", "nav-text");
    			attr_dev(a1, "noroute", "");
    			add_location(a1, file$1, 66, 6, 1941);
    			attr_dev(a2, "href", "/#web-development");
    			attr_dev(a2, "data-aos", "zoom-in");
    			attr_dev(a2, "data-aos-delay", "300");
    			attr_dev(a2, "data-aos-duration", "700");
    			attr_dev(a2, "class", "nav-text");
    			attr_dev(a2, "noroute", "");
    			add_location(a2, file$1, 74, 6, 2137);
    			attr_dev(a3, "href", "/#contact");
    			attr_dev(a3, "data-aos", "zoom-in");
    			attr_dev(a3, "data-aos-delay", "600");
    			attr_dev(a3, "data-aos-duration", "700");
    			attr_dev(a3, "class", "nav-text");
    			attr_dev(a3, "noroute", "");
    			add_location(a3, file$1, 82, 6, 2336);
    			attr_dev(a4, "href", "/Chaitanya_Patel_Resume.pdf");
    			attr_dev(a4, "data-aos", "zoom-in");
    			attr_dev(a4, "data-aos-delay", "700");
    			attr_dev(a4, "class", "nav-text");
    			attr_dev(a4, "data-aos-duration", "700");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "noroute", "");
    			add_location(a4, file$1, 91, 6, 2528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a2, anchor);
    			append_dev(a2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, a3, anchor);
    			append_dev(a3, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, a4, anchor);
    			append_dev(a4, t8);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(a3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(a4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(58:4) <Router>",
    		ctx
    	});

    	return block;
    }

    // (125:0) {#if open}
    function create_if_block$1(ctx) {
    	let div0;
    	let div0_transition;
    	let t0;
    	let dialog;
    	let div1;
    	let button0;
    	let i0;
    	let t1;
    	let nav;
    	let a0;
    	let t2;
    	let t3;
    	let a1;
    	let t4;
    	let t5;
    	let a2;
    	let t6;
    	let t7;
    	let a3;
    	let t8;
    	let t9;
    	let a4;
    	let t10;
    	let t11;
    	let a5;
    	let t12;
    	let t13;
    	let a6;
    	let t14;
    	let t15;
    	let div2;
    	let button1;
    	let i1;
    	let i1_class_value;
    	let t16_value = (/*theme*/ ctx[0] === "dark" ? "Dark" : "Light") + "";
    	let t16;
    	let dialog_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			dialog = element("dialog");
    			div1 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t1 = space();
    			nav = element("nav");
    			a0 = element("a");
    			t2 = text("About Me");
    			t3 = space();
    			a1 = element("a");
    			t4 = text("Experience");
    			t5 = space();
    			a2 = element("a");
    			t6 = text("Web Development");
    			t7 = space();
    			a3 = element("a");
    			t8 = text("Game Development");
    			t9 = space();
    			a4 = element("a");
    			t10 = text("Graphic Design");
    			t11 = space();
    			a5 = element("a");
    			t12 = text("Contact Me");
    			t13 = space();
    			a6 = element("a");
    			t14 = text("Resume");
    			t15 = space();
    			div2 = element("div");
    			button1 = element("button");
    			i1 = element("i");
    			t16 = text(t16_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div0 = claim_element(nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t0 = claim_space(nodes);
    			dialog = claim_element(nodes, "DIALOG", { open: true, class: true });
    			var dialog_nodes = children(dialog);
    			div1 = claim_element(dialog_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			button0 = claim_element(div1_nodes, "BUTTON", {
    				title: true,
    				"aria-label": true,
    				class: true
    			});

    			var button0_nodes = children(button0);
    			i0 = claim_element(button0_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t1 = claim_space(dialog_nodes);
    			nav = claim_element(dialog_nodes, "NAV", { class: true });
    			var nav_nodes = children(nav);

    			a0 = claim_element(nav_nodes, "A", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				href: true
    			});

    			var a0_nodes = children(a0);
    			t2 = claim_text(a0_nodes, "About Me");
    			a0_nodes.forEach(detach_dev);
    			t3 = claim_space(nav_nodes);

    			a1 = claim_element(nav_nodes, "A", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				href: true
    			});

    			var a1_nodes = children(a1);
    			t4 = claim_text(a1_nodes, "Experience");
    			a1_nodes.forEach(detach_dev);
    			t5 = claim_space(nav_nodes);

    			a2 = claim_element(nav_nodes, "A", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				href: true
    			});

    			var a2_nodes = children(a2);
    			t6 = claim_text(a2_nodes, "Web Development");
    			a2_nodes.forEach(detach_dev);
    			t7 = claim_space(nav_nodes);

    			a3 = claim_element(nav_nodes, "A", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				href: true
    			});

    			var a3_nodes = children(a3);
    			t8 = claim_text(a3_nodes, "Game Development");
    			a3_nodes.forEach(detach_dev);
    			t9 = claim_space(nav_nodes);

    			a4 = claim_element(nav_nodes, "A", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				href: true
    			});

    			var a4_nodes = children(a4);
    			t10 = claim_text(a4_nodes, "Graphic Design");
    			a4_nodes.forEach(detach_dev);
    			t11 = claim_space(nav_nodes);

    			a5 = claim_element(nav_nodes, "A", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				href: true
    			});

    			var a5_nodes = children(a5);
    			t12 = claim_text(a5_nodes, "Contact Me");
    			a5_nodes.forEach(detach_dev);
    			t13 = claim_space(nav_nodes);

    			a6 = claim_element(nav_nodes, "A", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true,
    				target: true,
    				href: true
    			});

    			var a6_nodes = children(a6);
    			t14 = claim_text(a6_nodes, "Resume");
    			a6_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			t15 = claim_space(dialog_nodes);
    			div2 = claim_element(dialog_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);

    			button1 = claim_element(div2_nodes, "BUTTON", {
    				title: true,
    				"aria-label": true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var button1_nodes = children(button1);
    			i1 = claim_element(button1_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			t16 = claim_text(button1_nodes, t16_value);
    			button1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			dialog_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "backdrop-blur-md fixed z-50 inset-0");
    			add_location(div0, file$1, 125, 2, 3511);
    			attr_dev(i0, "class", "fas fa-times fa-sm");
    			add_location(i0, file$1, 141, 9, 4110);
    			attr_dev(button0, "title", "Close navigation menu");
    			attr_dev(button0, "aria-label", "Close navigation menu");
    			attr_dev(button0, "class", "text-right text-lg text-gray-800 dark:text-gray-50 bg-gray-50 dark:bg-gray-800 px-3 py-1");
    			add_location(button0, file$1, 136, 6, 3862);
    			attr_dev(div1, "class", "text-right py-2 px-2");
    			add_location(div1, file$1, 135, 4, 3820);
    			attr_dev(a0, "data-aos", "slide-left");
    			attr_dev(a0, "data-aos-delay", "200");
    			attr_dev(a0, "class", "block bg-gray-50 dark:bg-gray-800 p-5");
    			attr_dev(a0, "href", "/#about");
    			add_location(a0, file$1, 147, 6, 4280);
    			attr_dev(a1, "data-aos", "slide-right");
    			attr_dev(a1, "data-aos-delay", "200");
    			attr_dev(a1, "class", "block bg-gray-50 dark:bg-gray-800 p-5");
    			attr_dev(a1, "href", "/#experience");
    			add_location(a1, file$1, 156, 6, 4510);
    			attr_dev(a2, "data-aos", "slide-left");
    			attr_dev(a2, "data-aos-delay", "200");
    			attr_dev(a2, "class", "block bg-gray-50 dark:bg-gray-800 p-5");
    			attr_dev(a2, "href", "/#web-development");
    			add_location(a2, file$1, 163, 6, 4730);
    			attr_dev(a3, "data-aos", "slide-right");
    			attr_dev(a3, "data-aos-delay", "200");
    			attr_dev(a3, "class", "block bg-gray-50 dark:bg-gray-800 p-5");
    			attr_dev(a3, "href", "/#game-development");
    			add_location(a3, file$1, 173, 6, 4979);
    			attr_dev(a4, "data-aos", "slide-left");
    			attr_dev(a4, "data-aos-delay", "200");
    			attr_dev(a4, "class", "block bg-gray-50 dark:bg-gray-800 p-5");
    			attr_dev(a4, "href", "/#graphic-design");
    			add_location(a4, file$1, 183, 6, 5231);
    			attr_dev(a5, "data-aos", "slide-right");
    			attr_dev(a5, "data-aos-delay", "200");
    			attr_dev(a5, "class", "block bg-gray-50 dark:bg-gray-800 p-5");
    			attr_dev(a5, "href", "/#contact");
    			add_location(a5, file$1, 192, 6, 5476);
    			attr_dev(a6, "data-aos", "slide-left");
    			attr_dev(a6, "data-aos-delay", "200");
    			attr_dev(a6, "class", "block bg-gray-50 dark:bg-gray-800 p-5");
    			attr_dev(a6, "target", "_blank");
    			attr_dev(a6, "href", "/Resume - Bob Shoaun Ng.pdf");
    			add_location(a6, file$1, 202, 6, 5713);
    			attr_dev(nav, "class", "mb-3 text-center font-mono text-gray-800 dark:text-gray-50 space-y-2");
    			add_location(nav, file$1, 144, 4, 4177);

    			attr_dev(i1, "class", i1_class_value = "" + ((/*theme*/ ctx[0] === "dark"
    			? "fa fa-moon"
    			: "far fa-sun") + " mr-2"));

    			add_location(i1, file$1, 221, 9, 6292);
    			attr_dev(button1, "title", "Close navigation menu");
    			attr_dev(button1, "aria-label", "toggle theme");
    			attr_dev(button1, "data-aos", "flip-up");
    			attr_dev(button1, "data-aos-delay", "400");
    			attr_dev(button1, "class", "border-gray-500 border-2 py-2 px-4 dark:text-gray-50 rounded-md");
    			add_location(button1, file$1, 214, 6, 6029);
    			attr_dev(div2, "class", "text-center");
    			add_location(div2, file$1, 213, 4, 5996);
    			dialog.open = true;
    			attr_dev(dialog, "class", "fixed top-0 left-0 right-0 z-50 p-0 py-4 shadow-2xl w-full bg-white dark:bg-gray-900");
    			add_location(dialog, file$1, 130, 2, 3652);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, dialog, anchor);
    			append_dev(dialog, div1);
    			append_dev(div1, button0);
    			append_dev(button0, i0);
    			append_dev(dialog, t1);
    			append_dev(dialog, nav);
    			append_dev(nav, a0);
    			append_dev(a0, t2);
    			append_dev(nav, t3);
    			append_dev(nav, a1);
    			append_dev(a1, t4);
    			append_dev(nav, t5);
    			append_dev(nav, a2);
    			append_dev(a2, t6);
    			append_dev(nav, t7);
    			append_dev(nav, a3);
    			append_dev(a3, t8);
    			append_dev(nav, t9);
    			append_dev(nav, a4);
    			append_dev(a4, t10);
    			append_dev(nav, t11);
    			append_dev(nav, a5);
    			append_dev(a5, t12);
    			append_dev(nav, t13);
    			append_dev(nav, a6);
    			append_dev(a6, t14);
    			append_dev(dialog, t15);
    			append_dev(dialog, div2);
    			append_dev(div2, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t16);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(a0, "click", /*click_handler_3*/ ctx[6], false, false, false),
    					listen_dev(a1, "click", /*click_handler_4*/ ctx[7], false, false, false),
    					listen_dev(a2, "click", /*click_handler_5*/ ctx[8], false, false, false),
    					listen_dev(a3, "click", /*click_handler_6*/ ctx[9], false, false, false),
    					listen_dev(a4, "click", /*click_handler_7*/ ctx[10], false, false, false),
    					listen_dev(a5, "click", /*click_handler_8*/ ctx[11], false, false, false),
    					listen_dev(a6, "click", /*click_handler_9*/ ctx[12], false, false, false),
    					listen_dev(button1, "click", /*toggleTheme*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*theme*/ 1 && i1_class_value !== (i1_class_value = "" + ((/*theme*/ ctx[0] === "dark"
    			? "fa fa-moon"
    			: "far fa-sun") + " mr-2"))) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if ((!current || dirty & /*theme*/ 1) && t16_value !== (t16_value = (/*theme*/ ctx[0] === "dark" ? "Dark" : "Light") + "")) set_data_dev(t16, t16_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 500 }, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!dialog_transition) dialog_transition = create_bidirectional_transition(dialog, slide, { duration: 500 }, true);
    				dialog_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 500 }, false);
    			div0_transition.run(0);
    			if (!dialog_transition) dialog_transition = create_bidirectional_transition(dialog, slide, { duration: 500 }, false);
    			dialog_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(dialog);
    			if (detaching && dialog_transition) dialog_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(125:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let nav;
    	let a0;
    	let p;
    	let t0;
    	let t1;
    	let a1;
    	let t2;
    	let t3;
    	let div;
    	let router;
    	let t4;
    	let button0;
    	let i0;
    	let i0_class_value;
    	let t5_value = (/*theme*/ ctx[0] === "dark" ? "Dark" : "Light") + "";
    	let t5;
    	let t6;
    	let button1;
    	let i1;
    	let t7;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*open*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			a0 = element("a");
    			p = element("p");
    			t0 = text("C");
    			t1 = space();
    			a1 = element("a");
    			t2 = text("Chaitanya Patel");
    			t3 = space();
    			div = element("div");
    			create_component(router.$$.fragment);
    			t4 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t5 = text(t5_value);
    			t6 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t7 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			nav = claim_element(nodes, "NAV", { id: true, class: true });
    			var nav_nodes = children(nav);

    			a0 = claim_element(nav_nodes, "A", {
    				"aria-label": true,
    				href: true,
    				"data-aos": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			var a0_nodes = children(a0);
    			p = claim_element(a0_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, "C");
    			p_nodes.forEach(detach_dev);
    			a0_nodes.forEach(detach_dev);
    			t1 = claim_space(nav_nodes);

    			a1 = claim_element(nav_nodes, "A", {
    				href: true,
    				"data-aos": true,
    				class: true
    			});

    			var a1_nodes = children(a1);
    			t2 = claim_text(a1_nodes, "Chaitanya Patel");
    			a1_nodes.forEach(detach_dev);
    			t3 = claim_space(nav_nodes);
    			div = claim_element(nav_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(router.$$.fragment, div_nodes);
    			t4 = claim_space(div_nodes);

    			button0 = claim_element(div_nodes, "BUTTON", {
    				title: true,
    				"aria-label": true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			var button0_nodes = children(button0);
    			i0 = claim_element(button0_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			t5 = claim_text(button0_nodes, t5_value);
    			button0_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			t6 = claim_space(nav_nodes);

    			button1 = claim_element(nav_nodes, "BUTTON", {
    				title: true,
    				"aria-label": true,
    				class: true
    			});

    			var button1_nodes = children(button1);
    			i1 = claim_element(button1_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			button1_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			t7 = claim_space(nodes);
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "logo-type text-white dark:text-gray-900 text-3xl font-black absolute bottom-0 svelte-1csidri");
    			add_location(p, file$1, 48, 4, 1444);
    			attr_dev(a0, "aria-label", "My logo");
    			attr_dev(a0, "href", "/#home");
    			attr_dev(a0, "data-aos", "flip-up");
    			attr_dev(a0, "data-aos-duration", "700");
    			attr_dev(a0, "class", "overflow-hidden bg-gradient-to-br from-cyan-400 to-pink-400 w-6 h-6 relative");
    			add_location(a0, file$1, 41, 2, 1243);
    			attr_dev(a1, "href", "/#home");
    			attr_dev(a1, "data-aos", "flip-up");
    			attr_dev(a1, "class", "nav-text-home");
    			add_location(a1, file$1, 54, 2, 1577);

    			attr_dev(i0, "class", i0_class_value = "" + ((/*theme*/ ctx[0] === "dark"
    			? "fa fa-moon"
    			: "far fa-sun") + " mr-2"));

    			add_location(i0, file$1, 109, 7, 3127);
    			attr_dev(button0, "title", "toggle theme");
    			attr_dev(button0, "aria-label", "toggle theme");
    			attr_dev(button0, "data-aos", "flip-up");
    			attr_dev(button0, "data-aos-delay", "800");
    			attr_dev(button0, "data-aos-duration", "700");
    			attr_dev(button0, "class", "text-sm font-semibold border-gray-500 border-2 hover:bg-gray-200 dark:hover:bg-gray-700 py-1.5 px-3 dark:text-gray-50 rounded-md transition-colors");
    			add_location(button0, file$1, 101, 4, 2773);
    			attr_dev(div, "class", "hidden lg:flex gap-9 items-center ml-auto");
    			add_location(div, file$1, 56, 2, 1660);
    			attr_dev(i1, "class", "fas fa-bars");
    			add_location(i1, file$1, 120, 5, 3447);
    			attr_dev(button1, "title", "Navigation Menu");
    			attr_dev(button1, "aria-label", "Navigation Menu");
    			attr_dev(button1, "class", "lg:hidden text-lg ml-auto dark:text-white");
    			add_location(button1, file$1, 115, 2, 3278);
    			attr_dev(nav, "id", "navbar");
    			attr_dev(nav, "class", "flex items-center gap-4 px-6 lg:px-10 py-4 top-0 bg-white/80\r\n  dark:bg-gray-900/80 backdrop-blur-md shadow-md fixed w-full z-50 svelte-1csidri");
    			add_location(nav, file$1, 36, 0, 1077);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a0);
    			append_dev(a0, p);
    			append_dev(p, t0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(a1, t2);
    			append_dev(nav, t3);
    			append_dev(nav, div);
    			mount_component(router, div, null);
    			append_dev(div, t4);
    			append_dev(div, button0);
    			append_dev(button0, i0);
    			append_dev(button0, t5);
    			append_dev(nav, t6);
    			append_dev(nav, button1);
    			append_dev(button1, i1);
    			insert_dev(target, t7, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggleTheme*/ ctx[2], false, false, false),
    					action_destroyer(links.call(null, div)),
    					listen_dev(button1, "click", /*click_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);

    			if (!current || dirty & /*theme*/ 1 && i0_class_value !== (i0_class_value = "" + ((/*theme*/ ctx[0] === "dark"
    			? "fa fa-moon"
    			: "far fa-sun") + " mr-2"))) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if ((!current || dirty & /*theme*/ 1) && t5_value !== (t5_value = (/*theme*/ ctx[0] === "dark" ? "Dark" : "Light") + "")) set_data_dev(t5, t5_value);

    			if (/*open*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(router);
    			if (detaching) detach_dev(t7);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const scrollThreshold = 10;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	const dispatch = createEventDispatcher();
    	let open = false;
    	let { theme } = $$props;
    	const toggleTheme = () => dispatch("toggleTheme");

    	onMount(() => {
    		/* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
    		let prevScrollPos = window.pageYOffset;

    		const navbar = document.getElementById("navbar");

    		window.onscroll = () => {
    			const currentScrollPos = window.pageYOffset;
    			if (prevScrollPos > currentScrollPos) navbar.style.transform = "translateY(0)"; else navbar.style.transform = `translateY(-${navbar.offsetHeight}px)`;
    			prevScrollPos = currentScrollPos;
    		};

    		// show navbar when hover over
    		onmousemove = e => {
    			if (e.clientY < navbar.offsetHeight) navbar.style.transform = "translateY(0)";
    		};
    	});

    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, open = !open);
    	const click_handler_1 = () => $$invalidate(1, open = false);
    	const click_handler_2 = () => $$invalidate(1, open = false);
    	const click_handler_3 = () => $$invalidate(1, open = false);
    	const click_handler_4 = () => $$invalidate(1, open = false);
    	const click_handler_5 = () => $$invalidate(1, open = false);
    	const click_handler_6 = () => $$invalidate(1, open = false);
    	const click_handler_7 = () => $$invalidate(1, open = false);
    	const click_handler_8 = () => $$invalidate(1, open = false);
    	const click_handler_9 = () => $$invalidate(1, open = false);

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		fade,
    		onMount,
    		createEventDispatcher,
    		links,
    		Router,
    		link,
    		dispatch,
    		open,
    		theme,
    		scrollThreshold,
    		toggleTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(1, open = $$props.open);
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		theme,
    		open,
    		toggleTheme,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*theme*/ ctx[0] === undefined && !("theme" in props)) {
    			console.warn("<Navbar> was created without expected prop 'theme'");
    		}
    	}

    	get theme() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TextReveal.svelte generated by Svelte v3.31.2 */
    const file$2 = "src\\components\\TextReveal.svelte";

    function create_fragment$4(ctx) {
    	let div2;
    	let p;
    	let t;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			p = element("p");
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			p = claim_element(div2_nodes, "P", { id: true, class: true, style: true });
    			var p_nodes = children(p);
    			p_nodes.forEach(detach_dev);
    			t = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { id: true, class: true, style: true });
    			children(div0).forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "id", "text");
    			attr_dev(p, "class", "opacity-0");
    			set_style(p, "animation-delay", /*delay*/ ctx[1] + "ms");
    			add_location(p, file$2, 21, 2, 579);
    			attr_dev(div0, "id", "cover");
    			attr_dev(div0, "class", "absolute inset-0 bg-current transform-gpu -translate-x-[101%]");
    			set_style(div0, "animation-delay", /*delay*/ ctx[1] + "ms");
    			add_location(div0, file$2, 25, 4, 747);
    			attr_dev(div1, "class", "absolute overflow-hidden pointer-events-none inset-0");
    			add_location(div1, file$2, 24, 2, 675);
    			attr_dev(div2, "class", "relative inline-block");
    			add_location(div2, file$2, 20, 0, 517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p);
    			p.innerHTML = /*text*/ ctx[0];
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			/*div2_binding*/ ctx[4](div2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) p.innerHTML = /*text*/ ctx[0];
    			if (dirty & /*delay*/ 2) {
    				set_style(p, "animation-delay", /*delay*/ ctx[1] + "ms");
    			}

    			if (dirty & /*delay*/ 2) {
    				set_style(div0, "animation-delay", /*delay*/ ctx[1] + "ms");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*div2_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextReveal", slots, []);
    	let { text = "" } = $$props;
    	let { delay = 200 } = $$props;
    	let { once = false } = $$props;
    	let textReveal;

    	onMount(() => {
    		const observer = new IntersectionObserver(entries => {
    				entries.forEach(entry => {
    					if (once) {
    						if (entry.isIntersecting) entry.target.classList.add("reveal");
    					} else entry.target.classList.toggle("reveal", entry.isIntersecting);
    				});
    			});

    		observer.observe(textReveal);
    	});

    	const writable_props = ["text", "delay", "once"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextReveal> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			textReveal = $$value;
    			$$invalidate(2, textReveal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("delay" in $$props) $$invalidate(1, delay = $$props.delay);
    		if ("once" in $$props) $$invalidate(3, once = $$props.once);
    	};

    	$$self.$capture_state = () => ({ text, delay, once, onMount, textReveal });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("delay" in $$props) $$invalidate(1, delay = $$props.delay);
    		if ("once" in $$props) $$invalidate(3, once = $$props.once);
    		if ("textReveal" in $$props) $$invalidate(2, textReveal = $$props.textReveal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, delay, textReveal, once, div2_binding];
    }

    class TextReveal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { text: 0, delay: 1, once: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextReveal",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get text() {
    		throw new Error("<TextReveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<TextReveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<TextReveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<TextReveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get once() {
    		throw new Error("<TextReveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set once(value) {
    		throw new Error("<TextReveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    async function copyToClipboard(text) {
      await navigator.clipboard.writeText(text);
      alert(`copied ${text} to clipboard!`);
    }

    /* src\pages\Hero.svelte generated by Svelte v3.31.2 */
    const file$3 = "src\\pages\\Hero.svelte";

    // (59:8) <Link            to="resume"            class="transition-colors px-4 py-1 mr-3 lg:ml-1 inline-block bg-green-200 shadow-green-300/20 shadow-lg border rounded-sm border-green-400  hover:bg-green-300 "            noroute          >
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("View resume");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "View resume");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(59:8) <Link            to=\\\"resume\\\"            class=\\\"transition-colors px-4 py-1 mr-3 lg:ml-1 inline-block bg-green-200 shadow-green-300/20 shadow-lg border rounded-sm border-green-400  hover:bg-green-300 \\\"            noroute          >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section1;
    	let div0;
    	let t0;
    	let section0;
    	let div3;
    	let div1;
    	let t1;
    	let h1;
    	let textreveal0;
    	let t2;
    	let p;
    	let textreveal1;
    	let t3;
    	let div2;
    	let link;
    	let t4;
    	let a0;
    	let t5;
    	let t6;
    	let div5;
    	let a1;
    	let i0;
    	let t7;
    	let a2;
    	let i1;
    	let t8;
    	let a3;
    	let i2;
    	let t9;
    	let div4;
    	let t10;
    	let button;
    	let i3;
    	let current;
    	let mounted;
    	let dispose;

    	textreveal0 = new TextReveal({
    			props: {
    				delay: 800,
    				once: true,
    				text: /*welcomeMessage*/ ctx[0]
    			},
    			$$inline: true
    		});

    	textreveal1 = new TextReveal({
    			props: {
    				delay: 1000,
    				once: true,
    				text: "My name is Chaitanya, I build and design industry standard data and machine learning applications."
    			},
    			$$inline: true
    		});

    	link = new Link({
    			props: {
    				to: "resume",
    				class: "transition-colors px-4 py-1 mr-3 lg:ml-1 inline-block bg-green-200 shadow-green-300/20 shadow-lg border rounded-sm border-green-400  hover:bg-green-300 ",
    				noroute: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			div0 = element("div");
    			t0 = space();
    			section0 = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			t1 = space();
    			h1 = element("h1");
    			create_component(textreveal0.$$.fragment);
    			t2 = space();
    			p = element("p");
    			create_component(textreveal1.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			create_component(link.$$.fragment);
    			t4 = space();
    			a0 = element("a");
    			t5 = text("Let's talk");
    			t6 = space();
    			div5 = element("div");
    			a1 = element("a");
    			i0 = element("i");
    			t7 = space();
    			a2 = element("a");
    			i1 = element("i");
    			t8 = space();
    			a3 = element("a");
    			i2 = element("i");
    			t9 = space();
    			div4 = element("div");
    			t10 = space();
    			button = element("button");
    			i3 = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			section1 = claim_element(nodes, "SECTION", { id: true, class: true });
    			var section1_nodes = children(section1);

    			div0 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			children(div0).forEach(detach_dev);
    			t0 = claim_space(section1_nodes);

    			section0 = claim_element(section1_nodes, "SECTION", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var section0_nodes = children(section0);
    			div3 = claim_element(section0_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);

    			div1 = claim_element(div3_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			children(div1).forEach(detach_dev);
    			t1 = claim_space(div3_nodes);
    			h1 = claim_element(div3_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			claim_component(textreveal0.$$.fragment, h1_nodes);
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			p = claim_element(div3_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			claim_component(textreveal1.$$.fragment, p_nodes);
    			p_nodes.forEach(detach_dev);
    			t3 = claim_space(div3_nodes);

    			div2 = claim_element(div3_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			var div2_nodes = children(div2);
    			claim_component(link.$$.fragment, div2_nodes);
    			t4 = claim_space(div2_nodes);
    			a0 = claim_element(div2_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			t5 = claim_text(a0_nodes, "Let's talk");
    			a0_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			section0_nodes.forEach(detach_dev);
    			t6 = claim_space(section1_nodes);

    			div5 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			var div5_nodes = children(div5);

    			a1 = claim_element(div5_nodes, "A", {
    				title: true,
    				"aria-label": true,
    				href: true,
    				target: true,
    				class: true
    			});

    			var a1_nodes = children(a1);
    			i0 = claim_element(a1_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			a1_nodes.forEach(detach_dev);
    			t7 = claim_space(div5_nodes);

    			a2 = claim_element(div5_nodes, "A", {
    				title: true,
    				"aria-label": true,
    				href: true,
    				target: true,
    				class: true
    			});

    			var a2_nodes = children(a2);
    			i1 = claim_element(a2_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			a2_nodes.forEach(detach_dev);
    			t8 = claim_space(div5_nodes);

    			a3 = claim_element(div5_nodes, "A", {
    				title: true,
    				"aria-label": true,
    				href: true,
    				target: true,
    				class: true
    			});

    			var a3_nodes = children(a3);
    			i2 = claim_element(a3_nodes, "I", { class: true });
    			children(i2).forEach(detach_dev);
    			a3_nodes.forEach(detach_dev);
    			t9 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			children(div4).forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			t10 = claim_space(section1_nodes);

    			button = claim_element(section1_nodes, "BUTTON", {
    				title: true,
    				"aria-label": true,
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			var button_nodes = children(button);
    			i3 = claim_element(button_nodes, "I", { class: true });
    			children(i3).forEach(detach_dev);
    			button_nodes.forEach(detach_dev);
    			section1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "data-aos", "slide-down");
    			attr_dev(div0, "data-aos-delay", "700");
    			attr_dev(div0, "data-aos-duration", "700");
    			attr_dev(div0, "class", "absolute top-0 right-0 h-1/2 w-full md:w-1/3 md:h-full moving-gradient-1");
    			add_location(div0, file$3, 16, 2, 468);
    			attr_dev(div1, "data-aos", "flip-up");
    			attr_dev(div1, "data-aos-delay", "600");
    			attr_dev(div1, "data-aos-duration", "700");
    			attr_dev(div1, "class", "bg-purple-400 dark:bg-purple-300 shadow-purple-300/60 shadow-lg w-8 h-1.5 lg:w-10 lg:h-2 ml-0.5 mb-6");
    			add_location(div1, file$3, 31, 6, 870);
    			attr_dev(h1, "class", "mb-3 md:mb-6 font-mono font-black text-2xl md:text-3xl lg:text-5xl text-gray-700 dark:text-white");
    			add_location(h1, file$3, 37, 6, 1101);
    			attr_dev(p, "class", "text-lg md:text-xl lg:text-xl mb-8 font-bold text-gray-500 dark:text-gray-400 ml-1");
    			add_location(p, file$3, 42, 6, 1311);
    			attr_dev(a0, "href", "#contact");
    			attr_dev(a0, "class", "transition-colors px-4 py-1 inline-block bg-blue-200 shadow-blue-300/20 shadow-lg hover:bg-blue-300 rounded-sm border border-blue-400");
    			add_location(a0, file$3, 65, 8, 2092);
    			attr_dev(div2, "data-aos", "flip-up");
    			attr_dev(div2, "data-aos-delay", "1200");
    			attr_dev(div2, "data-aos-duration", "700");
    			attr_dev(div2, "class", "text-sm text-gray-700 font-semibold font-mono");
    			add_location(div2, file$3, 52, 6, 1634);
    			attr_dev(div3, "class", "bg-white dark:bg-gray-900 px-5 py-10 lg:py-14 lg:px-10 shadow-2xl");
    			add_location(div3, file$3, 28, 4, 770);
    			attr_dev(section0, "data-aos", "fade-in");
    			attr_dev(section0, "data-aos-delay", "600");
    			attr_dev(section0, "class", "m-auto pt-5 relative grow max-w-5xl");
    			add_location(section0, file$3, 23, 2, 652);
    			attr_dev(i0, "class", "fab fa-github");
    			add_location(i0, file$3, 85, 20, 2760);
    			attr_dev(a1, "title", "See my GitHub profile");
    			attr_dev(a1, "aria-label", "See my GitHub profile");
    			attr_dev(a1, "href", "https://github.com/BobShoaun");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "block");
    			add_location(a1, file$3, 80, 4, 2591);
    			attr_dev(i1, "class", "fab fa-linkedin-in");
    			add_location(i1, file$3, 94, 6, 2994);
    			attr_dev(a2, "title", "Connect on LinkedIn");
    			attr_dev(a2, "aria-label", "Connect on LinkedIn");
    			attr_dev(a2, "href", "https://www.linkedin.com/in/ngbobshoaun/");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "block");
    			add_location(a2, file$3, 87, 4, 2803);
    			attr_dev(i2, "class", "far fa-envelope");
    			add_location(i2, file$3, 111, 6, 3415);
    			attr_dev(a3, "title", "Send me an email");
    			attr_dev(a3, "aria-label", "Send me an email");
    			attr_dev(a3, "href", "mailto:ngbobshoaun2000@gmail.com");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "block");
    			add_location(a3, file$3, 104, 4, 3238);
    			attr_dev(div4, "class", "shadow-xl w-4 h-28 bg-gray-700 dark:bg-gray-50");
    			add_location(div4, file$3, 118, 4, 3601);
    			attr_dev(div5, "data-aos", "slide-up");
    			attr_dev(div5, "data-aos-delay", "1500");
    			attr_dev(div5, "data-aos-duration", "700");
    			attr_dev(div5, "class", "hidden text-xl absolute lg:flex flex-col gap-4 items-center w-4 left-14 bottom-0 text-center text-gray-700 dark:text-gray-50");
    			add_location(div5, file$3, 74, 2, 2357);
    			attr_dev(i3, "class", "hover-vertical fas fa-angle-down");
    			add_location(i3, file$3, 130, 4, 4039);
    			attr_dev(button, "title", "Go to about me");
    			attr_dev(button, "aria-label", "Go to about me");
    			attr_dev(button, "data-aos", "fade-down");
    			attr_dev(button, "data-aos-delay", "1500");
    			attr_dev(button, "data-aos-duration", "700");
    			attr_dev(button, "class", "text-xl lg:text-3xl py-5 text-gray-700 dark:text-white absolute w-14 mx-auto text-center bottom-20 right-0 left-0");
    			add_location(button, file$3, 121, 2, 3679);
    			attr_dev(section1, "id", "home");
    			attr_dev(section1, "class", "relative main bg-gray-100 h-screen flex bg-gradient-to-b dark:from-gray-700 dark:to-gray-900");
    			add_location(section1, file$3, 12, 0, 336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div0);
    			append_dev(section1, t0);
    			append_dev(section1, section0);
    			append_dev(section0, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, h1);
    			mount_component(textreveal0, h1, null);
    			append_dev(div3, t2);
    			append_dev(div3, p);
    			mount_component(textreveal1, p, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			mount_component(link, div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, a0);
    			append_dev(a0, t5);
    			append_dev(section1, t6);
    			append_dev(section1, div5);
    			append_dev(div5, a1);
    			append_dev(a1, i0);
    			append_dev(div5, t7);
    			append_dev(div5, a2);
    			append_dev(a2, i1);
    			append_dev(div5, t8);
    			append_dev(div5, a3);
    			append_dev(a3, i2);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(section1, t10);
    			append_dev(section1, button);
    			append_dev(button, i3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const textreveal0_changes = {};
    			if (dirty & /*welcomeMessage*/ 1) textreveal0_changes.text = /*welcomeMessage*/ ctx[0];
    			textreveal0.$set(textreveal0_changes);
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textreveal0.$$.fragment, local);
    			transition_in(textreveal1.$$.fragment, local);
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textreveal0.$$.fragment, local);
    			transition_out(textreveal1.$$.fragment, local);
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_component(textreveal0);
    			destroy_component(textreveal1);
    			destroy_component(link);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let welcomeMessage;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, []);
    	let { theme } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => document.getElementById("about").scrollIntoView();

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(1, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		Link,
    		TextReveal,
    		copyToClipboard,
    		onMount,
    		theme,
    		welcomeMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(1, theme = $$props.theme);
    		if ("welcomeMessage" in $$props) $$invalidate(0, welcomeMessage = $$props.welcomeMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*theme*/ 2) {
    			 $$invalidate(0, welcomeMessage = theme === "dark"
    			? "console.log(\"Hey!👋\")"
    			: "console.log(\"Hi!🙋‍♂️\")");
    		}
    	};

    	return [welcomeMessage, theme, click_handler];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { theme: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*theme*/ ctx[1] === undefined && !("theme" in props)) {
    			console.warn("<Hero> was created without expected prop 'theme'");
    		}
    	}

    	get theme() {
    		throw new Error("<Hero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Hero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SectionNumber.svelte generated by Svelte v3.31.2 */

    const file$4 = "src\\components\\SectionNumber.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let p;
    	let t1;
    	let p_class_value;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*number*/ ctx[2]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t0 = claim_space(div1_nodes);
    			p = claim_element(div1_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t1 = claim_text(p_nodes, /*number*/ ctx[2]);
    			p_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", div0_class_value = `w-4 h-32 mb-2 shadow-xl ${/*shaftClasses*/ ctx[0]}`);
    			add_location(div0, file$4, 13, 2, 370);
    			attr_dev(p, "class", p_class_value = `${/*textClasses*/ ctx[1]} ${/*right*/ ctx[3] ? "right-0" : "left-0"} font-mono font-bold text-3xl absolute`);
    			add_location(p, file$4, 14, 2, 431);
    			attr_dev(div1, "data-aos", "slide-down");
    			attr_dev(div1, "data-aos-offset", "200");
    			attr_dev(div1, "data-aos-delay", "100");
    			attr_dev(div1, "class", div1_class_value = `hidden lg:block absolute top-0 ${/*right*/ ctx[3] ? "right-14" : "left-14"}`);
    			add_location(div1, file$4, 7, 0, 207);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*shaftClasses*/ 1 && div0_class_value !== (div0_class_value = `w-4 h-32 mb-2 shadow-xl ${/*shaftClasses*/ ctx[0]}`)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*number*/ 4) set_data_dev(t1, /*number*/ ctx[2]);

    			if (dirty & /*textClasses, right*/ 10 && p_class_value !== (p_class_value = `${/*textClasses*/ ctx[1]} ${/*right*/ ctx[3] ? "right-0" : "left-0"} font-mono font-bold text-3xl absolute`)) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*right*/ 8 && div1_class_value !== (div1_class_value = `hidden lg:block absolute top-0 ${/*right*/ ctx[3] ? "right-14" : "left-14"}`)) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SectionNumber", slots, []);
    	let { shaftClasses = "bg-gray-700 dark:bg-gray-800" } = $$props;
    	let { textClasses = "text-gray-700 dark:text-gray-800" } = $$props;
    	let { number = "011" } = $$props;
    	let { right = false } = $$props;
    	const writable_props = ["shaftClasses", "textClasses", "number", "right"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionNumber> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("shaftClasses" in $$props) $$invalidate(0, shaftClasses = $$props.shaftClasses);
    		if ("textClasses" in $$props) $$invalidate(1, textClasses = $$props.textClasses);
    		if ("number" in $$props) $$invalidate(2, number = $$props.number);
    		if ("right" in $$props) $$invalidate(3, right = $$props.right);
    	};

    	$$self.$capture_state = () => ({ shaftClasses, textClasses, number, right });

    	$$self.$inject_state = $$props => {
    		if ("shaftClasses" in $$props) $$invalidate(0, shaftClasses = $$props.shaftClasses);
    		if ("textClasses" in $$props) $$invalidate(1, textClasses = $$props.textClasses);
    		if ("number" in $$props) $$invalidate(2, number = $$props.number);
    		if ("right" in $$props) $$invalidate(3, right = $$props.right);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [shaftClasses, textClasses, number, right];
    }

    class SectionNumber extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			shaftClasses: 0,
    			textClasses: 1,
    			number: 2,
    			right: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionNumber",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get shaftClasses() {
    		throw new Error("<SectionNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shaftClasses(value) {
    		throw new Error("<SectionNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClasses() {
    		throw new Error("<SectionNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClasses(value) {
    		throw new Error("<SectionNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get number() {
    		throw new Error("<SectionNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<SectionNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<SectionNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<SectionNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\About.svelte generated by Svelte v3.31.2 */
    const file$5 = "src\\pages\\About.svelte";

    function create_fragment$7(ctx) {
    	let section1;
    	let div0;
    	let t0;
    	let sectionnumber;
    	let t1;
    	let section0;
    	let div6;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div5;
    	let div3;
    	let textreveal;
    	let t3;
    	let div4;
    	let p0;
    	let t4;
    	let t5;
    	let p1;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9;
    	let div7;
    	let current;

    	sectionnumber = new SectionNumber({
    			props: {
    				number: "001",
    				shaftClasses: "bg-gray-100 dark:bg-gray-800",
    				textClasses: "text-gray-100 dark:text-gray-800"
    			},
    			$$inline: true
    		});

    	textreveal = new TextReveal({
    			props: { text: "ABOUT ME" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			div0 = element("div");
    			t0 = space();
    			create_component(sectionnumber.$$.fragment);
    			t1 = space();
    			section0 = element("section");
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(textreveal.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			p0 = element("p");
    			t4 = text("Hey, What's up? I’m Chaitanya, a student specializing in \r\n\t    Software Engineering and Data Science at\r\n            North Carolina State University.");
    			t5 = space();
    			p1 = element("p");
    			t6 = text("   The passion to create and Analyze has always been in\r\n            me. I strive to build quality, intuitive, and robust software with\r\n            the goal of learning and improving my skills.");
    			t7 = space();
    			p2 = element("p");
    			t8 = text("   My expertise includes Python, Java, and Machine Learning. \r\n            Recently I have been intrigued with Data Engineering and Cloud Engineering.\r\n            Aside from coding, I enjoy catching up with my favorite series, and playing video games.");
    			t9 = space();
    			div7 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			section1 = claim_element(nodes, "SECTION", { id: true, class: true });
    			var section1_nodes = children(section1);

    			div0 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			children(div0).forEach(detach_dev);
    			t0 = claim_space(section1_nodes);
    			claim_component(sectionnumber.$$.fragment, section1_nodes);
    			t1 = claim_space(section1_nodes);
    			section0 = claim_element(section1_nodes, "SECTION", { class: true });
    			var section0_nodes = children(section0);
    			div6 = claim_element(section0_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			div2 = claim_element(div6_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			img = claim_element(div1_nodes, "IMG", {
    				loading: true,
    				"data-aos": true,
    				"data-aos-duration": true,
    				"data-aos-delay": true,
    				src: true,
    				alt: true
    			});

    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t2 = claim_space(div6_nodes);
    			div5 = claim_element(div6_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			div3 = claim_element(div5_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			claim_component(textreveal.$$.fragment, div3_nodes);
    			div3_nodes.forEach(detach_dev);
    			t3 = claim_space(div5_nodes);

    			div4 = claim_element(div5_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var div4_nodes = children(div4);
    			p0 = claim_element(div4_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t4 = claim_text(p0_nodes, "Hey, What's up? I’m Chaitanya, a student specializing in \r\n\t    Software Engineering and Data Science at\r\n            North Carolina State University.");
    			p0_nodes.forEach(detach_dev);
    			t5 = claim_space(div4_nodes);
    			p1 = claim_element(div4_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t6 = claim_text(p1_nodes, "   The passion to create and Analyze has always been in\r\n            me. I strive to build quality, intuitive, and robust software with\r\n            the goal of learning and improving my skills.");
    			p1_nodes.forEach(detach_dev);
    			t7 = claim_space(div4_nodes);
    			p2 = claim_element(div4_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t8 = claim_text(p2_nodes, "   My expertise includes Python, Java, and Machine Learning. \r\n            Recently I have been intrigued with Data Engineering and Cloud Engineering.\r\n            Aside from coding, I enjoy catching up with my favorite series, and playing video games.");
    			p2_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			section0_nodes.forEach(detach_dev);
    			t9 = claim_space(section1_nodes);

    			div7 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				class: true
    			});

    			children(div7).forEach(detach_dev);
    			section1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "data-aos", "slide-right");
    			attr_dev(div0, "data-aos-offset", "100");
    			attr_dev(div0, "data-aos-duration", "700");
    			attr_dev(div0, "class", "absolute background left-0 w-1/3 lg:w-1/4 h-full moving-gradient-2");
    			add_location(div0, file$5, 9, 2, 292);
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "data-aos", "slide-right");
    			attr_dev(img, "data-aos-duration", "500");
    			attr_dev(img, "data-aos-delay", "200");
    			if (img.src !== (img_src_value = "/images/me.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "A guy (me) posing before going to a wedding.");
    			add_location(img, file$5, 30, 10, 931);
    			attr_dev(div1, "class", "bg-gray-50 dark:bg-gray-300 shadow-2xl overflow-hidden p-3 rounded-sm");
    			add_location(div1, file$5, 27, 8, 815);
    			attr_dev(div2, "class", "max-w-xs z-10 flex-1");
    			add_location(div2, file$5, 26, 6, 771);
    			attr_dev(div3, "class", "absolute right-0 -top-20 lg:-top-32 lg:text-right tracking-wide text-5xl md:text-6xl lg:text-7xl font-black text-gray-700 dark:text-gray-200");
    			add_location(div3, file$5, 44, 8, 1356);
    			attr_dev(p0, "class", "first-letter:text-4xl first-letter:font-bold");
    			add_location(p0, file$5, 55, 10, 1768);
    			add_location(p1, file$5, 60, 10, 2016);
    			add_location(p2, file$5, 65, 10, 2265);
    			attr_dev(div4, "data-aos", "zoom-in-left");
    			attr_dev(div4, "data-aos-delay", "100");
    			attr_dev(div4, "class", "text-gray-600 dark:text-gray-300 lg:text-lg space-y-5");
    			add_location(div4, file$5, 50, 8, 1601);
    			attr_dev(div5, "class", "flex-1 max-w-prose relative bg-white dark:bg-gray-900 px-6 py-6 lg:py-10 lg:px-10 shadow-2xl");
    			add_location(div5, file$5, 41, 6, 1223);
    			attr_dev(div6, "class", "flex flex-col items-center gap-32 lg:gap-20 lg:flex-row justify-center");
    			add_location(div6, file$5, 23, 4, 666);
    			attr_dev(section0, "class", "main mb-40 mt-40 lg:mt-64");
    			add_location(section0, file$5, 22, 2, 617);
    			attr_dev(div7, "data-aos", "slide-up");
    			attr_dev(div7, "data-aos-offset", "200");
    			attr_dev(div7, "class", "shadow-xl hidden lg:block absolute right-14 bottom-0 w-4 h-28 bg-gray-300 dark:bg-gray-300");
    			add_location(div7, file$5, 85, 2, 2991);
    			attr_dev(section1, "id", "about");
    			attr_dev(section1, "class", "overflow-hidden snap-center relative bg-gray-50 bg-gradient-to-b dark:from-gray-800 dark:to-gray-700");
    			add_location(section1, file$5, 5, 0, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div0);
    			append_dev(section1, t0);
    			mount_component(sectionnumber, section1, null);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			mount_component(textreveal, div3, null);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, p0);
    			append_dev(p0, t4);
    			append_dev(div4, t5);
    			append_dev(div4, p1);
    			append_dev(p1, t6);
    			append_dev(div4, t7);
    			append_dev(div4, p2);
    			append_dev(p2, t8);
    			append_dev(section1, t9);
    			append_dev(section1, div7);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionnumber.$$.fragment, local);
    			transition_in(textreveal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionnumber.$$.fragment, local);
    			transition_out(textreveal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_component(sectionnumber);
    			destroy_component(textreveal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SectionNumber, TextReveal });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\pages\Experience.svelte generated by Svelte v3.31.2 */
    const file$6 = "src\\pages\\Experience.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (82:14) {#each experience.points as point}
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*point*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			t = claim_text(li_nodes, t_value);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(li, "class", "mt-1");
    			add_location(li, file$6, 82, 16, 2966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 1 && t_value !== (t_value = /*point*/ ctx[5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(82:14) {#each experience.points as point}",
    		ctx
    	});

    	return block;
    }

    // (52:6) {#each experiences as experience}
    function create_each_block(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div;
    	let h10;
    	let t1_value = /*experience*/ ctx[2].position + "";
    	let t1;
    	let t2;
    	let h11;
    	let t3;
    	let t4_value = /*experience*/ ctx[2].name + "";
    	let t4;
    	let h11_class_value;
    	let t5;
    	let p;
    	let time0;
    	let t6_value = /*experience*/ ctx[2].start + "";
    	let t6;
    	let t7;
    	let time1;
    	let t8_value = /*experience*/ ctx[2].end + "";
    	let t8;
    	let t9;
    	let ul;
    	let t10;
    	let button_class_value;
    	let each_value_1 = /*experience*/ ctx[2].points;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			h10 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			h11 = element("h1");
    			t3 = text("@");
    			t4 = text(t4_value);
    			t5 = space();
    			p = element("p");
    			time0 = element("time");
    			t6 = text(t6_value);
    			t7 = text(" - ");
    			time1 = element("time");
    			t8 = text(t8_value);
    			t9 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);

    			img = claim_element(button_nodes, "IMG", {
    				loading: true,
    				class: true,
    				src: true,
    				alt: true,
    				style: true
    			});

    			t0 = claim_space(button_nodes);
    			div = claim_element(button_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			h10 = claim_element(div_nodes, "H1", { class: true });
    			var h10_nodes = children(h10);
    			t1 = claim_text(h10_nodes, t1_value);
    			h10_nodes.forEach(detach_dev);
    			t2 = claim_space(div_nodes);
    			h11 = claim_element(div_nodes, "H1", { class: true });
    			var h11_nodes = children(h11);
    			t3 = claim_text(h11_nodes, "@");
    			t4 = claim_text(h11_nodes, t4_value);
    			h11_nodes.forEach(detach_dev);
    			t5 = claim_space(div_nodes);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			time0 = claim_element(p_nodes, "TIME", {});
    			var time0_nodes = children(time0);
    			t6 = claim_text(time0_nodes, t6_value);
    			time0_nodes.forEach(detach_dev);
    			t7 = claim_text(p_nodes, " - ");
    			time1 = claim_element(p_nodes, "TIME", {});
    			var time1_nodes = children(time1);
    			t8 = claim_text(time1_nodes, t8_value);
    			time1_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			t9 = claim_space(div_nodes);
    			ul = claim_element(div_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			t10 = claim_space(button_nodes);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "class", "m-auto h-40 sm:h-52 md:h-48 lg:h-40 aspect-square object-scale-down svelte-bqf100");
    			if (img.src !== (img_src_value = /*experience*/ ctx[2].logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `logo for ${/*experience*/ ctx[2].name}`);
    			set_style(img, "mix-blend-mode", /*experience*/ ctx[2].blend);
    			add_location(img, file$6, 55, 10, 1850);
    			attr_dev(h10, "class", "font-bold text-gray-700 dark:text-white text-xl lg:text-2xl");
    			add_location(h10, file$6, 65, 12, 2269);
    			attr_dev(h11, "class", h11_class_value = "font-bold " + /*experience*/ ctx[2].highlight + " text-lg lg:text-lg mb-1" + " svelte-bqf100");
    			add_location(h11, file$6, 70, 12, 2440);
    			add_location(time0, file$6, 76, 14, 2688);
    			add_location(time1, file$6, 76, 48, 2722);
    			attr_dev(p, "class", "text-gray-500 dark:text-gray-400 mb-5 font-mono text-sm");
    			add_location(p, file$6, 75, 12, 2605);
    			attr_dev(ul, "class", "text-base font-semibold text-gray-700 dark:text-gray-200 list-square ml-4");
    			add_location(ul, file$6, 78, 12, 2783);
    			attr_dev(div, "class", "exp-desc bg-gray-100/80 dark:bg-gray-800/80 p-5 sm:p-10 md:p-5 backdrop-blur-md svelte-bqf100");
    			add_location(div, file$6, 62, 10, 2137);
    			attr_dev(button, "class", button_class_value = "exp text-left aspect-square flex " + /*experience*/ ctx[2].background + " svelte-bqf100");
    			add_location(button, file$6, 52, 8, 1744);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			append_dev(button, t0);
    			append_dev(button, div);
    			append_dev(div, h10);
    			append_dev(h10, t1);
    			append_dev(div, t2);
    			append_dev(div, h11);
    			append_dev(h11, t3);
    			append_dev(h11, t4);
    			append_dev(div, t5);
    			append_dev(div, p);
    			append_dev(p, time0);
    			append_dev(time0, t6);
    			append_dev(p, t7);
    			append_dev(p, time1);
    			append_dev(time1, t8);
    			append_dev(div, t9);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(button, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 1 && img.src !== (img_src_value = /*experience*/ ctx[2].logo)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*experiences*/ 1 && img_alt_value !== (img_alt_value = `logo for ${/*experience*/ ctx[2].name}`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*experiences*/ 1) {
    				set_style(img, "mix-blend-mode", /*experience*/ ctx[2].blend);
    			}

    			if (dirty & /*experiences*/ 1 && t1_value !== (t1_value = /*experience*/ ctx[2].position + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*experiences*/ 1 && t4_value !== (t4_value = /*experience*/ ctx[2].name + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*experiences*/ 1 && h11_class_value !== (h11_class_value = "font-bold " + /*experience*/ ctx[2].highlight + " text-lg lg:text-lg mb-1" + " svelte-bqf100")) {
    				attr_dev(h11, "class", h11_class_value);
    			}

    			if (dirty & /*experiences*/ 1 && t6_value !== (t6_value = /*experience*/ ctx[2].start + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*experiences*/ 1 && t8_value !== (t8_value = /*experience*/ ctx[2].end + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*experiences*/ 1) {
    				each_value_1 = /*experience*/ ctx[2].points;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*experiences*/ 1 && button_class_value !== (button_class_value = "exp text-left aspect-square flex " + /*experience*/ ctx[2].background + " svelte-bqf100")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(52:6) {#each experiences as experience}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section1;
    	let div0;
    	let t0;
    	let sectionnumber;
    	let t1;
    	let header;
    	let h2;
    	let textreveal;
    	let t2;
    	let div1;
    	let p;
    	let t3;
    	let t4;
    	let section0;
    	let div2;
    	let t5;
    	let div3;
    	let current;

    	sectionnumber = new SectionNumber({
    			props: {
    				right: true,
    				number: "010",
    				shaftClasses: "bg-gray-600 dark:bg-gray-50",
    				textClasses: "text-gray-600 dark:text-gray-50"
    			},
    			$$inline: true
    		});

    	textreveal = new TextReveal({
    			props: { text: "EXPERIENCE" },
    			$$inline: true
    		});

    	let each_value = /*experiences*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			div0 = element("div");
    			t0 = space();
    			create_component(sectionnumber.$$.fragment);
    			t1 = space();
    			header = element("header");
    			h2 = element("h2");
    			create_component(textreveal.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			t3 = text("I have more than 2 years of work experience and counting. Here are some\r\n        companies I have worked at before.");
    			t4 = space();
    			section0 = element("section");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div3 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			section1 = claim_element(nodes, "SECTION", { id: true, class: true });
    			var section1_nodes = children(section1);

    			div0 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			children(div0).forEach(detach_dev);
    			t0 = claim_space(section1_nodes);
    			claim_component(sectionnumber.$$.fragment, section1_nodes);
    			t1 = claim_space(section1_nodes);
    			header = claim_element(section1_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			h2 = claim_element(header_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			claim_component(textreveal.$$.fragment, h2_nodes);
    			h2_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);

    			div1 = claim_element(header_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var div1_nodes = children(div1);
    			p = claim_element(div1_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t3 = claim_text(p_nodes, "I have more than 2 years of work experience and counting. Here are some\r\n        companies I have worked at before.");
    			p_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			t4 = claim_space(section1_nodes);
    			section0 = claim_element(section1_nodes, "SECTION", { class: true });
    			var section0_nodes = children(section0);
    			div2 = claim_element(section0_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div2_nodes);
    			}

    			div2_nodes.forEach(detach_dev);
    			section0_nodes.forEach(detach_dev);
    			t5 = claim_space(section1_nodes);

    			div3 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				class: true
    			});

    			children(div3).forEach(detach_dev);
    			section1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "data-aos", "slide-down");
    			attr_dev(div0, "data-aos-delay", "900");
    			attr_dev(div0, "class", "bg-gray-200 z-0 bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 absolute right-0 w-1/2 h-full");
    			add_location(div0, file$6, 18, 2, 503);
    			attr_dev(h2, "class", "basis-1/2 inline-block lg:text-right tracking-wide text-4xl md:text-5xl lg:text-7xl font-black text-gray-700 dark:text-gray-200 mb-4");
    			add_location(h2, file$6, 32, 4, 913);
    			attr_dev(p, "class", "text-base lg:text-lg text-gray-600 dark:text-gray-300 lg:text-left lg:max-w-sm mx-auto max-w-prose lg:mx-0 font-semibold");
    			add_location(p, file$6, 38, 6, 1201);
    			attr_dev(div1, "data-aos", "fade-left");
    			attr_dev(div1, "data-aos-delay", "200");
    			attr_dev(div1, "class", "basis-1/2");
    			add_location(div1, file$6, 37, 4, 1128);
    			attr_dev(header, "class", "px-5 relative lg:flex pt-40 pb-24 gap-10 text-center");
    			add_location(header, file$6, 31, 2, 838);
    			attr_dev(div2, "class", "grid grid-cols-1 md:grid-cols-2 mx-6 sm:mx-28 md:mx-0 lg:mx-20 xl:mx-28 shadow-2xl");
    			add_location(div2, file$6, 48, 4, 1584);
    			attr_dev(section0, "class", "main max-w-6xl mx-auto mb-40 relative z-10");
    			add_location(section0, file$6, 47, 2, 1518);
    			attr_dev(div3, "data-aos", "slide-up");
    			attr_dev(div3, "data-aos-offset", "200");
    			attr_dev(div3, "class", "hidden lg:block shadow-xl absolute left-14 bottom-0 w-4 h-28 bg-gray-400 dark:bg-gray-300");
    			add_location(div3, file$6, 91, 2, 3121);
    			attr_dev(section1, "id", "experience");
    			attr_dev(section1, "class", "overflow-hidden bg-gray-100 relative bg-gradient-to-b dark:from-gray-900 dark:to-gray-800");
    			add_location(section1, file$6, 14, 0, 368);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div0);
    			append_dev(section1, t0);
    			mount_component(sectionnumber, section1, null);
    			append_dev(section1, t1);
    			append_dev(section1, header);
    			append_dev(header, h2);
    			mount_component(textreveal, h2, null);
    			append_dev(header, t2);
    			append_dev(header, div1);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(section1, t4);
    			append_dev(section1, section0);
    			append_dev(section0, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(section1, t5);
    			append_dev(section1, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*experiences*/ 1) {
    				each_value = /*experiences*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionnumber.$$.fragment, local);
    			transition_in(textreveal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionnumber.$$.fragment, local);
    			transition_out(textreveal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_component(sectionnumber);
    			destroy_component(textreveal);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Experience", slots, []);
    	onMount(mounted);
    	let experiences = [];

    	async function mounted() {
    		let response = await fetch("/experience.json");
    		$$invalidate(0, experiences = await response.json());
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Experience> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		SectionNumber,
    		TextReveal,
    		experiences,
    		mounted
    	});

    	$$self.$inject_state = $$props => {
    		if ("experiences" in $$props) $$invalidate(0, experiences = $$props.experiences);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [experiences];
    }

    class Experience extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experience",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var technologies = [
      {
        tech: "Pytorch",
        link: "https://pytorch.org/docs/stable/index.html",
      },
      {
        tech: "SKlearn",
        link: "https://scikit-learn.org/stable/",
      },
      {
        tech: "Numpy",
        link: "https://numpy.org/doc/stable/",
      },
      {
        tech: "Pandas",
        link: "https://pandas.pydata.org/docs/",
      },
      {
        tech: "NetworkX",
        link: "https://networkx.org/",
      },
      {
        tech: "Apache Spark",
        link: "https://spark.apache.org/docs/latest/",
      },
      {
        tech: "Svelte",
        link: "https://svelte.dev/",
      },
      {
        tech: "Unity Engine",
        link: "https://unity.com/",
      },
      {
        tech: "Git",
        link: "https://git-scm.com/doc",
      },
      {
        tech: "MongoDB",
        link: "https://www.mongodb.com/docs/",
      },
      {
        tech: "AWS",
        link: "https://docs.aws.amazon.com/",
      },
      {
        tech: "Postgres",
        link: "https://www.postgresql.org/docs/",
      },
      {
        tech: "docker",
        link: "https://docs.docker.com/reference/",
      },
      {
        tech: "Django",
        link: "https://docs.djangoproject.com/en/4.2/",
      },
      {
        tech: "Github Actions",
        link: "https://docs.github.com/en/actions",
      },
      {
        tech: "Apache Kafka",
        link: "https://kafka.apache.org/quickstart",
      },
      {
        tech: "Python",
        link: "https://www.python.org/",
      },
      {
        tech: "Java",
        link: "https://docs.oracle.com/en/java/",
      },
      {
        tech: "C(++)",
        link: "https://learn.microsoft.com/en-us/cpp/?view=msvc-170",
      },
      {
        tech: "JavaScript",
        link: "https://www.javascript.com/",
      },
      {
        tech: "C#",
        link: "https://learn.microsoft.com/en-us/dotnet/csharp/",
      },
      {
        tech: "SQL",
        link: "https://dev.mysql.com/doc/",
      },
      {
        tech: "Ruby",
        link: "https://www.ruby-lang.org/en/documentation/",
      },
    ];

    /* src\components\WebDevProject.svelte generated by Svelte v3.31.2 */
    const file$7 = "src\\components\\WebDevProject.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (44:8) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let p;
    	let t0;
    	let t1;
    	let i;

    	const block = {
    		c: function create() {
    			button = element("button");
    			p = element("p");
    			t0 = text("Private");
    			t1 = space();
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true, disabled: true });
    			var button_nodes = children(button);
    			p = claim_element(button_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, "Private");
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(button_nodes);
    			i = claim_element(button_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "");
    			add_location(p, file$7, 48, 12, 1763);
    			attr_dev(i, "class", "fas fa-code ml-3 text-lg");
    			add_location(i, file$7, 49, 12, 1800);
    			attr_dev(button, "class", "rounded-md px-3 py-1.5 dark:bg-gray-700 bg-gray-200 flex items-center text-gray-500 dark:text-gray-400 cursor-not-allowed");
    			button.disabled = true;
    			add_location(button, file$7, 44, 10, 1564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, p);
    			append_dev(p, t0);
    			append_dev(button, t1);
    			append_dev(button, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(44:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#if project.github}
    function create_if_block_2(ctx) {
    	let a;
    	let p;
    	let t0;
    	let t1;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			p = element("p");
    			t0 = text("Github");
    			t1 = space();
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", {
    				href: true,
    				"aria-label": true,
    				target: true,
    				class: true
    			});

    			var a_nodes = children(a);
    			p = claim_element(a_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, "Github");
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(a_nodes);
    			i = claim_element(a_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "");
    			add_location(p, file$7, 40, 12, 1443);
    			attr_dev(i, "class", "fab fa-github ml-3 text-lg");
    			add_location(i, file$7, 41, 12, 1479);
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[0].github);
    			attr_dev(a, "aria-label", "Look at GitHub repo");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "shadow-md rounded-md px-3 py-1.5 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center text-gray-50");
    			add_location(a, file$7, 34, 10, 1171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, p);
    			append_dev(p, t0);
    			append_dev(a, t1);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = /*project*/ ctx[0].github)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:8) {#if project.github}",
    		ctx
    	});

    	return block;
    }

    // (53:8) {#if project.website}
    function create_if_block_1$1(ctx) {
    	let a;
    	let p;
    	let t0;
    	let t1;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			p = element("p");
    			t0 = text("Link");
    			t1 = space();
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", {
    				href: true,
    				"aria-label": true,
    				target: true,
    				class: true
    			});

    			var a_nodes = children(a);
    			p = claim_element(a_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, "Link");
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(a_nodes);
    			i = claim_element(a_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "group-hover:underline");
    			add_location(p, file$7, 59, 12, 2143);
    			attr_dev(i, "class", "fas fa-external-link-alt ml-3");
    			add_location(i, file$7, 60, 12, 2198);
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[0].website);
    			attr_dev(a, "aria-label", "Go to live website");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "flex px-2 py-2 items-center group text-gray-800 dark:text-gray-50");
    			add_location(a, file$7, 53, 10, 1917);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, p);
    			append_dev(p, t0);
    			append_dev(a, t1);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = /*project*/ ctx[0].website)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(53:8) {#if project.website}",
    		ctx
    	});

    	return block;
    }

    // (104:8) {#each project.technologies as tech}
    function create_each_block$1(ctx) {
    	let a;
    	let t_value = /*tech*/ ctx[4] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, target: true, class: true });
    			var a_nodes = children(a);
    			t = claim_text(a_nodes, t_value);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", a_href_value = /*techLinks*/ ctx[2].get(/*tech*/ ctx[4]));
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "bg-red-200 text-red-900 px-2");
    			add_location(a, file$7, 104, 10, 3607);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && t_value !== (t_value = /*tech*/ ctx[4] + "")) set_data_dev(t, t_value);

    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = /*techLinks*/ ctx[2].get(/*tech*/ ctx[4]))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(104:8) {#each project.technologies as tech}",
    		ctx
    	});

    	return block;
    }

    // (114:2) {#if project.more}
    function create_if_block$2(ctx) {
    	let article;
    	let a;
    	let em;
    	let i;
    	let t0;
    	let t1;
    	let hr;
    	let t2;
    	let h1;
    	let t3;
    	let t4;
    	let p;
    	let t5;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			a = element("a");
    			em = element("em");
    			i = element("i");
    			t0 = text("Featured Article");
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			h1 = element("h1");
    			t3 = text("How I Made My Own Cryptocurrency");
    			t4 = space();
    			p = element("p");
    			t5 = text("by Ng Bob Shoaun  ∙  2 August 2021  ∙  8 minute\r\n          read");
    			this.h();
    		},
    		l: function claim(nodes) {
    			article = claim_element(nodes, "ARTICLE", { "data-aos": true, class: true });
    			var article_nodes = children(article);
    			a = claim_element(article_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			em = claim_element(a_nodes, "EM", { class: true });
    			var em_nodes = children(em);
    			i = claim_element(em_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			t0 = claim_text(em_nodes, "Featured Article");
    			em_nodes.forEach(detach_dev);
    			t1 = claim_space(a_nodes);
    			hr = claim_element(a_nodes, "HR", { class: true });
    			t2 = claim_space(a_nodes);
    			h1 = claim_element(a_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t3 = claim_text(h1_nodes, "How I Made My Own Cryptocurrency");
    			h1_nodes.forEach(detach_dev);
    			t4 = claim_space(a_nodes);
    			p = claim_element(a_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "by Ng Bob Shoaun  ∙  2 August 2021  ∙  8 minute\r\n          read");
    			p_nodes.forEach(detach_dev);
    			a_nodes.forEach(detach_dev);
    			article_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", "fas fa-newspaper mr-2 text-lg");
    			add_location(i, file$7, 120, 11, 4066);
    			attr_dev(em, "class", "block mb-2");
    			add_location(em, file$7, 119, 8, 4031);
    			attr_dev(hr, "class", "mb-4 border-gray-400");
    			add_location(hr, file$7, 122, 8, 4150);
    			attr_dev(h1, "class", "text-2xl lg:text-3xl font-bold mb-3");
    			add_location(h1, file$7, 123, 8, 4195);
    			attr_dev(p, "class", "text-gray-500 dark:text-gray-300");
    			add_location(p, file$7, 126, 8, 4312);
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[0].more);
    			attr_dev(a, "class", "block relative text-gray-700 dark:text-white cursor-pointer featured-article  svelte-auqgz8");
    			add_location(a, file$7, 115, 6, 3886);
    			attr_dev(article, "data-aos", "fade-up");
    			attr_dev(article, "class", "mt-14");
    			add_location(article, file$7, 114, 4, 3836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, a);
    			append_dev(a, em);
    			append_dev(em, i);
    			append_dev(em, t0);
    			append_dev(a, t1);
    			append_dev(a, hr);
    			append_dev(a, t2);
    			append_dev(a, h1);
    			append_dev(h1, t3);
    			append_dev(a, t4);
    			append_dev(a, p);
    			append_dev(p, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = /*project*/ ctx[0].more)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(114:2) {#if project.more}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let article;
    	let div3;
    	let aside;
    	let div0;
    	let img;
    	let img_data_aos_value;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div1;
    	let t1;
    	let div1_data_aos_value;
    	let t2;
    	let section;
    	let h1;
    	let html_tag;
    	let raw0_value = /*project*/ ctx[0].name + "";
    	let t3;
    	let time;
    	let t4_value = /*project*/ ctx[0].year + "";
    	let t4;
    	let h1_data_aos_value;
    	let t5;
    	let p0;
    	let t6_value = /*project*/ ctx[0].collaborators + "";
    	let t6;
    	let p0_data_aos_value;
    	let t7;
    	let hr;
    	let hr_data_aos_value;
    	let t8;
    	let p1;
    	let raw1_value = /*project*/ ctx[0].description + "";
    	let p1_data_aos_value;
    	let t9;
    	let div2;
    	let div2_data_aos_value;
    	let section_class_value;
    	let t10;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*project*/ ctx[0].github) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*project*/ ctx[0].website && create_if_block_1$1(ctx);
    	let each_value = /*project*/ ctx[0].technologies;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block2 = /*project*/ ctx[0].more && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			div3 = element("div");
    			aside = element("aside");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			section = element("section");
    			h1 = element("h1");
    			t3 = space();
    			time = element("time");
    			t4 = text(t4_value);
    			t5 = space();
    			p0 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			hr = element("hr");
    			t8 = space();
    			p1 = element("p");
    			t9 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			if (if_block2) if_block2.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			article = claim_element(nodes, "ARTICLE", { class: true });
    			var article_nodes = children(article);
    			div3 = claim_element(article_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			aside = claim_element(div3_nodes, "ASIDE", { class: true });
    			var aside_nodes = children(aside);
    			div0 = claim_element(aside_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			img = claim_element(div0_nodes, "IMG", {
    				"data-aos": true,
    				"data-aos-duration": true,
    				"data-aos-delay": true,
    				class: true,
    				src: true,
    				alt: true,
    				loading: true
    			});

    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(aside_nodes);

    			div1 = claim_element(aside_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var div1_nodes = children(div1);
    			if_block0.l(div1_nodes);
    			t1 = claim_space(div1_nodes);
    			if (if_block1) if_block1.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			aside_nodes.forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			section = claim_element(div3_nodes, "SECTION", { class: true });
    			var section_nodes = children(section);
    			h1 = claim_element(section_nodes, "H1", { "data-aos": true, class: true });
    			var h1_nodes = children(h1);
    			t3 = claim_space(h1_nodes);
    			time = claim_element(h1_nodes, "TIME", { class: true });
    			var time_nodes = children(time);
    			t4 = claim_text(time_nodes, t4_value);
    			time_nodes.forEach(detach_dev);
    			h1_nodes.forEach(detach_dev);
    			t5 = claim_space(section_nodes);

    			p0 = claim_element(section_nodes, "P", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var p0_nodes = children(p0);
    			t6 = claim_text(p0_nodes, t6_value);
    			p0_nodes.forEach(detach_dev);
    			t7 = claim_space(section_nodes);

    			hr = claim_element(section_nodes, "HR", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			t8 = claim_space(section_nodes);

    			p1 = claim_element(section_nodes, "P", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var p1_nodes = children(p1);
    			p1_nodes.forEach(detach_dev);
    			t9 = claim_space(section_nodes);

    			div2 = claim_element(section_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var div2_nodes = children(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div2_nodes);
    			}

    			div2_nodes.forEach(detach_dev);
    			section_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t10 = claim_space(article_nodes);
    			if (if_block2) if_block2.l(article_nodes);
    			article_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "data-aos", img_data_aos_value = /*right*/ ctx[1] ? "slide-right" : "slide-left");
    			attr_dev(img, "data-aos-duration", "200");
    			attr_dev(img, "data-aos-delay", "100");
    			attr_dev(img, "class", "max-h-[inherit] w-auto object-scale-down p-2 sm:p-3 cursor-pointer img-container svelte-auqgz8");
    			if (img.src !== (img_src_value = /*project*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Screenshot of ${/*project*/ ctx[0].name}`);
    			attr_dev(img, "loading", "lazy");
    			add_location(img, file$7, 17, 8, 553);
    			attr_dev(div0, "class", "mx-0 mb-4 max-h-80 w-fit bg-gradient-to-br from-green-300 to-blue-300 shadow-xl overflow-hidden rounded-sm");
    			add_location(div0, file$7, 14, 6, 406);
    			attr_dev(div1, "data-aos", div1_data_aos_value = /*right*/ ctx[1] ? "flip-up" : "flip-up");
    			attr_dev(div1, "data-aos-delay", "100");
    			attr_dev(div1, "class", "flex items-center justify-center gap-3");
    			add_location(div1, file$7, 28, 6, 980);
    			attr_dev(aside, "class", "lg:max-w-1/2 w-fit shrink");
    			add_location(aside, file$7, 13, 4, 357);
    			html_tag = new HtmlTag(t3);
    			attr_dev(time, "class", "ml-0.5 font-light text-right text-xl lg:text-2xl dark:text-gray-300");
    			add_location(time, file$7, 72, 8, 2569);
    			attr_dev(h1, "data-aos", h1_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left");
    			attr_dev(h1, "class", "text-2xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-50 mb-1");
    			add_location(h1, file$7, 67, 6, 2372);
    			attr_dev(p0, "data-aos", p0_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left");
    			attr_dev(p0, "data-aos-delay", "100");
    			attr_dev(p0, "class", "font-bold font-mono text-sm text-purple-700 dark:text-purple-400 mb-3");
    			add_location(p0, file$7, 77, 6, 2726);
    			attr_dev(hr, "data-aos", hr_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left");
    			attr_dev(hr, "data-aos-delay", "150");
    			attr_dev(hr, "class", "mb-4 border-gray-400 dark:border-gray-500");
    			add_location(hr, file$7, 85, 6, 2964);
    			attr_dev(p1, "data-aos", p1_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left");
    			attr_dev(p1, "data-aos-delay", "200");
    			attr_dev(p1, "class", "mb-4 text-gray-600 font-semibold dark:text-gray-300 leading-relaxed max-w-prose");
    			add_location(p1, file$7, 90, 6, 3129);
    			attr_dev(div2, "data-aos", div2_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left");
    			attr_dev(div2, "data-aos-delay", "300");
    			attr_dev(div2, "class", "text-sm font-mono font-semibold flex flex-wrap gap-2");
    			add_location(div2, file$7, 98, 6, 3381);
    			attr_dev(section, "class", section_class_value = "flex-1 " + (/*right*/ ctx[1] ? "lg:order-first" : ""));
    			add_location(section, file$7, 66, 4, 2308);
    			attr_dev(div3, "class", "flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14");
    			add_location(div3, file$7, 10, 2, 258);
    			attr_dev(article, "class", "sm:mx-14 lg:mx-0");
    			add_location(article, file$7, 9, 0, 220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div3);
    			append_dev(div3, aside);
    			append_dev(aside, div0);
    			append_dev(div0, img);
    			append_dev(aside, t0);
    			append_dev(aside, div1);
    			if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, section);
    			append_dev(section, h1);
    			html_tag.m(raw0_value, h1);
    			append_dev(h1, t3);
    			append_dev(h1, time);
    			append_dev(time, t4);
    			append_dev(section, t5);
    			append_dev(section, p0);
    			append_dev(p0, t6);
    			append_dev(section, t7);
    			append_dev(section, hr);
    			append_dev(section, t8);
    			append_dev(section, p1);
    			p1.innerHTML = raw1_value;
    			append_dev(section, t9);
    			append_dev(section, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(article, t10);
    			if (if_block2) if_block2.m(article, null);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*right*/ 2 && img_data_aos_value !== (img_data_aos_value = /*right*/ ctx[1] ? "slide-right" : "slide-left")) {
    				attr_dev(img, "data-aos", img_data_aos_value);
    			}

    			if (dirty & /*project*/ 1 && img.src !== (img_src_value = /*project*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*project*/ 1 && img_alt_value !== (img_alt_value = `Screenshot of ${/*project*/ ctx[0].name}`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			}

    			if (/*project*/ ctx[0].website) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*right*/ 2 && div1_data_aos_value !== (div1_data_aos_value = /*right*/ ctx[1] ? "flip-up" : "flip-up")) {
    				attr_dev(div1, "data-aos", div1_data_aos_value);
    			}

    			if (dirty & /*project*/ 1 && raw0_value !== (raw0_value = /*project*/ ctx[0].name + "")) html_tag.p(raw0_value);
    			if (dirty & /*project*/ 1 && t4_value !== (t4_value = /*project*/ ctx[0].year + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*right*/ 2 && h1_data_aos_value !== (h1_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left")) {
    				attr_dev(h1, "data-aos", h1_data_aos_value);
    			}

    			if (dirty & /*project*/ 1 && t6_value !== (t6_value = /*project*/ ctx[0].collaborators + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*right*/ 2 && p0_data_aos_value !== (p0_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left")) {
    				attr_dev(p0, "data-aos", p0_data_aos_value);
    			}

    			if (dirty & /*right*/ 2 && hr_data_aos_value !== (hr_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left")) {
    				attr_dev(hr, "data-aos", hr_data_aos_value);
    			}

    			if (dirty & /*project*/ 1 && raw1_value !== (raw1_value = /*project*/ ctx[0].description + "")) p1.innerHTML = raw1_value;
    			if (dirty & /*right*/ 2 && p1_data_aos_value !== (p1_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left")) {
    				attr_dev(p1, "data-aos", p1_data_aos_value);
    			}

    			if (dirty & /*techLinks, project*/ 5) {
    				each_value = /*project*/ ctx[0].technologies;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*right*/ 2 && div2_data_aos_value !== (div2_data_aos_value = /*right*/ ctx[1] ? "fade-right" : "fade-left")) {
    				attr_dev(div2, "data-aos", div2_data_aos_value);
    			}

    			if (dirty & /*right*/ 2 && section_class_value !== (section_class_value = "flex-1 " + (/*right*/ ctx[1] ? "lg:order-first" : ""))) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (/*project*/ ctx[0].more) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(article, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WebDevProject", slots, []);
    	let techLinks = new Map(technologies.map(tech => [tech.tech, tech.link]));
    	let { project = null } = $$props;
    	let { right = false } = $$props;
    	const writable_props = ["project", "right"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WebDevProject> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.open(project.website);

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    		if ("right" in $$props) $$invalidate(1, right = $$props.right);
    	};

    	$$self.$capture_state = () => ({ technologies, techLinks, project, right });

    	$$self.$inject_state = $$props => {
    		if ("techLinks" in $$props) $$invalidate(2, techLinks = $$props.techLinks);
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    		if ("right" in $$props) $$invalidate(1, right = $$props.right);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project, right, techLinks, click_handler];
    }

    class WebDevProject extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { project: 0, right: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WebDevProject",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get project() {
    		throw new Error("<WebDevProject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<WebDevProject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<WebDevProject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<WebDevProject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SectionHeader.svelte generated by Svelte v3.31.2 */
    const file$8 = "src\\components\\SectionHeader.svelte";

    function create_fragment$a(ctx) {
    	let header;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let h2;
    	let textreveal;
    	let t1;
    	let p;
    	let t2;
    	let current;

    	textreveal = new TextReveal({
    			props: { delay: 300, text: /*headingText*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			create_component(textreveal.$$.fragment);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*subtitleText*/ ctx[2]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", { class: true });
    			var header_nodes = children(header);

    			div0 = claim_element(header_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				class: true
    			});

    			children(div0).forEach(detach_dev);
    			t0 = claim_space(header_nodes);

    			div1 = claim_element(header_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				class: true
    			});

    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			claim_component(textreveal.$$.fragment, h2_nodes);
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);

    			p = claim_element(div1_nodes, "P", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				"data-aos-delay": true,
    				class: true
    			});

    			var p_nodes = children(p);
    			t2 = claim_text(p_nodes, /*subtitleText*/ ctx[2]);
    			p_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "data-aos", "slide-down");
    			attr_dev(div0, "data-aos-offset", "200");
    			attr_dev(div0, "class", div0_class_value = "absolute inset-0 -z-0 " + /*wrapperClasses*/ ctx[0]);
    			add_location(div0, file$8, 10, 2, 401);
    			attr_dev(h2, "class", "text-3xl md:text-4xl lg:text-5xl mb-2 font-black text-gray-700 dark:text-gray-200");
    			add_location(h2, file$8, 20, 4, 685);
    			attr_dev(p, "data-aos", "fade");
    			attr_dev(p, "data-aos-offset", "200");
    			attr_dev(p, "data-aos-delay", "300");
    			attr_dev(p, "class", "text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-prose font-semibold");
    			add_location(p, file$8, 25, 4, 862);
    			attr_dev(div1, "data-aos", "fade");
    			attr_dev(div1, "data-aos-offset", "200");
    			attr_dev(div1, "class", "relative bg-gray-50 z-10 dark:bg-gray-900 shadow-xl p-5 lg:p-10 inline-block w-fit mx-5");
    			add_location(div1, file$8, 15, 2, 521);
    			attr_dev(header, "class", `py-24 text-center relative overflow-hidden`);
    			add_location(header, file$8, 9, 0, 336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			append_dev(div1, h2);
    			mount_component(textreveal, h2, null);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(p, t2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*wrapperClasses*/ 1 && div0_class_value !== (div0_class_value = "absolute inset-0 -z-0 " + /*wrapperClasses*/ ctx[0])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			const textreveal_changes = {};
    			if (dirty & /*headingText*/ 2) textreveal_changes.text = /*headingText*/ ctx[1];
    			textreveal.$set(textreveal_changes);
    			if (!current || dirty & /*subtitleText*/ 4) set_data_dev(t2, /*subtitleText*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textreveal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textreveal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(textreveal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SectionHeader", slots, []);
    	let { wrapperClasses = "moving-gradient-1" } = $$props;
    	let { headingText = "Projects" } = $$props;
    	let { subtitleText = "I have experience working as a Software Developer with a concentration in Data Science, here are some featured projects." } = $$props;
    	const writable_props = ["wrapperClasses", "headingText", "subtitleText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("wrapperClasses" in $$props) $$invalidate(0, wrapperClasses = $$props.wrapperClasses);
    		if ("headingText" in $$props) $$invalidate(1, headingText = $$props.headingText);
    		if ("subtitleText" in $$props) $$invalidate(2, subtitleText = $$props.subtitleText);
    	};

    	$$self.$capture_state = () => ({
    		TextReveal,
    		wrapperClasses,
    		headingText,
    		subtitleText
    	});

    	$$self.$inject_state = $$props => {
    		if ("wrapperClasses" in $$props) $$invalidate(0, wrapperClasses = $$props.wrapperClasses);
    		if ("headingText" in $$props) $$invalidate(1, headingText = $$props.headingText);
    		if ("subtitleText" in $$props) $$invalidate(2, subtitleText = $$props.subtitleText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wrapperClasses, headingText, subtitleText];
    }

    class SectionHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			wrapperClasses: 0,
    			headingText: 1,
    			subtitleText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionHeader",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get wrapperClasses() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClasses(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headingText() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headingText(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitleText() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitleText(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional = config.transitional || defaults_1.transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(
            timeoutErrorMessage,
            config,
            transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new Cancel_1('canceled') : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      },

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw enhanceError(e, this, 'E_JSON_PARSE');
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults_1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new Cancel_1('canceled');
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data = {
      "version": "0.24.0"
    };

    var VERSION = data.version;

    var validators = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new TypeError('option ' + opt + ' must be ' + result);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw Error('Unknown option ' + opt);
        }
      }
    }

    var validator = {
      assertOptions: assertOptions,
      validators: validators
    };

    var validators$1 = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators$1.transitional(validators$1.boolean),
          forcedJSONParsing: validators$1.transitional(validators$1.boolean),
          clarifyTimeoutError: validators$1.transitional(validators$1.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$1(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;
    axios.VERSION = data.version;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    /* src\pages\WebDev.svelte generated by Svelte v3.31.2 */
    const file$9 = "src\\pages\\WebDev.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (29:6) {#each visibleProjects as project, index}
    function create_each_block$2(ctx) {
    	let webdevproject;
    	let current;

    	webdevproject = new WebDevProject({
    			props: {
    				project: /*project*/ ctx[5],
    				right: /*index*/ ctx[7] % 2
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(webdevproject.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(webdevproject.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(webdevproject, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const webdevproject_changes = {};
    			if (dirty & /*visibleProjects*/ 2) webdevproject_changes.project = /*project*/ ctx[5];
    			webdevproject.$set(webdevproject_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(webdevproject.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(webdevproject.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(webdevproject, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(29:6) {#each visibleProjects as project, index}",
    		ctx
    	});

    	return block;
    }

    // (42:6) {:else}
    function create_else_block$2(ctx) {
    	let i;
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			t1 = text("More Projects");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			t0 = claim_space(nodes);
    			span = claim_element(nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t1 = claim_text(span_nodes, "More Projects");
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", "fas fa-angle-down");
    			add_location(i, file$9, 42, 8, 1373);
    			attr_dev(span, "class", "group-hover:underline");
    			add_location(span, file$9, 43, 8, 1414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(42:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:6) {#if expanded}
    function create_if_block$3(ctx) {
    	let i;
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			t1 = text("Less Projects");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			t0 = claim_space(nodes);
    			span = claim_element(nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t1 = claim_text(span_nodes, "Less Projects");
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", "fas fa-angle-up");
    			add_location(i, file$9, 39, 8, 1253);
    			attr_dev(span, "class", "group-hover:underline");
    			add_location(span, file$9, 40, 8, 1292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(39:6) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section1;
    	let sectionheader;
    	let t0;
    	let sectionnumber;
    	let t1;
    	let section0;
    	let div0;
    	let t2;
    	let button;
    	let hr0;
    	let t3;
    	let t4;
    	let hr1;
    	let t5;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	sectionheader = new SectionHeader({ $$inline: true });
    	sectionnumber = new SectionNumber({ props: { number: "011" }, $$inline: true });
    	let each_value = /*visibleProjects*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function select_block_type(ctx, dirty) {
    		if (/*expanded*/ ctx[0]) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			create_component(sectionheader.$$.fragment);
    			t0 = space();
    			create_component(sectionnumber.$$.fragment);
    			t1 = space();
    			section0 = element("section");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button = element("button");
    			hr0 = element("hr");
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			hr1 = element("hr");
    			t5 = space();
    			div1 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			section1 = claim_element(nodes, "SECTION", { id: true, class: true });
    			var section1_nodes = children(section1);
    			claim_component(sectionheader.$$.fragment, section1_nodes);
    			t0 = claim_space(section1_nodes);
    			claim_component(sectionnumber.$$.fragment, section1_nodes);
    			t1 = claim_space(section1_nodes);
    			section0 = claim_element(section1_nodes, "SECTION", { class: true });
    			var section0_nodes = children(section0);
    			div0 = claim_element(section0_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(section0_nodes);
    			button = claim_element(section0_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			hr0 = claim_element(button_nodes, "HR", { class: true });
    			t3 = claim_space(button_nodes);
    			if_block.l(button_nodes);
    			t4 = claim_space(button_nodes);
    			hr1 = claim_element(button_nodes, "HR", { class: true });
    			button_nodes.forEach(detach_dev);
    			section0_nodes.forEach(detach_dev);
    			t5 = claim_space(section1_nodes);

    			div1 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-offset": true,
    				class: true
    			});

    			children(div1).forEach(detach_dev);
    			section1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "space-y-40");
    			add_location(div0, file$9, 27, 4, 821);
    			attr_dev(hr0, "class", "flex-1 mr-2 border-gray-400 dark:border-gray-500");
    			add_location(hr0, file$9, 37, 6, 1158);
    			attr_dev(hr1, "class", "flex-1 ml-2 border-gray-400 dark:border-gray-500");
    			add_location(hr1, file$9, 45, 6, 1491);
    			attr_dev(button, "class", "mt-40 w-full flex items-center gap-2 group font-semibold text-gray-700 dark:text-gray-100");
    			add_location(button, file$9, 33, 4, 984);
    			attr_dev(section0, "class", "main max-w-7xl pb-40 pt-32 mx-auto");
    			add_location(section0, file$9, 26, 2, 763);
    			attr_dev(div1, "data-aos", "slide-up");
    			attr_dev(div1, "data-aos-offset", "200");
    			attr_dev(div1, "class", "hidden lg:block absolute shadow-xl right-14 bottom-0 w-4 h-28 bg-gray-400 dark:bg-gray-300");
    			add_location(div1, file$9, 49, 2, 1589);
    			attr_dev(section1, "id", "web-development");
    			attr_dev(section1, "class", "relative overflow-hidden snap-center bg-gray-100 bg-gradient-to-b dark:from-gray-900 dark:to-gray-800");
    			add_location(section1, file$9, 19, 0, 554);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			mount_component(sectionheader, section1, null);
    			append_dev(section1, t0);
    			mount_component(sectionnumber, section1, null);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(section0, t2);
    			append_dev(section0, button);
    			append_dev(button, hr0);
    			append_dev(button, t3);
    			if_block.m(button, null);
    			append_dev(button, t4);
    			append_dev(button, hr1);
    			append_dev(section1, t5);
    			append_dev(section1, div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visibleProjects*/ 2) {
    				each_value = /*visibleProjects*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, t4);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader.$$.fragment, local);
    			transition_in(sectionnumber.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader.$$.fragment, local);
    			transition_out(sectionnumber.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_component(sectionheader);
    			destroy_component(sectionnumber);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let visibleProjects;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WebDev", slots, []);
    	onMount(mounted);
    	let projects = [];
    	let expanded = false;

    	async function mounted() {
    		const { data } = await axios$1("/projects_web.json");
    		$$invalidate(2, projects = data);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WebDev> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, expanded = !expanded);

    	$$self.$capture_state = () => ({
    		WebDevProject,
    		SectionNumber,
    		SectionHeader,
    		onMount,
    		axios: axios$1,
    		projects,
    		expanded,
    		mounted,
    		visibleProjects
    	});

    	$$self.$inject_state = $$props => {
    		if ("projects" in $$props) $$invalidate(2, projects = $$props.projects);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("visibleProjects" in $$props) $$invalidate(1, visibleProjects = $$props.visibleProjects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*projects, expanded*/ 5) {
    			 $$invalidate(1, visibleProjects = projects.slice(0, expanded ? projects.length : 4));
    		}
    	};

    	return [expanded, visibleProjects, projects, click_handler];
    }

    class WebDev extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WebDev",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\pages\Contact.svelte generated by Svelte v3.31.2 */
    const file$a = "src\\pages\\Contact.svelte";

    function create_fragment$c(ctx) {
    	let section1;
    	let div0;
    	let t0;
    	let sectionnumber;
    	let t1;
    	let section0;
    	let div6;
    	let div2;
    	let div1;
    	let t2;
    	let div5;
    	let div3;
    	let h2;
    	let textreveal;
    	let t3;
    	let h5;
    	let t4;
    	let button0;
    	let t5;
    	let t6;
    	let form;
    	let input0;
    	let t7;
    	let label;
    	let t8;
    	let input1;
    	let t9;
    	let div4;
    	let input2;
    	let t10;
    	let input3;
    	let t11;
    	let textarea;
    	let t12;
    	let button1;
    	let i0;
    	let t13;
    	let p;
    	let t14;
    	let t15;
    	let button2;
    	let i1;
    	let current;
    	let mounted;
    	let dispose;

    	sectionnumber = new SectionNumber({
    			props: {
    				right: true,
    				number: "110",
    				shaftClasses: "bg-gray-700 dark:bg-gray-50",
    				textClasses: "text-gray-700 dark:text-gray-50"
    			},
    			$$inline: true
    		});

    	textreveal = new TextReveal({
    			props: { text: "CONTACT ME" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			div0 = element("div");
    			t0 = space();
    			create_component(sectionnumber.$$.fragment);
    			t1 = space();
    			section0 = element("section");
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			create_component(textreveal.$$.fragment);
    			t3 = space();
    			h5 = element("h5");
    			t4 = text("Shoot me a message and I will get back to you as soon as I can. My\r\n            email is \r\n            ");
    			button0 = element("button");
    			t5 = text("thechikkipatel@gmail.com");
    			t6 = space();
    			form = element("form");
    			input0 = element("input");
    			t7 = space();
    			label = element("label");
    			t8 = text("Don’t fill this out if you’re human: ");
    			input1 = element("input");
    			t9 = space();
    			div4 = element("div");
    			input2 = element("input");
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			textarea = element("textarea");
    			t12 = space();
    			button1 = element("button");
    			i0 = element("i");
    			t13 = space();
    			p = element("p");
    			t14 = text("Send");
    			t15 = space();
    			button2 = element("button");
    			i1 = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			section1 = claim_element(nodes, "SECTION", { id: true, class: true });
    			var section1_nodes = children(section1);

    			div0 = claim_element(section1_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			children(div0).forEach(detach_dev);
    			t0 = claim_space(section1_nodes);
    			claim_component(sectionnumber.$$.fragment, section1_nodes);
    			t1 = claim_space(section1_nodes);
    			section0 = claim_element(section1_nodes, "SECTION", { class: true });
    			var section0_nodes = children(section0);
    			div6 = claim_element(section0_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			div2 = claim_element(div6_nodes, "DIV", {});
    			var div2_nodes = children(div2);

    			div1 = claim_element(div2_nodes, "DIV", {
    				"data-aos": true,
    				"data-aos-delay": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			children(div1).forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t2 = claim_space(div6_nodes);
    			div5 = claim_element(div6_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			div3 = claim_element(div5_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			h2 = claim_element(div3_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			claim_component(textreveal.$$.fragment, h2_nodes);
    			h2_nodes.forEach(detach_dev);
    			t3 = claim_space(div3_nodes);
    			h5 = claim_element(div3_nodes, "H5", { "data-aos": true, class: true });
    			var h5_nodes = children(h5);
    			t4 = claim_text(h5_nodes, "Shoot me a message and I will get back to you as soon as I can. My\r\n            email is \r\n            ");
    			button0 = claim_element(h5_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t5 = claim_text(button0_nodes, "thechikkipatel@gmail.com");
    			button0_nodes.forEach(detach_dev);
    			h5_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t6 = claim_space(div5_nodes);

    			form = claim_element(div5_nodes, "FORM", {
    				"aria-label": true,
    				"data-aos": true,
    				"data-aos-duration": true,
    				"data-aos-delay": true,
    				name: true,
    				action: true,
    				method: true,
    				"data-netlify": true,
    				"netlify-honeypot": true,
    				class: true
    			});

    			var form_nodes = children(form);
    			input0 = claim_element(form_nodes, "INPUT", { type: true, name: true, value: true });
    			t7 = claim_space(form_nodes);
    			label = claim_element(form_nodes, "LABEL", { for: true, class: true });
    			var label_nodes = children(label);
    			t8 = claim_text(label_nodes, "Don’t fill this out if you’re human: ");
    			input1 = claim_element(label_nodes, "INPUT", { name: true });
    			label_nodes.forEach(detach_dev);
    			t9 = claim_space(form_nodes);
    			div4 = claim_element(form_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);

    			input2 = claim_element(div4_nodes, "INPUT", {
    				name: true,
    				class: true,
    				type: true,
    				placeholder: true,
    				required: true
    			});

    			t10 = claim_space(div4_nodes);

    			input3 = claim_element(div4_nodes, "INPUT", {
    				name: true,
    				class: true,
    				type: true,
    				placeholder: true,
    				required: true
    			});

    			div4_nodes.forEach(detach_dev);
    			t11 = claim_space(form_nodes);

    			textarea = claim_element(form_nodes, "TEXTAREA", {
    				name: true,
    				class: true,
    				placeholder: true,
    				rows: true,
    				required: true
    			});

    			children(textarea).forEach(detach_dev);
    			t12 = claim_space(form_nodes);
    			button1 = claim_element(form_nodes, "BUTTON", { type: true, class: true });
    			var button1_nodes = children(button1);
    			i0 = claim_element(button1_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			t13 = claim_space(button1_nodes);
    			p = claim_element(button1_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t14 = claim_text(p_nodes, "Send");
    			p_nodes.forEach(detach_dev);
    			button1_nodes.forEach(detach_dev);
    			form_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			section0_nodes.forEach(detach_dev);
    			t15 = claim_space(section1_nodes);

    			button2 = claim_element(section1_nodes, "BUTTON", {
    				title: true,
    				"aria-label": true,
    				"data-aos": true,
    				"data-aos-offset": true,
    				"data-aos-duration": true,
    				class: true
    			});

    			var button2_nodes = children(button2);
    			i1 = claim_element(button2_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			button2_nodes.forEach(detach_dev);
    			section1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "data-aos", "slide-down");
    			attr_dev(div0, "data-aos-delay", "900");
    			attr_dev(div0, "data-aos-duration", "700");
    			attr_dev(div0, "class", "absolute background left-0 w-2/5 h-full moving-gradient-1");
    			add_location(div0, file$a, 35, 2, 1102);
    			attr_dev(div1, "data-aos", "flip-up");
    			attr_dev(div1, "data-aos-delay", "600");
    			attr_dev(div1, "data-aos-duration", "700");
    			attr_dev(div1, "class", "bg-purple-400 dark:bg-purple-300 shadow-purple-300/60 shadow-lg w-8 h-1.5 lg:w-10 lg:h-2 ml-0.5 mb-6");
    			add_location(div1, file$a, 54, 8, 1596);
    			add_location(div2, file$a, 53, 6, 1581);
    			attr_dev(h2, "class", "text-gray-700 dark:text-gray-200 inline-block tracking-wide text-4xl md:text-5xl lg:text-6xl font-black mb-2");
    			add_location(h2, file$a, 63, 10, 1924);
    			attr_dev(button0, "class", "text-gray-700 dark:text-gray-100 underline");
    			add_location(button0, file$a, 72, 12, 2330);
    			attr_dev(h5, "data-aos", "fade");
    			attr_dev(h5, "class", "text-gray-500 dark:text-gray-300 mb-7");
    			add_location(h5, file$a, 69, 10, 2147);
    			attr_dev(div3, "class", "basis-2/5");
    			add_location(div3, file$a, 62, 8, 1889);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "form-name");
    			input0.value = "contact";
    			add_location(input0, file$a, 93, 10, 2974);
    			attr_dev(input1, "name", "bot-field");
    			add_location(input1, file$a, 95, 50, 3131);
    			attr_dev(label, "for", "bot-field");
    			attr_dev(label, "class", "hidden");
    			add_location(label, file$a, 94, 10, 3042);
    			attr_dev(input2, "name", "name");
    			attr_dev(input2, "class", "w-full mb-3 md:mb-4 mr-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 dark:text-gray-50");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Your name");
    			input2.required = true;
    			add_location(input2, file$a, 100, 12, 3282);
    			attr_dev(input3, "name", "email");
    			attr_dev(input3, "class", "w-full mb-3 md:mb-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 dark:text-gray-50");
    			attr_dev(input3, "type", "email");
    			attr_dev(input3, "placeholder", "Your email");
    			input3.required = true;
    			add_location(input3, file$a, 107, 12, 3540);
    			attr_dev(div4, "class", "flex flex-col md:flex-row lg:flex-col");
    			add_location(div4, file$a, 99, 10, 3217);
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "class", "w-full px-4 py-2 mb-4 min-h-1/4 bg-gray-200 dark:bg-gray-700 dark:text-gray-50");
    			attr_dev(textarea, "placeholder", "Tell me what you think!");
    			attr_dev(textarea, "rows", "6");
    			textarea.required = true;
    			add_location(textarea, file$a, 116, 10, 3814);
    			attr_dev(i0, "class", "far fa-paper-plane text-xs");
    			add_location(i0, file$a, 126, 13, 4317);
    			attr_dev(p, "class", "font-semibold font-mono");
    			add_location(p, file$a, 127, 12, 4371);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "transition-colors bg-purple-200 shadow-purple-300/20 shadow-lg rounded-sm border border-purple-400 hover:bg-purple-300 text-gray-700 py-1 px-4 flex items-center gap-3 ml-auto");
    			add_location(button1, file$a, 123, 10, 4072);
    			attr_dev(form, "aria-label", "contact form");
    			attr_dev(form, "data-aos", "fade");
    			attr_dev(form, "data-aos-duration", "700");
    			attr_dev(form, "data-aos-delay", "200");
    			attr_dev(form, "name", "contact");
    			attr_dev(form, "action", "action");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "data-netlify", "true");
    			attr_dev(form, "netlify-honeypot", "bot-field");
    			attr_dev(form, "class", "basis-3/5");
    			add_location(form, file$a, 80, 8, 2588);
    			attr_dev(div5, "class", "lg:flex gap-10");
    			add_location(div5, file$a, 61, 6, 1851);
    			attr_dev(div6, "class", "bg-gray-50 dark:bg-gray-900 shadow-2xl px-5 md:px-7 py-10 lg:px-10 lg:py-14 mb-16");
    			add_location(div6, file$a, 50, 4, 1465);
    			attr_dev(section0, "class", "section relative");
    			add_location(section0, file$a, 49, 2, 1425);
    			attr_dev(i1, "class", "hover-vertical fas fa-angle-up");
    			add_location(i1, file$a, 143, 4, 4822);
    			attr_dev(button2, "title", "Back to top");
    			attr_dev(button2, "aria-label", "Back to top");
    			attr_dev(button2, "data-aos", "fade-up");
    			attr_dev(button2, "data-aos-offset", "200");
    			attr_dev(button2, "data-aos-duration", "700");
    			attr_dev(button2, "class", "text-xl lg:text-3xl py-5 text-gray-700 dark:text-white w-14 mx-auto text-center absolute bottom-20 right-0 left-0");
    			add_location(button2, file$a, 134, 2, 4498);
    			attr_dev(section1, "id", "contact");
    			attr_dev(section1, "class", "main overflow-hidden relative bg-gray-100 bg-gradient-to-b dark:from-gray-800 dark:to-gray-900");
    			add_location(section1, file$a, 31, 0, 965);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div0);
    			append_dev(section1, t0);
    			mount_component(sectionnumber, section1, null);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h2);
    			mount_component(textreveal, h2, null);
    			append_dev(div3, t3);
    			append_dev(div3, h5);
    			append_dev(h5, t4);
    			append_dev(h5, button0);
    			append_dev(button0, t5);
    			append_dev(div5, t6);
    			append_dev(div5, form);
    			append_dev(form, input0);
    			append_dev(form, t7);
    			append_dev(form, label);
    			append_dev(label, t8);
    			append_dev(label, input1);
    			append_dev(form, t9);
    			append_dev(form, div4);
    			append_dev(div4, input2);
    			append_dev(div4, t10);
    			append_dev(div4, input3);
    			append_dev(form, t11);
    			append_dev(form, textarea);
    			append_dev(form, t12);
    			append_dev(form, button1);
    			append_dev(button1, i0);
    			append_dev(button1, t13);
    			append_dev(button1, p);
    			append_dev(p, t14);
    			append_dev(section1, t15);
    			append_dev(section1, button2);
    			append_dev(button2, i1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[0], false, false, false),
    					listen_dev(form, "submit", prevent_default(submitForm), false, true, false),
    					listen_dev(button2, "click", /*click_handler_1*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionnumber.$$.fragment, local);
    			transition_in(textreveal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionnumber.$$.fragment, local);
    			transition_out(textreveal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_component(sectionnumber);
    			destroy_component(textreveal);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function submitForm() {
    	let contactForm = document.querySelector("form");
    	const formData = new FormData(contactForm);

    	let res = await fetch(contactForm.getAttribute("action"), {
    		method: "POST",
    		headers: {
    			Accept: "application/x-www-form-urlencoded;charset=UTF-8",
    			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    		},
    		body: new URLSearchParams(formData).toString()
    	});

    	if (res.ok) {
    		alert("Thank you for your message! I will get back to you as soon as I can.");
    		contactForm.reset();
    	} else {
    		alert("Uh oh... message failed to send. You can email me directly at thechikkipatel@gmail.com");
    	}
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => copyToClipboard("thechikkipatel@gmail.com");
    	const click_handler_1 = () => window.scrollTo(0, 0);

    	$$self.$capture_state = () => ({
    		copyToClipboard,
    		SectionNumber,
    		TextReveal,
    		submitForm
    	});

    	return [click_handler, click_handler_1];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\pages\Main.svelte generated by Svelte v3.31.2 */
    const file$b = "src\\pages\\Main.svelte";

    function create_fragment$d(ctx) {
    	let main;
    	let hero;
    	let updating_theme;
    	let t0;
    	let about;
    	let t1;
    	let experience;
    	let t2;
    	let webdev;
    	let t3;
    	let contact;
    	let current;

    	function hero_theme_binding(value) {
    		/*hero_theme_binding*/ ctx[1].call(null, value);
    	}

    	let hero_props = {};

    	if (/*theme*/ ctx[0] !== void 0) {
    		hero_props.theme = /*theme*/ ctx[0];
    	}

    	hero = new Hero({ props: hero_props, $$inline: true });
    	binding_callbacks.push(() => bind(hero, "theme", hero_theme_binding));
    	about = new About({ $$inline: true });
    	experience = new Experience({ $$inline: true });
    	webdev = new WebDev({ $$inline: true });
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(hero.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(experience.$$.fragment);
    			t2 = space();
    			create_component(webdev.$$.fragment);
    			t3 = space();
    			create_component(contact.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			claim_component(hero.$$.fragment, main_nodes);
    			t0 = claim_space(main_nodes);
    			claim_component(about.$$.fragment, main_nodes);
    			t1 = claim_space(main_nodes);
    			claim_component(experience.$$.fragment, main_nodes);
    			t2 = claim_space(main_nodes);
    			claim_component(webdev.$$.fragment, main_nodes);
    			t3 = claim_space(main_nodes);
    			claim_component(contact.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(main, "class", "snap-y");
    			add_location(main, file$b, 9, 0, 253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(hero, main, null);
    			append_dev(main, t0);
    			mount_component(about, main, null);
    			append_dev(main, t1);
    			mount_component(experience, main, null);
    			append_dev(main, t2);
    			mount_component(webdev, main, null);
    			append_dev(main, t3);
    			mount_component(contact, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hero_changes = {};

    			if (!updating_theme && dirty & /*theme*/ 1) {
    				updating_theme = true;
    				hero_changes.theme = /*theme*/ ctx[0];
    				add_flush_callback(() => updating_theme = false);
    			}

    			hero.$set(hero_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(experience.$$.fragment, local);
    			transition_in(webdev.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(experience.$$.fragment, local);
    			transition_out(webdev.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hero);
    			destroy_component(about);
    			destroy_component(experience);
    			destroy_component(webdev);
    			destroy_component(contact);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Main", slots, []);
    	let { theme } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	function hero_theme_binding(value) {
    		theme = value;
    		$$invalidate(0, theme);
    	}

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		Hero,
    		About,
    		Experience,
    		WebDev,
    		Contact,
    		theme
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, hero_theme_binding];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*theme*/ ctx[0] === undefined && !("theme" in props)) {
    			console.warn("<Main> was created without expected prop 'theme'");
    		}
    	}

    	get theme() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.31.2 */

    const file$c = "src\\components\\Footer.svelte";

    function create_fragment$e(ctx) {
    	let footer;
    	let ul;
    	let li0;
    	let a0;
    	let i0;
    	let t0;
    	let li1;
    	let a1;
    	let i1;
    	let t1;
    	let li2;
    	let a2;
    	let i2;
    	let t2;
    	let div;
    	let a3;
    	let t3;
    	let time;
    	let t4;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			li1 = element("li");
    			a1 = element("a");
    			i1 = element("i");
    			t1 = space();
    			li2 = element("li");
    			a2 = element("a");
    			i2 = element("i");
    			t2 = space();
    			div = element("div");
    			a3 = element("a");
    			t3 = text("Designed & Built by Chaitanya Patel © ");
    			time = element("time");
    			t4 = text("2023");
    			this.h();
    		},
    		l: function claim(nodes) {
    			footer = claim_element(nodes, "FOOTER", { class: true });
    			var footer_nodes = children(footer);
    			ul = claim_element(footer_nodes, "UL", { "data-aos": true, class: true });
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", { class: true });
    			var li0_nodes = children(li0);

    			a0 = claim_element(li0_nodes, "A", {
    				title: true,
    				"aria-label": true,
    				href: true,
    				target: true,
    				class: true
    			});

    			var a0_nodes = children(a0);
    			i0 = claim_element(a0_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			a0_nodes.forEach(detach_dev);
    			li0_nodes.forEach(detach_dev);
    			t0 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", { class: true });
    			var li1_nodes = children(li1);

    			a1 = claim_element(li1_nodes, "A", {
    				title: true,
    				"aria-label": true,
    				href: true,
    				target: true,
    				class: true
    			});

    			var a1_nodes = children(a1);
    			i1 = claim_element(a1_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			a1_nodes.forEach(detach_dev);
    			li1_nodes.forEach(detach_dev);
    			t1 = claim_space(ul_nodes);
    			li2 = claim_element(ul_nodes, "LI", { class: true });
    			var li2_nodes = children(li2);

    			a2 = claim_element(li2_nodes, "A", {
    				title: true,
    				"aria-label": true,
    				href: true,
    				target: true,
    				class: true
    			});

    			var a2_nodes = children(a2);
    			i2 = claim_element(a2_nodes, "I", { class: true });
    			children(i2).forEach(detach_dev);
    			a2_nodes.forEach(detach_dev);
    			li2_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			t2 = claim_space(footer_nodes);
    			div = claim_element(footer_nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			a3 = claim_element(div_nodes, "A", {
    				"data-aos": true,
    				class: true,
    				href: true,
    				target: true
    			});

    			var a3_nodes = children(a3);
    			t3 = claim_text(a3_nodes, "Designed & Built by Chaitanya Patel © ");
    			time = claim_element(a3_nodes, "TIME", {});
    			var time_nodes = children(time);
    			t4 = claim_text(time_nodes, "2023");
    			time_nodes.forEach(detach_dev);
    			a3_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			footer_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i0, "class", "fab fa-github fa-lg");
    			add_location(i0, file$c, 10, 29, 427);
    			attr_dev(a0, "title", "View my GitHub profile");
    			attr_dev(a0, "aria-label", "See my GitHub profile");
    			attr_dev(a0, "href", "https://github.com/War-Keeper");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "nav-text p-1");
    			add_location(a0, file$c, 5, 6, 239);
    			attr_dev(li0, "class", "m-0");
    			add_location(li0, file$c, 4, 4, 215);
    			attr_dev(i1, "class", "fab fa-linkedin-in fa-lg");
    			add_location(i1, file$c, 21, 8, 721);
    			attr_dev(a1, "title", "Connect on LinkedIn");
    			attr_dev(a1, "aria-label", "Connect on LinkedIn");
    			attr_dev(a1, "href", "https://www.linkedin.com/in/cpatel3/");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "nav-text p-1");
    			add_location(a1, file$c, 14, 6, 513);
    			attr_dev(li1, "class", "m-0");
    			add_location(li1, file$c, 13, 4, 489);
    			attr_dev(i2, "class", "far fa-envelope fa-lg");
    			add_location(i2, file$c, 32, 8, 1009);
    			attr_dev(a2, "title", "Send me an email");
    			attr_dev(a2, "aria-label", "Send me an email");
    			attr_dev(a2, "href", "mailto:thechikkipatel@gmail.com");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "nav-text p-1");
    			add_location(a2, file$c, 25, 6, 812);
    			attr_dev(li2, "class", "m-0");
    			add_location(li2, file$c, 24, 4, 788);
    			attr_dev(ul, "data-aos", "fade-down");
    			attr_dev(ul, "class", "flex item-center justify-center gap-6 mb-8");
    			add_location(ul, file$c, 3, 2, 133);
    			add_location(time, file$c, 46, 49, 1350);
    			attr_dev(a3, "data-aos", "fade-up");
    			attr_dev(a3, "class", "nav-text text-gray-700 dark:text-gray-50");
    			attr_dev(a3, "href", "https://github.com/War-Keeper/Chaitanya-Portfolio");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$c, 40, 4, 1121);
    			attr_dev(div, "class", "text-center");
    			add_location(div, file$c, 39, 2, 1090);
    			attr_dev(footer, "class", "main shadow-2xl py-32 z-50 bg-gray-50 dark:bg-gray-700 bg-gradient-to-b dark:from-gray-800 dark:to-gray-900");
    			add_location(footer, file$c, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, i0);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, i1);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, i2);
    			append_dev(footer, t2);
    			append_dev(footer, div);
    			append_dev(div, a3);
    			append_dev(a3, t3);
    			append_dev(a3, time);
    			append_dev(time, t4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    const resume = {
      name: "Chaitanya Patel",
      title: "Software Developer &\n Data Scientist",
      phoneNumber: "+1 (917) 361 7430",
      website: {
        url: "https://www.bobng.me/",
        label: "bobng.me",
      },
      email: {
        url: "thechikkipatel@gmail.com",
        label: "thechikkipatel@gmail.com",
      },
      linkedIn: {
        url: "https://www.linkedin.com/in/cpatel3/",
        label: "linkedin.com/in/cpatel3",
      },
      github: {
        url: "https://github.com/War-Keeper",
        label: "github.com/War-Keeper",
      },
      location: "Raleigh, North Carolina",
      about:
        // "Skilled and diligent programmer with an eye for good designs. Always seeking to learn and improve on existing ways. A resourceful and avid self-learner passionate in coding.",
        "Accomplished and diligent software developer with a good eye for designs. Able to deliver products with high quality proven through customer satisfaction. Friendly, with strong communication skills with teammates. Seeking to learn and grow to become a professional software engineer.",
      codingLanguages: [
        "Python",
        "Java",
        "C(++)",
        "JavaScript (ES6)", // ES6
        "C#",
        "SQL",
        "Ruby",
      ],
      // Netlify, Github,
      techStack: [
        "Pytorch",
        "SKlearn",
        "Numpy",
        "Pandas",
        "NetworkX",
        "Apache Spark",
        "Svelte",
        "Unity Engine",
        "Git",
        "MongoDB",
        "AWS",
        "Postgres",
        "Docker",
        "Django",
        "Github Actions",
        "Apache Kafka (in progress)",
      ],
      // Ukulele
      interests: ["Kayaking", "PC Building", "Gaming"],
      languages: ["English", "Gujarati", "Hindi"],
      lastUpdated: "3 Aug 2023",
      education: {
        school: "North Carolina State University",
        cgpa: "4.0 (Dean's List Scholar)",
        major: "Masters in Computer Science",
        timeline: "Aug 2021 - Dec 2022",
        courses: [
          { name: "Artificial Intelligence", grade: "A+" },
          { name: "Automated Learning and Data Analysis", grade: "A+" },
          { name: "Software Engineering", grade: "A+" },
          { name: "High-Performance Machine Learning", grade: "A+" },
          { name: "Database Management Systems", grade: "A+" },
        ],
      },

      experiences: [
        {
          company: "Genova Diagnostics",
          position: "Immunology Lab Tech",
          timeline: "May 2019 – August 2021",
          points: [
            "Facilitated work with Human Specimens for Immunoassays using both manual and automated processes.",
            "Assisted in the maintenance of the IT infrastructure and troubleshooting software.",
            "Developed a streamlined approach to minimize errors and breakdown of machines and increase the throughput of systems by roughly 10%.",
          ],
        },
        {
          company: " University of North Carolina Asheville",
          position: "Physical Chemistry Researcher",
          timeline: "May 2016 – May 2018",
          points: [
            "Research involving the creation, analysis, and degradation of Halogen gases.",
            "The equipment used involved vacuum racks, Gas Chromatography-Mass Spectrometry detector",
            "Collaborated on the development of new techniques for trapping and detecting molecules.",
            " Worked with various software packages designed for the analysis and detection of molecules.",
          ],
        },
      ],
      projects: [
        {
          name: "EcoNET - True Error Detection",
          type: "Personal project",
          points: [
            "Oversaw analysis of North Carolina Weather Station Data (ECONet), apply classification techniques to determine which data points are erroneous, using multiple machine learning techniques. ",
          "Leadership role in a small team.",
          ],
        },
        {
          name: "Database Management System",
          type: "Personal project",
          points: [
            "Design a Multilevel Database Management system for a Publishing house. Everything from Database Design to deployment is taken into consideration.",
            "Done in a Team setting.",
          ],
        },
        {
          name: "Real-time AI Video Upscaling",
          type: "Personal project",
          points: [
            "Design a Real-time Video upscaling software using state-of-the-art techniques to create efficient AI systems.",
            "Adapting various Optimization strategies and software packages to strategically cut down existing AI models for fast processing.",
          ],
        },
        // {
        //   name: "Water Chef",
        //   type: "Personal project",
        //   points: [
        //     "A fast paced restaurant simulator game developed with Unity Engine and written in C#.",
        //     "Complete with multiple levels, objectives, animations, music, and save load functionality.",
        //   ],
        // },
        // {
        //   name: "Fishackathon 2018",
        //   type: "by HackerNest",
        //   points: [
        //     "Built an app to generate awareness of region specific fishing laws.",
        //     "Presented to judges working in the fishing industry.",
        //   ],
        // },
      ],
    };

    /* src\pages\Resume.svelte generated by Svelte v3.31.2 */
    const file$d = "src\\pages\\Resume.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (25:6) <Link          to="/"          class="px-4 py-2 inline-block leading-4 border-green-400 border bg-green-200 hover:bg-green-300 rounded-none mr-3 text-gray-700 font-mono"        >
    function create_default_slot$2(ctx) {
    	let p;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i = element("i");
    			t = text("Go Back");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			i = claim_element(p_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			t = claim_text(p_nodes, "Go Back");
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", "fas fa-arrow-left mr-3");
    			add_location(i, file$d, 29, 10, 766);
    			attr_dev(p, "class", "text-gray-700 font-bold font-mono");
    			add_location(p, file$d, 28, 8, 709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i);
    			append_dev(p, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(25:6) <Link          to=\\\"/\\\"          class=\\\"px-4 py-2 inline-block leading-4 border-green-400 border bg-green-200 hover:bg-green-300 rounded-none mr-3 text-gray-700 font-mono\\\"        >",
    		ctx
    	});

    	return block;
    }

    // (107:12) {#each resume.codingLanguages as codingLanguage}
    function create_each_block_6(ctx) {
    	let h4;
    	let t0_value = /*codingLanguage*/ ctx[18] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h4 = claim_element(nodes, "H4", { class: true });
    			var h4_nodes = children(h4);
    			t0 = claim_text(h4_nodes, t0_value);
    			t1 = claim_space(h4_nodes);
    			h4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h4, "class", "" + (null_to_empty(`bg-${primary} px-2.5 py-1.5 font-bold text-xs text-white`) + " svelte-fue1fc"));
    			add_location(h4, file$d, 107, 14, 3670);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(107:12) {#each resume.codingLanguages as codingLanguage}",
    		ctx
    	});

    	return block;
    }

    // (124:12) {#each resume.techStack as framework}
    function create_each_block_5(ctx) {
    	let h4;
    	let t0_value = /*framework*/ ctx[15] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h4 = claim_element(nodes, "H4", { class: true });
    			var h4_nodes = children(h4);
    			t0 = claim_text(h4_nodes, t0_value);
    			t1 = claim_space(h4_nodes);
    			h4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h4, "class", "" + (null_to_empty(`bg-${primary} px-2.5 py-1.5 font-bold text-xs text-white`) + " svelte-fue1fc"));
    			add_location(h4, file$d, 124, 14, 4220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(124:12) {#each resume.techStack as framework}",
    		ctx
    	});

    	return block;
    }

    // (172:12) {#each resume.education.courses as course}
    function create_each_block_4(ctx) {
    	let li;
    	let t0_value = /*course*/ ctx[12].name + "";
    	let t0;
    	let t1;
    	let p;
    	let raw_value = /*course*/ ctx[12].grade + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", {});
    			var li_nodes = children(li);
    			t0 = claim_text(li_nodes, t0_value);
    			t1 = claim_space(li_nodes);
    			p = claim_element(li_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			p_nodes.forEach(detach_dev);
    			t2 = claim_space(li_nodes);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "float-right");
    			add_location(p, file$d, 174, 16, 5838);
    			add_location(li, file$d, 172, 14, 5785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, p);
    			p.innerHTML = raw_value;
    			append_dev(li, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(172:12) {#each resume.education.courses as course}",
    		ctx
    	});

    	return block;
    }

    // (203:14) {#each experience.points as point}
    function create_each_block_3(ctx) {
    	let li;
    	let t_value = /*point*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", {});
    			var li_nodes = children(li);
    			t = claim_text(li_nodes, t_value);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(li, file$d, 203, 16, 6835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(203:14) {#each experience.points as point}",
    		ctx
    	});

    	return block;
    }

    // (188:10) {#each resume.experiences as experience, i}
    function create_each_block_2(ctx) {
    	let h3;
    	let t0_value = /*experience*/ ctx[8].company + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*experience*/ ctx[8].timeline + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4_value = /*experience*/ ctx[8].position + "";
    	let t4;
    	let t5;
    	let ul;
    	let t6;
    	let each_value_3 = /*experience*/ ctx[8].points;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h3 = claim_element(nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, t0_value);
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			p0 = claim_element(nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t2 = claim_text(p0_nodes, t2_value);
    			p0_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			p1 = claim_element(nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t4 = claim_text(p1_nodes, t4_value);
    			p1_nodes.forEach(detach_dev);
    			t5 = claim_space(nodes);
    			ul = claim_element(nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			t6 = claim_space(ul_nodes);
    			ul_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "text-gray-700 text-md font-bold");
    			add_location(h3, file$d, 188, 12, 6241);
    			attr_dev(p0, "class", "text-sm text-gray-400 float-right text-right");
    			add_location(p0, file$d, 191, 12, 6354);
    			attr_dev(p1, "class", "text-sm text-gray-400 mb-0.5 italic");
    			add_location(p1, file$d, 194, 12, 6479);

    			attr_dev(ul, "class", "" + (null_to_empty(`list-square text-gray-600 pl-5 text-xs ${/*i*/ ctx[4] == resume.experiences.length - 1
			? "mb-0"
			: "mb-2"}`) + " svelte-fue1fc"));

    			add_location(ul, file$d, 197, 12, 6595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resume*/ 0) {
    				each_value_3 = /*experience*/ ctx[8].points;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t6);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(188:10) {#each resume.experiences as experience, i}",
    		ctx
    	});

    	return block;
    }

    // (231:14) {#each project.points as point}
    function create_each_block_1$1(ctx) {
    	let li;
    	let t_value = /*point*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", {});
    			var li_nodes = children(li);
    			t = claim_text(li_nodes, t_value);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(li, file$d, 231, 16, 7750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(231:14) {#each project.points as point}",
    		ctx
    	});

    	return block;
    }

    // (219:10) {#each resume.projects as project, i}
    function create_each_block$3(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*project*/ ctx[2].name + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*project*/ ctx[2].type + "";
    	let t2;
    	let t3;
    	let ul;
    	let t4;
    	let each_value_1 = /*project*/ ctx[2].points;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			h3 = claim_element(div_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, t0_value);
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t2 = claim_text(p_nodes, t2_value);
    			p_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			ul = claim_element(nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			t4 = claim_space(ul_nodes);
    			ul_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "text-gray-700 text-md font-bold");
    			add_location(h3, file$d, 220, 14, 7311);
    			attr_dev(p, "class", "text-sm text-gray-400 italic");
    			add_location(p, file$d, 223, 14, 7424);
    			attr_dev(div, "class", "flex justify-between items-baseline mb-0.5");
    			add_location(div, file$d, 219, 12, 7239);

    			attr_dev(ul, "class", "" + (null_to_empty(`list-square text-gray-600 pl-5 text-xs ${/*i*/ ctx[4] == resume.projects.length - 1
			? "mb-0"
			: "mb-2"}`) + " svelte-fue1fc"));

    			add_location(ul, file$d, 225, 12, 7516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resume*/ 0) {
    				each_value_1 = /*project*/ ctx[2].points;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(219:10) {#each resume.projects as project, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let main1;
    	let div12;
    	let div0;
    	let link;
    	let t0;
    	let button;
    	let i0;
    	let t1;
    	let t2;
    	let main0;
    	let section;
    	let aside;
    	let h1;
    	let t3_value = resume.name + "";
    	let t3;
    	let t4;
    	let h30;
    	let t5_value = resume.title + "";
    	let t5;
    	let t6;
    	let div1;
    	let i1;
    	let t7;
    	let p0;
    	let t8_value = resume.phoneNumber + "";
    	let t8;
    	let t9;
    	let i2;
    	let t10;
    	let a0;
    	let t11_value = resume.website.label + "";
    	let t11;
    	let t12;
    	let i3;
    	let t13;
    	let p1;
    	let t14_value = resume.email.label + "";
    	let t14;
    	let t15;
    	let i4;
    	let t16;
    	let a1;
    	let t17_value = resume.linkedIn.label + "";
    	let t17;
    	let t18;
    	let i5;
    	let t19;
    	let a2;
    	let t20_value = resume.github.label + "";
    	let t20;
    	let t21;
    	let i6;
    	let t22;
    	let p2;
    	let t23_value = resume.location + "";
    	let t23;
    	let t24;
    	let div2;
    	let h20;
    	let t25;
    	let t26;
    	let p3;
    	let q;
    	let t27_value = resume.about + "";
    	let t27;
    	let t28;
    	let div4;
    	let h21;
    	let t29;
    	let t30;
    	let div3;
    	let t31;
    	let div6;
    	let h22;
    	let t32;
    	let t33;
    	let div5;
    	let t34;
    	let div7;
    	let h31;
    	let t35;
    	let span;
    	let t36_value = resume.lastUpdated + "";
    	let t36;
    	let t37;
    	let article;
    	let div9;
    	let h23;
    	let t38;
    	let t39;
    	let div8;
    	let h32;
    	let t40_value = resume.education.school + "";
    	let t40;
    	let t41;
    	let p4;
    	let t42;
    	let t43_value = resume.education.cgpa + "";
    	let t43;
    	let t44;
    	let p5;
    	let t45_value = resume.education.timeline + "";
    	let t45;
    	let t46;
    	let p6;
    	let t47_value = resume.education.major + "";
    	let t47;
    	let t48;
    	let ul;
    	let t49;
    	let div10;
    	let h24;
    	let t50;
    	let t51;
    	let t52;
    	let div11;
    	let h25;
    	let t53;
    	let t54;
    	let current;
    	let mounted;
    	let dispose;

    	link = new Link({
    			props: {
    				to: "/",
    				class: "px-4 py-2 inline-block leading-4 border-green-400 border bg-green-200 hover:bg-green-300 rounded-none mr-3 text-gray-700 font-mono",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_6 = resume.codingLanguages;
    	validate_each_argument(each_value_6);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_4[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	let each_value_5 = resume.techStack;
    	validate_each_argument(each_value_5);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_3[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_value_4 = resume.education.courses;
    	validate_each_argument(each_value_4);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_2 = resume.experiences;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = resume.projects;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main1 = element("main");
    			div12 = element("div");
    			div0 = element("div");
    			create_component(link.$$.fragment);
    			t0 = space();
    			button = element("button");
    			i0 = element("i");
    			t1 = text("Print");
    			t2 = space();
    			main0 = element("main");
    			section = element("section");
    			aside = element("aside");
    			h1 = element("h1");
    			t3 = text(t3_value);
    			t4 = space();
    			h30 = element("h3");
    			t5 = text(t5_value);
    			t6 = space();
    			div1 = element("div");
    			i1 = element("i");
    			t7 = space();
    			p0 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			i2 = element("i");
    			t10 = space();
    			a0 = element("a");
    			t11 = text(t11_value);
    			t12 = space();
    			i3 = element("i");
    			t13 = space();
    			p1 = element("p");
    			t14 = text(t14_value);
    			t15 = space();
    			i4 = element("i");
    			t16 = space();
    			a1 = element("a");
    			t17 = text(t17_value);
    			t18 = space();
    			i5 = element("i");
    			t19 = space();
    			a2 = element("a");
    			t20 = text(t20_value);
    			t21 = space();
    			i6 = element("i");
    			t22 = space();
    			p2 = element("p");
    			t23 = text(t23_value);
    			t24 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			t25 = text("About Me");
    			t26 = space();
    			p3 = element("p");
    			q = element("q");
    			t27 = text(t27_value);
    			t28 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			t29 = text("Coding Languages");
    			t30 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t31 = space();
    			div6 = element("div");
    			h22 = element("h2");
    			t32 = text("Tech Stack");
    			t33 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t34 = space();
    			div7 = element("div");
    			h31 = element("h3");
    			t35 = text("Last updated on: ");
    			span = element("span");
    			t36 = text(t36_value);
    			t37 = space();
    			article = element("article");
    			div9 = element("div");
    			h23 = element("h2");
    			t38 = text("Education");
    			t39 = space();
    			div8 = element("div");
    			h32 = element("h3");
    			t40 = text(t40_value);
    			t41 = space();
    			p4 = element("p");
    			t42 = text("CGPA: ");
    			t43 = text(t43_value);
    			t44 = space();
    			p5 = element("p");
    			t45 = text(t45_value);
    			t46 = space();
    			p6 = element("p");
    			t47 = text(t47_value);
    			t48 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t49 = space();
    			div10 = element("div");
    			h24 = element("h2");
    			t50 = text("Experience");
    			t51 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t52 = space();
    			div11 = element("div");
    			h25 = element("h2");
    			t53 = text("Projects");
    			t54 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			main1 = claim_element(nodes, "MAIN", { class: true });
    			var main1_nodes = children(main1);
    			div12 = claim_element(main1_nodes, "DIV", { class: true });
    			var div12_nodes = children(div12);
    			div0 = claim_element(div12_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			claim_component(link.$$.fragment, div0_nodes);
    			t0 = claim_space(div0_nodes);
    			button = claim_element(div0_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			i0 = claim_element(button_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			t1 = claim_text(button_nodes, "Print");
    			button_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div12_nodes);
    			main0 = claim_element(div12_nodes, "MAIN", { class: true });
    			var main0_nodes = children(main0);
    			section = claim_element(main0_nodes, "SECTION", { class: true });
    			var section_nodes = children(section);
    			aside = claim_element(section_nodes, "ASIDE", { class: true });
    			var aside_nodes = children(aside);
    			h1 = claim_element(aside_nodes, "H1", { class: true, fstyle: true });
    			var h1_nodes = children(h1);
    			t3 = claim_text(h1_nodes, t3_value);
    			h1_nodes.forEach(detach_dev);
    			t4 = claim_space(aside_nodes);
    			h30 = claim_element(aside_nodes, "H3", { class: true });
    			var h30_nodes = children(h30);
    			t5 = claim_text(h30_nodes, t5_value);
    			h30_nodes.forEach(detach_dev);
    			t6 = claim_space(aside_nodes);
    			div1 = claim_element(aside_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			i1 = claim_element(div1_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			t7 = claim_space(div1_nodes);
    			p0 = claim_element(div1_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t8 = claim_text(p0_nodes, t8_value);
    			p0_nodes.forEach(detach_dev);
    			t9 = claim_space(div1_nodes);
    			i2 = claim_element(div1_nodes, "I", { class: true });
    			children(i2).forEach(detach_dev);
    			t10 = claim_space(div1_nodes);
    			a0 = claim_element(div1_nodes, "A", { href: true, target: true, class: true });
    			var a0_nodes = children(a0);
    			t11 = claim_text(a0_nodes, t11_value);
    			a0_nodes.forEach(detach_dev);
    			t12 = claim_space(div1_nodes);
    			i3 = claim_element(div1_nodes, "I", { class: true });
    			children(i3).forEach(detach_dev);
    			t13 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t14 = claim_text(p1_nodes, t14_value);
    			p1_nodes.forEach(detach_dev);
    			t15 = claim_space(div1_nodes);
    			i4 = claim_element(div1_nodes, "I", { class: true });
    			children(i4).forEach(detach_dev);
    			t16 = claim_space(div1_nodes);
    			a1 = claim_element(div1_nodes, "A", { href: true, target: true, class: true });
    			var a1_nodes = children(a1);
    			t17 = claim_text(a1_nodes, t17_value);
    			a1_nodes.forEach(detach_dev);
    			t18 = claim_space(div1_nodes);
    			i5 = claim_element(div1_nodes, "I", { class: true });
    			children(i5).forEach(detach_dev);
    			t19 = claim_space(div1_nodes);
    			a2 = claim_element(div1_nodes, "A", { href: true, target: true, class: true });
    			var a2_nodes = children(a2);
    			t20 = claim_text(a2_nodes, t20_value);
    			a2_nodes.forEach(detach_dev);
    			t21 = claim_space(div1_nodes);
    			i6 = claim_element(div1_nodes, "I", { class: true });
    			children(i6).forEach(detach_dev);
    			t22 = claim_space(div1_nodes);
    			p2 = claim_element(div1_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t23 = claim_text(p2_nodes, t23_value);
    			p2_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			aside_nodes.forEach(detach_dev);
    			t24 = claim_space(section_nodes);
    			div2 = claim_element(section_nodes, "DIV", {});
    			var div2_nodes = children(div2);
    			h20 = claim_element(div2_nodes, "H2", { class: true });
    			var h20_nodes = children(h20);
    			t25 = claim_text(h20_nodes, "About Me");
    			h20_nodes.forEach(detach_dev);
    			t26 = claim_space(div2_nodes);
    			p3 = claim_element(div2_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			q = claim_element(p3_nodes, "Q", {});
    			var q_nodes = children(q);
    			t27 = claim_text(q_nodes, t27_value);
    			q_nodes.forEach(detach_dev);
    			p3_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t28 = claim_space(section_nodes);
    			div4 = claim_element(section_nodes, "DIV", {});
    			var div4_nodes = children(div4);
    			h21 = claim_element(div4_nodes, "H2", { class: true });
    			var h21_nodes = children(h21);
    			t29 = claim_text(h21_nodes, "Coding Languages");
    			h21_nodes.forEach(detach_dev);
    			t30 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].l(div3_nodes);
    			}

    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			t31 = claim_space(section_nodes);
    			div6 = claim_element(section_nodes, "DIV", {});
    			var div6_nodes = children(div6);
    			h22 = claim_element(div6_nodes, "H2", { class: true });
    			var h22_nodes = children(h22);
    			t32 = claim_text(h22_nodes, "Tech Stack");
    			h22_nodes.forEach(detach_dev);
    			t33 = claim_space(div6_nodes);
    			div5 = claim_element(div6_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].l(div5_nodes);
    			}

    			div5_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			t34 = claim_space(section_nodes);
    			div7 = claim_element(section_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			h31 = claim_element(div7_nodes, "H3", { class: true });
    			var h31_nodes = children(h31);
    			t35 = claim_text(h31_nodes, "Last updated on: ");
    			span = claim_element(h31_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t36 = claim_text(span_nodes, t36_value);
    			span_nodes.forEach(detach_dev);
    			h31_nodes.forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			section_nodes.forEach(detach_dev);
    			t37 = claim_space(main0_nodes);
    			article = claim_element(main0_nodes, "ARTICLE", { class: true });
    			var article_nodes = children(article);
    			div9 = claim_element(article_nodes, "DIV", {});
    			var div9_nodes = children(div9);
    			h23 = claim_element(div9_nodes, "H2", { class: true });
    			var h23_nodes = children(h23);
    			t38 = claim_text(h23_nodes, "Education");
    			h23_nodes.forEach(detach_dev);
    			t39 = claim_space(div9_nodes);
    			div8 = claim_element(div9_nodes, "DIV", { class: true });
    			var div8_nodes = children(div8);
    			h32 = claim_element(div8_nodes, "H3", { class: true });
    			var h32_nodes = children(h32);
    			t40 = claim_text(h32_nodes, t40_value);
    			h32_nodes.forEach(detach_dev);
    			t41 = claim_space(div8_nodes);
    			p4 = claim_element(div8_nodes, "P", { class: true });
    			var p4_nodes = children(p4);
    			t42 = claim_text(p4_nodes, "CGPA: ");
    			t43 = claim_text(p4_nodes, t43_value);
    			p4_nodes.forEach(detach_dev);
    			div8_nodes.forEach(detach_dev);
    			t44 = claim_space(div9_nodes);
    			p5 = claim_element(div9_nodes, "P", { class: true });
    			var p5_nodes = children(p5);
    			t45 = claim_text(p5_nodes, t45_value);
    			p5_nodes.forEach(detach_dev);
    			t46 = claim_space(div9_nodes);
    			p6 = claim_element(div9_nodes, "P", { class: true });
    			var p6_nodes = children(p6);
    			t47 = claim_text(p6_nodes, t47_value);
    			p6_nodes.forEach(detach_dev);
    			t48 = claim_space(div9_nodes);
    			ul = claim_element(div9_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div9_nodes.forEach(detach_dev);
    			t49 = claim_space(article_nodes);
    			div10 = claim_element(article_nodes, "DIV", {});
    			var div10_nodes = children(div10);
    			h24 = claim_element(div10_nodes, "H2", { class: true });
    			var h24_nodes = children(h24);
    			t50 = claim_text(h24_nodes, "Experience");
    			h24_nodes.forEach(detach_dev);
    			t51 = claim_space(div10_nodes);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div10_nodes);
    			}

    			div10_nodes.forEach(detach_dev);
    			t52 = claim_space(article_nodes);
    			div11 = claim_element(article_nodes, "DIV", {});
    			var div11_nodes = children(div11);
    			h25 = claim_element(div11_nodes, "H2", { class: true });
    			var h25_nodes = children(h25);
    			t53 = claim_text(h25_nodes, "Projects");
    			h25_nodes.forEach(detach_dev);
    			t54 = claim_space(div11_nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div11_nodes);
    			}

    			div11_nodes.forEach(detach_dev);
    			article_nodes.forEach(detach_dev);
    			main0_nodes.forEach(detach_dev);
    			div12_nodes.forEach(detach_dev);
    			main1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i0, "class", "fas fa-print mr-3");
    			add_location(i0, file$d, 35, 9, 1018);
    			attr_dev(button, "class", "px-4 py-1 font-bold font-mono border-blue-400 border bg-blue-200 hover:bg-blue-300 rounded-none");
    			add_location(button, file$d, 32, 6, 846);
    			attr_dev(div0, "class", "mb-5");
    			add_location(div0, file$d, 23, 4, 495);
    			attr_dev(h1, "class", "text-gray-700 text-5xl font-extrabold mb-1");
    			attr_dev(h1, "fstyle", "font-size: 2.5rem; line-height: 1");
    			add_location(h1, file$d, 44, 10, 1316);
    			attr_dev(h30, "class", "" + (null_to_empty(`text-${primary} font-semibold text-lg mb-3 leading-5`) + " svelte-fue1fc"));
    			add_location(h30, file$d, 50, 10, 1508);
    			attr_dev(i1, "class", "text-gray-700 text-center fas fa-phone");
    			add_location(i1, file$d, 54, 12, 1682);
    			attr_dev(p0, "class", "text-gray-700 text-sm");
    			add_location(p0, file$d, 55, 12, 1748);
    			attr_dev(i2, "class", "text-gray-700 text-center fas fa-globe");
    			add_location(i2, file$d, 57, 12, 1821);
    			attr_dev(a0, "href", resume.website.url);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "text-gray-700 text-sm svelte-fue1fc");
    			add_location(a0, file$d, 58, 12, 1887);
    			attr_dev(i3, "class", "text-gray-700 text-center fas fa-envelope");
    			add_location(i3, file$d, 64, 12, 2063);
    			attr_dev(p1, "class", "text-gray-700 text-sm cursor-pointer");
    			add_location(p1, file$d, 65, 12, 2132);
    			attr_dev(i4, "class", "text-gray-700 text-center fab fa-linkedin");
    			add_location(i4, file$d, 71, 12, 2343);
    			attr_dev(a1, "href", resume.linkedIn.url);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "text-gray-700 text-sm svelte-fue1fc");
    			add_location(a1, file$d, 72, 12, 2412);
    			attr_dev(i5, "class", "text-gray-700 text-center fab fa-github");
    			add_location(i5, file$d, 77, 12, 2588);
    			attr_dev(a2, "href", resume.github.url);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "text-gray-700 text-sm svelte-fue1fc");
    			add_location(a2, file$d, 78, 12, 2655);
    			attr_dev(i6, "class", "text-gray-700 text-center fas fa-map-marker-alt");
    			add_location(i6, file$d, 83, 12, 2827);
    			attr_dev(p2, "class", "text-gray-700 text-sm");
    			add_location(p2, file$d, 84, 12, 2902);
    			attr_dev(div1, "class", "grid info items-center svelte-fue1fc");
    			add_location(div1, file$d, 53, 10, 1632);
    			attr_dev(aside, "class", "" + (null_to_empty(`bg-${light} px-5 pt-5 pb-6 border-${primary} border-t-4`) + " svelte-fue1fc"));
    			add_location(aside, file$d, 41, 8, 1210);
    			attr_dev(h20, "class", "" + (null_to_empty(`text-${primary} bg-${light} w-full border-${primary} pl-4 py-1 border-l-4 font-semibold text-xl mb-2`) + " svelte-fue1fc"));
    			add_location(h20, file$d, 89, 10, 3021);
    			add_location(q, file$d, 95, 12, 3264);
    			attr_dev(p3, "class", "text-gray-600 text-sm pl-1");
    			add_location(p3, file$d, 94, 10, 3212);
    			add_location(div2, file$d, 88, 8, 3004);
    			attr_dev(h21, "class", "" + (null_to_empty(`text-${primary} bg-${light} w-full border-${primary} pl-4 py-1 border-l-4 font-semibold text-xl mb-2`) + " svelte-fue1fc"));
    			add_location(h21, file$d, 100, 10, 3346);
    			attr_dev(div3, "class", "tags flex flex-wrap justify-start svelte-fue1fc");
    			add_location(div3, file$d, 105, 10, 3545);
    			add_location(div4, file$d, 99, 8, 3329);
    			attr_dev(h22, "class", "" + (null_to_empty(`text-${primary} bg-${light} w-full border-${primary} pl-4 py-1 border-l-4 font-semibold text-xl mb-2`) + " svelte-fue1fc"));
    			add_location(h22, file$d, 117, 10, 3913);
    			attr_dev(div5, "class", "tags flex flex-wrap justify-start svelte-fue1fc");
    			add_location(div5, file$d, 122, 10, 4106);
    			add_location(div6, file$d, 116, 8, 3896);
    			attr_dev(span, "class", "italic font-semibold");
    			add_location(span, file$d, 137, 29, 4625);
    			attr_dev(h31, "class", "" + (null_to_empty(`text-${primary} text-sm`) + " svelte-fue1fc"));
    			add_location(h31, file$d, 136, 10, 4556);
    			attr_dev(div7, "class", "" + (null_to_empty(`bg-${light} border-${primary} border-b-4 px-5 pt-1.5 pb-1.5 w-full`) + " svelte-fue1fc"));
    			add_location(div7, file$d, 133, 8, 4441);
    			attr_dev(section, "class", "sidebar flex flex-col justify-between gap-2 svelte-fue1fc");
    			add_location(section, file$d, 40, 6, 1139);
    			attr_dev(h23, "class", "" + (null_to_empty(`text-${primary} bg-${light} w-full border-${primary} pl-4 py-1 border-l-4 font-semibold text-xl mb-2`) + " svelte-fue1fc"));
    			add_location(h23, file$d, 148, 10, 4900);
    			attr_dev(h32, "class", "text-gray-700 text-md font-bold");
    			add_location(h32, file$d, 155, 12, 5162);
    			attr_dev(p4, "class", "text-xs text-gray-700 font-semibold");
    			add_location(p4, file$d, 158, 12, 5280);
    			attr_dev(div8, "class", "flex justify-between items-baseline mb-0");
    			add_location(div8, file$d, 154, 10, 5094);
    			attr_dev(p5, "class", "text-sm text-gray-400 float-right text-right");
    			add_location(p5, file$d, 163, 10, 5422);
    			attr_dev(p6, "class", "text-sm text-gray-400 mb-0.5 italic");
    			add_location(p6, file$d, 166, 10, 5547);
    			attr_dev(ul, "class", "list-square text-gray-700 pl-5 text-xs");
    			add_location(ul, file$d, 170, 10, 5662);
    			add_location(div9, file$d, 147, 8, 4883);
    			attr_dev(h24, "class", "" + (null_to_empty(`text-${primary} bg-${light} w-full border-${primary} pl-4 py-1 border-l-4 font-semibold text-xl mb-2`) + " svelte-fue1fc"));
    			add_location(h24, file$d, 181, 10, 5989);
    			add_location(div10, file$d, 180, 8, 5972);
    			attr_dev(h25, "class", "" + (null_to_empty(`text-${primary} bg-${light} w-full border-${primary} pl-4 py-1 border-l-4 font-semibold text-xl mb-2`) + " svelte-fue1fc"));
    			add_location(h25, file$d, 212, 10, 6995);
    			add_location(div11, file$d, 211, 8, 6978);
    			attr_dev(article, "class", "content flex flex-col justify-between gap-2 svelte-fue1fc");
    			add_location(article, file$d, 146, 6, 4812);
    			attr_dev(main0, "class", "resume bg-white shadow-xl svelte-fue1fc");
    			add_location(main0, file$d, 39, 4, 1091);
    			attr_dev(div12, "class", "m-auto");
    			add_location(div12, file$d, 22, 2, 469);
    			attr_dev(main1, "class", "bg-gray-500 dark:bg-gray-700 pt-32 pb-20 overflow-auto flex");
    			add_location(main1, file$d, 21, 0, 391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main1, anchor);
    			append_dev(main1, div12);
    			append_dev(div12, div0);
    			mount_component(link, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, button);
    			append_dev(button, i0);
    			append_dev(button, t1);
    			append_dev(div12, t2);
    			append_dev(div12, main0);
    			append_dev(main0, section);
    			append_dev(section, aside);
    			append_dev(aside, h1);
    			append_dev(h1, t3);
    			append_dev(aside, t4);
    			append_dev(aside, h30);
    			append_dev(h30, t5);
    			append_dev(aside, t6);
    			append_dev(aside, div1);
    			append_dev(div1, i1);
    			append_dev(div1, t7);
    			append_dev(div1, p0);
    			append_dev(p0, t8);
    			append_dev(div1, t9);
    			append_dev(div1, i2);
    			append_dev(div1, t10);
    			append_dev(div1, a0);
    			append_dev(a0, t11);
    			append_dev(div1, t12);
    			append_dev(div1, i3);
    			append_dev(div1, t13);
    			append_dev(div1, p1);
    			append_dev(p1, t14);
    			append_dev(div1, t15);
    			append_dev(div1, i4);
    			append_dev(div1, t16);
    			append_dev(div1, a1);
    			append_dev(a1, t17);
    			append_dev(div1, t18);
    			append_dev(div1, i5);
    			append_dev(div1, t19);
    			append_dev(div1, a2);
    			append_dev(a2, t20);
    			append_dev(div1, t21);
    			append_dev(div1, i6);
    			append_dev(div1, t22);
    			append_dev(div1, p2);
    			append_dev(p2, t23);
    			append_dev(section, t24);
    			append_dev(section, div2);
    			append_dev(div2, h20);
    			append_dev(h20, t25);
    			append_dev(div2, t26);
    			append_dev(div2, p3);
    			append_dev(p3, q);
    			append_dev(q, t27);
    			append_dev(section, t28);
    			append_dev(section, div4);
    			append_dev(div4, h21);
    			append_dev(h21, t29);
    			append_dev(div4, t30);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div3, null);
    			}

    			append_dev(section, t31);
    			append_dev(section, div6);
    			append_dev(div6, h22);
    			append_dev(h22, t32);
    			append_dev(div6, t33);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div5, null);
    			}

    			append_dev(section, t34);
    			append_dev(section, div7);
    			append_dev(div7, h31);
    			append_dev(h31, t35);
    			append_dev(h31, span);
    			append_dev(span, t36);
    			append_dev(main0, t37);
    			append_dev(main0, article);
    			append_dev(article, div9);
    			append_dev(div9, h23);
    			append_dev(h23, t38);
    			append_dev(div9, t39);
    			append_dev(div9, div8);
    			append_dev(div8, h32);
    			append_dev(h32, t40);
    			append_dev(div8, t41);
    			append_dev(div8, p4);
    			append_dev(p4, t42);
    			append_dev(p4, t43);
    			append_dev(div9, t44);
    			append_dev(div9, p5);
    			append_dev(p5, t45);
    			append_dev(div9, t46);
    			append_dev(div9, p6);
    			append_dev(p6, t47);
    			append_dev(div9, t48);
    			append_dev(div9, ul);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul, null);
    			}

    			append_dev(article, t49);
    			append_dev(article, div10);
    			append_dev(div10, h24);
    			append_dev(h24, t50);
    			append_dev(div10, t51);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div10, null);
    			}

    			append_dev(article, t52);
    			append_dev(article, div11);
    			append_dev(div11, h25);
    			append_dev(h25, t53);
    			append_dev(div11, t54);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div11, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false),
    					listen_dev(p1, "click", /*click_handler_1*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);

    			if (dirty & /*primary, resume*/ 0) {
    				each_value_6 = resume.codingLanguages;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_6(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_6.length;
    			}

    			if (dirty & /*primary, resume*/ 0) {
    				each_value_5 = resume.techStack;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_5(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_5.length;
    			}

    			if (dirty & /*resume*/ 0) {
    				each_value_4 = resume.education.courses;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_4(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_4.length;
    			}

    			if (dirty & /*resume*/ 0) {
    				each_value_2 = resume.experiences;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div10, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*resume*/ 0) {
    				each_value = resume.projects;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div11, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main1);
    			destroy_component(link);
    			destroy_each(each_blocks_4, detaching);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const primary = "teal-600";
    const light = "teal-50";

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Resume", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Resume> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.print();
    	const click_handler_1 = () => copyToClipboard(resume.email.url);

    	$$self.$capture_state = () => ({
    		Link,
    		copyToClipboard,
    		resume,
    		primary,
    		light
    	});

    	return [click_handler, click_handler_1];
    }

    class Resume extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resume",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\pages\FunFacts.svelte generated by Svelte v3.31.2 */
    const file$e = "src\\pages\\FunFacts.svelte";

    function create_fragment$g(ctx) {
    	let main;
    	let section;
    	let h1;
    	let t0;
    	let t1;
    	let p;
    	let t2;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			h1 = element("h1");
    			t0 = text("Fun facts and hobbies");
    			t1 = space();
    			p = element("p");
    			t2 = text("coming soon");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			section = claim_element(main_nodes, "SECTION", { class: true });
    			var section_nodes = children(section);
    			h1 = claim_element(section_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Fun facts and hobbies");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(section_nodes);
    			p = claim_element(section_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t2 = claim_text(p_nodes, "coming soon");
    			p_nodes.forEach(detach_dev);
    			section_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "title mb-2");
    			add_location(h1, file$e, 7, 4, 150);
    			attr_dev(p, "class", "subtitle");
    			add_location(p, file$e, 8, 4, 205);
    			attr_dev(section, "class", "section");
    			add_location(section, file$e, 5, 2, 117);
    			attr_dev(main, "class", "main bg-gray-50 dark:bg-gray-700");
    			add_location(main, file$e, 4, 0, 66);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, h1);
    			append_dev(h1, t0);
    			append_dev(section, t1);
    			append_dev(section, p);
    			append_dev(p, t2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FunFacts", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FunFacts> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link });
    	return [];
    }

    class FunFacts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FunFacts",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var marked = createCommonjsModule(function (module, exports) {
    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2021, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }

      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;

        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

        return arr2;
      }

      function _createForOfIteratorHelperLoose(o, allowArrayLike) {
        var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
        if (it) return (it = it.call(o)).next.bind(it);

        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
          if (it) o = it;
          var i = 0;
          return function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          };
        }

        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }

      var defaults$5 = {exports: {}};

      function getDefaults$1() {
        return {
          baseUrl: null,
          breaks: false,
          extensions: null,
          gfm: true,
          headerIds: true,
          headerPrefix: '',
          highlight: null,
          langPrefix: 'language-',
          mangle: true,
          pedantic: false,
          renderer: null,
          sanitize: false,
          sanitizer: null,
          silent: false,
          smartLists: false,
          smartypants: false,
          tokenizer: null,
          walkTokens: null,
          xhtml: false
        };
      }

      function changeDefaults$1(newDefaults) {
        defaults$5.exports.defaults = newDefaults;
      }

      defaults$5.exports = {
        defaults: getDefaults$1(),
        getDefaults: getDefaults$1,
        changeDefaults: changeDefaults$1
      };

      /**
       * Helpers
       */
      var escapeTest = /[&<>"']/;
      var escapeReplace = /[&<>"']/g;
      var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
      var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
      var escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      var getEscapeReplacement = function getEscapeReplacement(ch) {
        return escapeReplacements[ch];
      };

      function escape$2(html, encode) {
        if (encode) {
          if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
          }
        } else {
          if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
          }
        }

        return html;
      }

      var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

      function unescape$1(html) {
        // explicitly match decimal, hex, and named HTML entities
        return html.replace(unescapeTest, function (_, n) {
          n = n.toLowerCase();
          if (n === 'colon') return ':';

          if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
          }

          return '';
        });
      }

      var caret = /(^|[^\[])\^/g;

      function edit$1(regex, opt) {
        regex = regex.source || regex;
        opt = opt || '';
        var obj = {
          replace: function replace(name, val) {
            val = val.source || val;
            val = val.replace(caret, '$1');
            regex = regex.replace(name, val);
            return obj;
          },
          getRegex: function getRegex() {
            return new RegExp(regex, opt);
          }
        };
        return obj;
      }

      var nonWordAndColonTest = /[^\w:]/g;
      var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

      function cleanUrl$1(sanitize, base, href) {
        if (sanitize) {
          var prot;

          try {
            prot = decodeURIComponent(unescape$1(href)).replace(nonWordAndColonTest, '').toLowerCase();
          } catch (e) {
            return null;
          }

          if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
          }
        }

        if (base && !originIndependentUrl.test(href)) {
          href = resolveUrl(base, href);
        }

        try {
          href = encodeURI(href).replace(/%25/g, '%');
        } catch (e) {
          return null;
        }

        return href;
      }

      var baseUrls = {};
      var justDomain = /^[^:]+:\/*[^/]*$/;
      var protocol = /^([^:]+:)[\s\S]*$/;
      var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

      function resolveUrl(base, href) {
        if (!baseUrls[' ' + base]) {
          // we can ignore everything in base after the last slash of its path component,
          // but we might need to add _that_
          // https://tools.ietf.org/html/rfc3986#section-3
          if (justDomain.test(base)) {
            baseUrls[' ' + base] = base + '/';
          } else {
            baseUrls[' ' + base] = rtrim$1(base, '/', true);
          }
        }

        base = baseUrls[' ' + base];
        var relativeBase = base.indexOf(':') === -1;

        if (href.substring(0, 2) === '//') {
          if (relativeBase) {
            return href;
          }

          return base.replace(protocol, '$1') + href;
        } else if (href.charAt(0) === '/') {
          if (relativeBase) {
            return href;
          }

          return base.replace(domain, '$1') + href;
        } else {
          return base + href;
        }
      }

      var noopTest$1 = {
        exec: function noopTest() {}
      };

      function merge$2(obj) {
        var i = 1,
            target,
            key;

        for (; i < arguments.length; i++) {
          target = arguments[i];

          for (key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
              obj[key] = target[key];
            }
          }
        }

        return obj;
      }

      function splitCells$1(tableRow, count) {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row = tableRow.replace(/\|/g, function (match, offset, str) {
          var escaped = false,
              curr = offset;

          while (--curr >= 0 && str[curr] === '\\') {
            escaped = !escaped;
          }

          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
            cells = row.split(/ \|/);
        var i = 0; // First/last cell in a row cannot be empty if it has no leading/trailing pipe

        if (!cells[0].trim()) {
          cells.shift();
        }

        if (!cells[cells.length - 1].trim()) {
          cells.pop();
        }

        if (cells.length > count) {
          cells.splice(count);
        } else {
          while (cells.length < count) {
            cells.push('');
          }
        }

        for (; i < cells.length; i++) {
          // leading or trailing whitespace is ignored per the gfm spec
          cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }

        return cells;
      } // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
      // /c*$/ is vulnerable to REDOS.
      // invert: Remove suffix of non-c chars instead. Default falsey.


      function rtrim$1(str, c, invert) {
        var l = str.length;

        if (l === 0) {
          return '';
        } // Length of suffix matching the invert condition.


        var suffLen = 0; // Step left until we fail to match the invert condition.

        while (suffLen < l) {
          var currChar = str.charAt(l - suffLen - 1);

          if (currChar === c && !invert) {
            suffLen++;
          } else if (currChar !== c && invert) {
            suffLen++;
          } else {
            break;
          }
        }

        return str.substr(0, l - suffLen);
      }

      function findClosingBracket$1(str, b) {
        if (str.indexOf(b[1]) === -1) {
          return -1;
        }

        var l = str.length;
        var level = 0,
            i = 0;

        for (; i < l; i++) {
          if (str[i] === '\\') {
            i++;
          } else if (str[i] === b[0]) {
            level++;
          } else if (str[i] === b[1]) {
            level--;

            if (level < 0) {
              return i;
            }
          }
        }

        return -1;
      }

      function checkSanitizeDeprecation$1(opt) {
        if (opt && opt.sanitize && !opt.silent) {
          console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
        }
      } // copied from https://stackoverflow.com/a/5450113/806777


      function repeatString$1(pattern, count) {
        if (count < 1) {
          return '';
        }

        var result = '';

        while (count > 1) {
          if (count & 1) {
            result += pattern;
          }

          count >>= 1;
          pattern += pattern;
        }

        return result + pattern;
      }

      var helpers = {
        escape: escape$2,
        unescape: unescape$1,
        edit: edit$1,
        cleanUrl: cleanUrl$1,
        resolveUrl: resolveUrl,
        noopTest: noopTest$1,
        merge: merge$2,
        splitCells: splitCells$1,
        rtrim: rtrim$1,
        findClosingBracket: findClosingBracket$1,
        checkSanitizeDeprecation: checkSanitizeDeprecation$1,
        repeatString: repeatString$1
      };

      var defaults$4 = defaults$5.exports.defaults;
      var rtrim = helpers.rtrim,
          splitCells = helpers.splitCells,
          _escape = helpers.escape,
          findClosingBracket = helpers.findClosingBracket;

      function outputLink(cap, link, raw, lexer) {
        var href = link.href;
        var title = link.title ? _escape(link.title) : null;
        var text = cap[1].replace(/\\([\[\]])/g, '$1');

        if (cap[0].charAt(0) !== '!') {
          lexer.state.inLink = true;
          var token = {
            type: 'link',
            raw: raw,
            href: href,
            title: title,
            text: text,
            tokens: lexer.inlineTokens(text, [])
          };
          lexer.state.inLink = false;
          return token;
        } else {
          return {
            type: 'image',
            raw: raw,
            href: href,
            title: title,
            text: _escape(text)
          };
        }
      }

      function indentCodeCompensation(raw, text) {
        var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

        if (matchIndentToCode === null) {
          return text;
        }

        var indentToCode = matchIndentToCode[1];
        return text.split('\n').map(function (node) {
          var matchIndentInNode = node.match(/^\s+/);

          if (matchIndentInNode === null) {
            return node;
          }

          var indentInNode = matchIndentInNode[0];

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        }).join('\n');
      }
      /**
       * Tokenizer
       */


      var Tokenizer_1 = /*#__PURE__*/function () {
        function Tokenizer(options) {
          this.options = options || defaults$4;
        }

        var _proto = Tokenizer.prototype;

        _proto.space = function space(src) {
          var cap = this.rules.block.newline.exec(src);

          if (cap) {
            if (cap[0].length > 1) {
              return {
                type: 'space',
                raw: cap[0]
              };
            }

            return {
              raw: '\n'
            };
          }
        };

        _proto.code = function code(src) {
          var cap = this.rules.block.code.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ {1,4}/gm, '');
            return {
              type: 'code',
              raw: cap[0],
              codeBlockStyle: 'indented',
              text: !this.options.pedantic ? rtrim(text, '\n') : text
            };
          }
        };

        _proto.fences = function fences(src) {
          var cap = this.rules.block.fences.exec(src);

          if (cap) {
            var raw = cap[0];
            var text = indentCodeCompensation(raw, cap[3] || '');
            return {
              type: 'code',
              raw: raw,
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: text
            };
          }
        };

        _proto.heading = function heading(src) {
          var cap = this.rules.block.heading.exec(src);

          if (cap) {
            var text = cap[2].trim(); // remove trailing #s

            if (/#$/.test(text)) {
              var trimmed = rtrim(text, '#');

              if (this.options.pedantic) {
                text = trimmed.trim();
              } else if (!trimmed || / $/.test(trimmed)) {
                // CommonMark requires space before trailing #s
                text = trimmed.trim();
              }
            }

            var token = {
              type: 'heading',
              raw: cap[0],
              depth: cap[1].length,
              text: text,
              tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
          }
        };

        _proto.hr = function hr(src) {
          var cap = this.rules.block.hr.exec(src);

          if (cap) {
            return {
              type: 'hr',
              raw: cap[0]
            };
          }
        };

        _proto.blockquote = function blockquote(src) {
          var cap = this.rules.block.blockquote.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ *> ?/gm, '');
            return {
              type: 'blockquote',
              raw: cap[0],
              tokens: this.lexer.blockTokens(text, []),
              text: text
            };
          }
        };

        _proto.list = function list(src) {
          var cap = this.rules.block.list.exec(src);

          if (cap) {
            var raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine, line, lines, itemContents;
            var bull = cap[1].trim();
            var isordered = bull.length > 1;
            var list = {
              type: 'list',
              raw: '',
              ordered: isordered,
              start: isordered ? +bull.slice(0, -1) : '',
              loose: false,
              items: []
            };
            bull = isordered ? "\\d{1,9}\\" + bull.slice(-1) : "\\" + bull;

            if (this.options.pedantic) {
              bull = isordered ? bull : '[*+-]';
            } // Get next list item


            var itemRegex = new RegExp("^( {0,3}" + bull + ")((?: [^\\n]*| *)(?:\\n[^\\n]*)*(?:\\n|$))"); // Get each top-level item

            while (src) {
              if (this.rules.block.hr.test(src)) {
                // End list if we encounter an HR (possibly move into itemRegex?)
                break;
              }

              if (!(cap = itemRegex.exec(src))) {
                break;
              }

              lines = cap[2].split('\n');

              if (this.options.pedantic) {
                indent = 2;
                itemContents = lines[0].trimLeft();
              } else {
                indent = cap[2].search(/[^ ]/); // Find first non-space char

                indent = cap[1].length + (indent > 4 ? 1 : indent); // intented code blocks after 4 spaces; indent is always 1

                itemContents = lines[0].slice(indent - cap[1].length);
              }

              blankLine = false;
              raw = cap[0];

              if (!lines[0] && /^ *$/.test(lines[1])) {
                // items begin with at most one blank line
                raw = cap[1] + lines.slice(0, 2).join('\n') + '\n';
                list.loose = true;
                lines = [];
              }

              var nextBulletRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}(?:[*+-]|\\d{1,9}[.)])");

              for (i = 1; i < lines.length; i++) {
                line = lines[i];

                if (this.options.pedantic) {
                  // Re-align to follow commonmark nesting rules
                  line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
                } // End list item if found start of new bullet


                if (nextBulletRegex.test(line)) {
                  raw = cap[1] + lines.slice(0, i).join('\n') + '\n';
                  break;
                } // Until we encounter a blank line, item contents do not need indentation


                if (!blankLine) {
                  if (!line.trim()) {
                    // Check if current line is empty
                    blankLine = true;
                  } // Dedent if possible


                  if (line.search(/[^ ]/) >= indent) {
                    itemContents += '\n' + line.slice(indent);
                  } else {
                    itemContents += '\n' + line;
                  }

                  continue;
                } // Dedent this line


                if (line.search(/[^ ]/) >= indent || !line.trim()) {
                  itemContents += '\n' + line.slice(indent);
                  continue;
                } else {
                  // Line was not properly indented; end of this item
                  raw = cap[1] + lines.slice(0, i).join('\n') + '\n';
                  break;
                }
              }

              if (!list.loose) {
                // If the previous item ended with a blank line, the list is loose
                if (endsWithBlankLine) {
                  list.loose = true;
                } else if (/\n *\n *$/.test(raw)) {
                  endsWithBlankLine = true;
                }
              } // Check for task list items


              if (this.options.gfm) {
                istask = /^\[[ xX]\] /.exec(itemContents);

                if (istask) {
                  ischecked = istask[0] !== '[ ] ';
                  itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
                }
              }

              list.items.push({
                type: 'list_item',
                raw: raw,
                task: !!istask,
                checked: ischecked,
                loose: false,
                text: itemContents
              });
              list.raw += raw;
              src = src.slice(raw.length);
            } // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic


            list.items[list.items.length - 1].raw = raw.trimRight();
            list.items[list.items.length - 1].text = itemContents.trimRight();
            list.raw = list.raw.trimRight();
            var l = list.items.length; // Item child tokens handled here at end because we needed to have the final item to trim it first

            for (i = 0; i < l; i++) {
              this.lexer.state.top = false;
              list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);

              if (list.items[i].tokens.some(function (t) {
                return t.type === 'space';
              })) {
                list.loose = true;
                list.items[i].loose = true;
              }
            }

            return list;
          }
        };

        _proto.html = function html(src) {
          var cap = this.rules.block.html.exec(src);

          if (cap) {
            var token = {
              type: 'html',
              raw: cap[0],
              pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: cap[0]
            };

            if (this.options.sanitize) {
              token.type = 'paragraph';
              token.text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]);
              token.tokens = [];
              this.lexer.inline(token.text, token.tokens);
            }

            return token;
          }
        };

        _proto.def = function def(src) {
          var cap = this.rules.block.def.exec(src);

          if (cap) {
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            return {
              type: 'def',
              tag: tag,
              raw: cap[0],
              href: cap[2],
              title: cap[3]
            };
          }
        };

        _proto.table = function table(src) {
          var cap = this.rules.block.table.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells(cap[1]).map(function (c) {
                return {
                  text: c
                };
              }),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              rows: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              item.raw = cap[0];
              var l = item.align.length;
              var i, j, k, row;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.rows.length;

              for (i = 0; i < l; i++) {
                item.rows[i] = splitCells(item.rows[i], item.header.length).map(function (c) {
                  return {
                    text: c
                  };
                });
              } // parse child tokens inside headers and cells
              // header child tokens


              l = item.header.length;

              for (j = 0; j < l; j++) {
                item.header[j].tokens = [];
                this.lexer.inlineTokens(item.header[j].text, item.header[j].tokens);
              } // cell child tokens


              l = item.rows.length;

              for (j = 0; j < l; j++) {
                row = item.rows[j];

                for (k = 0; k < row.length; k++) {
                  row[k].tokens = [];
                  this.lexer.inlineTokens(row[k].text, row[k].tokens);
                }
              }

              return item;
            }
          }
        };

        _proto.lheading = function lheading(src) {
          var cap = this.rules.block.lheading.exec(src);

          if (cap) {
            var token = {
              type: 'heading',
              raw: cap[0],
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1],
              tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
          }
        };

        _proto.paragraph = function paragraph(src) {
          var cap = this.rules.block.paragraph.exec(src);

          if (cap) {
            var token = {
              type: 'paragraph',
              raw: cap[0],
              text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1],
              tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
          }
        };

        _proto.text = function text(src) {
          var cap = this.rules.block.text.exec(src);

          if (cap) {
            var token = {
              type: 'text',
              raw: cap[0],
              text: cap[0],
              tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
          }
        };

        _proto.escape = function escape(src) {
          var cap = this.rules.inline.escape.exec(src);

          if (cap) {
            return {
              type: 'escape',
              raw: cap[0],
              text: _escape(cap[1])
            };
          }
        };

        _proto.tag = function tag(src) {
          var cap = this.rules.inline.tag.exec(src);

          if (cap) {
            if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
              this.lexer.state.inLink = true;
            } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
              this.lexer.state.inLink = false;
            }

            if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.lexer.state.inRawBlock = true;
            } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.lexer.state.inRawBlock = false;
            }

            return {
              type: this.options.sanitize ? 'text' : 'html',
              raw: cap[0],
              inLink: this.lexer.state.inLink,
              inRawBlock: this.lexer.state.inRawBlock,
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.link = function link(src) {
          var cap = this.rules.inline.link.exec(src);

          if (cap) {
            var trimmedUrl = cap[2].trim();

            if (!this.options.pedantic && /^</.test(trimmedUrl)) {
              // commonmark requires matching angle brackets
              if (!/>$/.test(trimmedUrl)) {
                return;
              } // ending angle bracket cannot be escaped


              var rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');

              if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
                return;
              }
            } else {
              // find closing parenthesis
              var lastParenIndex = findClosingBracket(cap[2], '()');

              if (lastParenIndex > -1) {
                var start = cap[0].indexOf('!') === 0 ? 5 : 4;
                var linkLen = start + cap[1].length + lastParenIndex;
                cap[2] = cap[2].substring(0, lastParenIndex);
                cap[0] = cap[0].substring(0, linkLen).trim();
                cap[3] = '';
              }
            }

            var href = cap[2];
            var title = '';

            if (this.options.pedantic) {
              // split pedantic href and title
              var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }

            href = href.trim();

            if (/^</.test(href)) {
              if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
                // pedantic allows starting angle bracket without ending angle bracket
                href = href.slice(1);
              } else {
                href = href.slice(1, -1);
              }
            }

            return outputLink(cap, {
              href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
              title: title ? title.replace(this.rules.inline._escapes, '$1') : title
            }, cap[0], this.lexer);
          }
        };

        _proto.reflink = function reflink(src, links) {
          var cap;

          if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
            var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = links[link.toLowerCase()];

            if (!link || !link.href) {
              var text = cap[0].charAt(0);
              return {
                type: 'text',
                raw: text,
                text: text
              };
            }

            return outputLink(cap, link, cap[0], this.lexer);
          }
        };

        _proto.emStrong = function emStrong(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.emStrong.lDelim.exec(src);
          if (!match) return; // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well

          if (match[3] && prevChar.match(/(?:[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/)) return;
          var nextChar = match[1] || match[2] || '';

          if (!nextChar || nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar))) {
            var lLength = match[0].length - 1;
            var rDelim,
                rLength,
                delimTotal = lLength,
                midDelimTotal = 0;
            var endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
            endReg.lastIndex = 0; // Clip maskedSrc to same section of string as src (move to lexer?)

            maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

            while ((match = endReg.exec(maskedSrc)) != null) {
              rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
              if (!rDelim) continue; // skip single * in __abc*abc__

              rLength = rDelim.length;

              if (match[3] || match[4]) {
                // found another Left Delim
                delimTotal += rLength;
                continue;
              } else if (match[5] || match[6]) {
                // either Left or Right Delim
                if (lLength % 3 && !((lLength + rLength) % 3)) {
                  midDelimTotal += rLength;
                  continue; // CommonMark Emphasis Rules 9-10
                }
              }

              delimTotal -= rLength;
              if (delimTotal > 0) continue; // Haven't found enough closing delimiters
              // Remove extra characters. *a*** -> *a*

              rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal); // Create `em` if smallest delimiter has odd char count. *a***

              if (Math.min(lLength, rLength) % 2) {
                var _text = src.slice(1, lLength + match.index + rLength);

                return {
                  type: 'em',
                  raw: src.slice(0, lLength + match.index + rLength + 1),
                  text: _text,
                  tokens: this.lexer.inlineTokens(_text, [])
                };
              } // Create 'strong' if smallest delimiter has even char count. **a***


              var text = src.slice(2, lLength + match.index + rLength - 1);
              return {
                type: 'strong',
                raw: src.slice(0, lLength + match.index + rLength + 1),
                text: text,
                tokens: this.lexer.inlineTokens(text, [])
              };
            }
          }
        };

        _proto.codespan = function codespan(src) {
          var cap = this.rules.inline.code.exec(src);

          if (cap) {
            var text = cap[2].replace(/\n/g, ' ');
            var hasNonSpaceChars = /[^ ]/.test(text);
            var hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);

            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
              text = text.substring(1, text.length - 1);
            }

            text = _escape(text, true);
            return {
              type: 'codespan',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.br = function br(src) {
          var cap = this.rules.inline.br.exec(src);

          if (cap) {
            return {
              type: 'br',
              raw: cap[0]
            };
          }
        };

        _proto.del = function del(src) {
          var cap = this.rules.inline.del.exec(src);

          if (cap) {
            return {
              type: 'del',
              raw: cap[0],
              text: cap[2],
              tokens: this.lexer.inlineTokens(cap[2], [])
            };
          }
        };

        _proto.autolink = function autolink(src, mangle) {
          var cap = this.rules.inline.autolink.exec(src);

          if (cap) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
              href = 'mailto:' + text;
            } else {
              text = _escape(cap[1]);
              href = text;
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.url = function url(src, mangle) {
          var cap;

          if (cap = this.rules.inline.url.exec(src)) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              var prevCapZero;

              do {
                prevCapZero = cap[0];
                cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);

              text = _escape(cap[0]);

              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.inlineText = function inlineText(src, smartypants) {
          var cap = this.rules.inline.text.exec(src);

          if (cap) {
            var text;

            if (this.lexer.state.inRawBlock) {
              text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0];
            } else {
              text = _escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
            }

            return {
              type: 'text',
              raw: cap[0],
              text: text
            };
          }
        };

        return Tokenizer;
      }();

      var noopTest = helpers.noopTest,
          edit = helpers.edit,
          merge$1 = helpers.merge;
      /**
       * Block-Level Grammar
       */

      var block$1 = {
        newline: /^(?: *(?:\n|$))+/,
        code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
        fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
        hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
        heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
        blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
        list: /^( {0,3}bull)( [^\n]+?)?(?:\n|$)/,
        html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
        + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
        + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
        + ')',
        def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
        table: noopTest,
        lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
        // regex template, placeholders will be replaced according to different paragraph
        // interruption rules of commonmark and the original markdown spec:
        _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
        text: /^[^\n]+/
      };
      block$1._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
      block$1._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
      block$1.def = edit(block$1.def).replace('label', block$1._label).replace('title', block$1._title).getRegex();
      block$1.bullet = /(?:[*+-]|\d{1,9}[.)])/;
      block$1.listItemStart = edit(/^( *)(bull) */).replace('bull', block$1.bullet).getRegex();
      block$1.list = edit(block$1.list).replace(/bull/g, block$1.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block$1.def.source + ')').getRegex();
      block$1._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
      block$1._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
      block$1.html = edit(block$1.html, 'i').replace('comment', block$1._comment).replace('tag', block$1._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
      block$1.paragraph = edit(block$1._paragraph).replace('hr', block$1.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block$1._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
      block$1.blockquote = edit(block$1.blockquote).replace('paragraph', block$1.paragraph).getRegex();
      /**
       * Normal Block Grammar
       */

      block$1.normal = merge$1({}, block$1);
      /**
       * GFM Block Grammar
       */

      block$1.gfm = merge$1({}, block$1.normal, {
        table: '^ *([^\\n ].*\\|.*)\\n' // Header
        + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)\\|?' // Align
        + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

      });
      block$1.gfm.table = edit(block$1.gfm.table).replace('hr', block$1.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block$1._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      /**
       * Pedantic grammar (original John Gruber's loose markdown specification)
       */

      block$1.pedantic = merge$1({}, block$1.normal, {
        html: edit('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block$1._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: noopTest,
        // fences not supported
        paragraph: edit(block$1.normal._paragraph).replace('hr', block$1.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block$1.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
      });
      /**
       * Inline-Level Grammar
       */

      var inline$1 = {
        escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
        autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
        url: noopTest,
        tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
        // CDATA section
        link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
        reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
        nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
        reflinkSearch: 'reflink|nolink(?!\\()',
        emStrong: {
          lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
          //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
          //        () Skip other delimiter (1) #***                   (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
          rDelimAst: /\_\_[^_*]*?\*[^_*]*?\_\_|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
          rDelimUnd: /\*\*[^_*]*?\_[^_*]*?\*\*|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _

        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: noopTest,
        text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
        punctuation: /^([\spunctuation])/
      }; // list of punctuation marks from CommonMark spec
      // without * and _ to handle the different emphasis markers * and _

      inline$1._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
      inline$1.punctuation = edit(inline$1.punctuation).replace(/punctuation/g, inline$1._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

      inline$1.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
      inline$1.escapedEmSt = /\\\*|\\_/g;
      inline$1._comment = edit(block$1._comment).replace('(?:-->|$)', '-->').getRegex();
      inline$1.emStrong.lDelim = edit(inline$1.emStrong.lDelim).replace(/punct/g, inline$1._punctuation).getRegex();
      inline$1.emStrong.rDelimAst = edit(inline$1.emStrong.rDelimAst, 'g').replace(/punct/g, inline$1._punctuation).getRegex();
      inline$1.emStrong.rDelimUnd = edit(inline$1.emStrong.rDelimUnd, 'g').replace(/punct/g, inline$1._punctuation).getRegex();
      inline$1._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
      inline$1._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
      inline$1._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
      inline$1.autolink = edit(inline$1.autolink).replace('scheme', inline$1._scheme).replace('email', inline$1._email).getRegex();
      inline$1._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
      inline$1.tag = edit(inline$1.tag).replace('comment', inline$1._comment).replace('attribute', inline$1._attribute).getRegex();
      inline$1._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
      inline$1._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
      inline$1._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
      inline$1.link = edit(inline$1.link).replace('label', inline$1._label).replace('href', inline$1._href).replace('title', inline$1._title).getRegex();
      inline$1.reflink = edit(inline$1.reflink).replace('label', inline$1._label).getRegex();
      inline$1.reflinkSearch = edit(inline$1.reflinkSearch, 'g').replace('reflink', inline$1.reflink).replace('nolink', inline$1.nolink).getRegex();
      /**
       * Normal Inline Grammar
       */

      inline$1.normal = merge$1({}, inline$1);
      /**
       * Pedantic Inline Grammar
       */

      inline$1.pedantic = merge$1({}, inline$1.normal, {
        strong: {
          start: /^__|\*\*/,
          middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
          endAst: /\*\*(?!\*)/g,
          endUnd: /__(?!_)/g
        },
        em: {
          start: /^_|\*/,
          middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
          endAst: /\*(?!\*)/g,
          endUnd: /_(?!_)/g
        },
        link: edit(/^!?\[(label)\]\((.*?)\)/).replace('label', inline$1._label).getRegex(),
        reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline$1._label).getRegex()
      });
      /**
       * GFM Inline Grammar
       */

      inline$1.gfm = merge$1({}, inline$1.normal, {
        escape: edit(inline$1.escape).replace('])', '~|])').getRegex(),
        _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
        url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
      });
      inline$1.gfm.url = edit(inline$1.gfm.url, 'i').replace('email', inline$1.gfm._extended_email).getRegex();
      /**
       * GFM + Line Breaks Inline Grammar
       */

      inline$1.breaks = merge$1({}, inline$1.gfm, {
        br: edit(inline$1.br).replace('{2,}', '*').getRegex(),
        text: edit(inline$1.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
      });
      var rules = {
        block: block$1,
        inline: inline$1
      };

      var Tokenizer$1 = Tokenizer_1;
      var defaults$3 = defaults$5.exports.defaults;
      var block = rules.block,
          inline = rules.inline;
      var repeatString = helpers.repeatString;
      /**
       * smartypants text replacement
       */

      function smartypants(text) {
        return text // em-dashes
        .replace(/---/g, "\u2014") // en-dashes
        .replace(/--/g, "\u2013") // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
        .replace(/'/g, "\u2019") // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
        .replace(/"/g, "\u201D") // ellipses
        .replace(/\.{3}/g, "\u2026");
      }
      /**
       * mangle email addresses
       */


      function mangle(text) {
        var out = '',
            i,
            ch;
        var l = text.length;

        for (i = 0; i < l; i++) {
          ch = text.charCodeAt(i);

          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }

          out += '&#' + ch + ';';
        }

        return out;
      }
      /**
       * Block Lexer
       */


      var Lexer_1 = /*#__PURE__*/function () {
        function Lexer(options) {
          this.tokens = [];
          this.tokens.links = Object.create(null);
          this.options = options || defaults$3;
          this.options.tokenizer = this.options.tokenizer || new Tokenizer$1();
          this.tokenizer = this.options.tokenizer;
          this.tokenizer.options = this.options;
          this.tokenizer.lexer = this;
          this.inlineQueue = [];
          this.state = {
            inLink: false,
            inRawBlock: false,
            top: true
          };
          var rules = {
            block: block.normal,
            inline: inline.normal
          };

          if (this.options.pedantic) {
            rules.block = block.pedantic;
            rules.inline = inline.pedantic;
          } else if (this.options.gfm) {
            rules.block = block.gfm;

            if (this.options.breaks) {
              rules.inline = inline.breaks;
            } else {
              rules.inline = inline.gfm;
            }
          }

          this.tokenizer.rules = rules;
        }
        /**
         * Expose Rules
         */


        /**
         * Static Lex Method
         */
        Lexer.lex = function lex(src, options) {
          var lexer = new Lexer(options);
          return lexer.lex(src);
        }
        /**
         * Static Lex Inline Method
         */
        ;

        Lexer.lexInline = function lexInline(src, options) {
          var lexer = new Lexer(options);
          return lexer.inlineTokens(src);
        }
        /**
         * Preprocessing
         */
        ;

        var _proto = Lexer.prototype;

        _proto.lex = function lex(src) {
          src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ');
          this.blockTokens(src, this.tokens);
          var next;

          while (next = this.inlineQueue.shift()) {
            this.inlineTokens(next.src, next.tokens);
          }

          return this.tokens;
        }
        /**
         * Lexing
         */
        ;

        _proto.blockTokens = function blockTokens(src, tokens) {
          var _this = this;

          if (tokens === void 0) {
            tokens = [];
          }

          if (this.options.pedantic) {
            src = src.replace(/^ +$/gm, '');
          }

          var token, lastToken, cutSrc, lastParagraphClipped;

          while (src) {
            if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some(function (extTokenizer) {
              if (token = extTokenizer.call({
                lexer: _this
              }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }

              return false;
            })) {
              continue;
            } // newline


            if (token = this.tokenizer.space(src)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              }

              continue;
            } // code


            if (token = this.tokenizer.code(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

              if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // fences


            if (token = this.tokenizer.fences(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // heading


            if (token = this.tokenizer.heading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // hr


            if (token = this.tokenizer.hr(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // blockquote


            if (token = this.tokenizer.blockquote(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // list


            if (token = this.tokenizer.list(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // html


            if (token = this.tokenizer.html(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // def


            if (token = this.tokenizer.def(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.raw;
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else if (!this.tokens.links[token.tag]) {
                this.tokens.links[token.tag] = {
                  href: token.href,
                  title: token.title
                };
              }

              continue;
            } // table (gfm)


            if (token = this.tokenizer.table(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // lheading


            if (token = this.tokenizer.lheading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // top-level paragraph
            // prevent paragraph consuming extensions by clipping 'src' to extension start


            cutSrc = src;

            if (this.options.extensions && this.options.extensions.startBlock) {
              (function () {
                var startIndex = Infinity;
                var tempSrc = src.slice(1);
                var tempStart = void 0;

                _this.options.extensions.startBlock.forEach(function (getStartIndex) {
                  tempStart = getStartIndex.call({
                    lexer: this
                  }, tempSrc);

                  if (typeof tempStart === 'number' && tempStart >= 0) {
                    startIndex = Math.min(startIndex, tempStart);
                  }
                });

                if (startIndex < Infinity && startIndex >= 0) {
                  cutSrc = src.substring(0, startIndex + 1);
                }
              })();
            }

            if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
              lastToken = tokens[tokens.length - 1];

              if (lastParagraphClipped && lastToken.type === 'paragraph') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
                this.inlineQueue.pop();
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else {
                tokens.push(token);
              }

              lastParagraphClipped = cutSrc.length !== src.length;
              src = src.substring(token.raw.length);
              continue;
            } // text


            if (token = this.tokenizer.text(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
                this.inlineQueue.pop();
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else {
                tokens.push(token);
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          this.state.top = true;
          return tokens;
        };

        _proto.inline = function inline(src, tokens) {
          this.inlineQueue.push({
            src: src,
            tokens: tokens
          });
        }
        /**
         * Lexing/Compiling
         */
        ;

        _proto.inlineTokens = function inlineTokens(src, tokens) {
          var _this2 = this;

          if (tokens === void 0) {
            tokens = [];
          }

          var token, lastToken, cutSrc; // String with links masked to avoid interference with em and strong

          var maskedSrc = src;
          var match;
          var keepPrevChar, prevChar; // Mask out reflinks

          if (this.tokens.links) {
            var links = Object.keys(this.tokens.links);

            if (links.length > 0) {
              while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                  maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                }
              }
            }
          } // Mask out other blocks


          while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
          } // Mask out escaped em & strong delimiters


          while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
          }

          while (src) {
            if (!keepPrevChar) {
              prevChar = '';
            }

            keepPrevChar = false; // extensions

            if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some(function (extTokenizer) {
              if (token = extTokenizer.call({
                lexer: _this2
              }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }

              return false;
            })) {
              continue;
            } // escape


            if (token = this.tokenizer.escape(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // tag


            if (token = this.tokenizer.tag(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && token.type === 'text' && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // link


            if (token = this.tokenizer.link(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // reflink, nolink


            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && token.type === 'text' && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // em & strong


            if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // code


            if (token = this.tokenizer.codespan(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // br


            if (token = this.tokenizer.br(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // del (gfm)


            if (token = this.tokenizer.del(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // autolink


            if (token = this.tokenizer.autolink(src, mangle)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // url (gfm)


            if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text
            // prevent inlineText consuming extensions by clipping 'src' to extension start


            cutSrc = src;

            if (this.options.extensions && this.options.extensions.startInline) {
              (function () {
                var startIndex = Infinity;
                var tempSrc = src.slice(1);
                var tempStart = void 0;

                _this2.options.extensions.startInline.forEach(function (getStartIndex) {
                  tempStart = getStartIndex.call({
                    lexer: this
                  }, tempSrc);

                  if (typeof tempStart === 'number' && tempStart >= 0) {
                    startIndex = Math.min(startIndex, tempStart);
                  }
                });

                if (startIndex < Infinity && startIndex >= 0) {
                  cutSrc = src.substring(0, startIndex + 1);
                }
              })();
            }

            if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
              src = src.substring(token.raw.length);

              if (token.raw.slice(-1) !== '_') {
                // Track prevChar before string of ____ started
                prevChar = token.raw.slice(-1);
              }

              keepPrevChar = true;
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _createClass(Lexer, null, [{
          key: "rules",
          get: function get() {
            return {
              block: block,
              inline: inline
            };
          }
        }]);

        return Lexer;
      }();

      var defaults$2 = defaults$5.exports.defaults;
      var cleanUrl = helpers.cleanUrl,
          escape$1 = helpers.escape;
      /**
       * Renderer
       */

      var Renderer_1 = /*#__PURE__*/function () {
        function Renderer(options) {
          this.options = options || defaults$2;
        }

        var _proto = Renderer.prototype;

        _proto.code = function code(_code, infostring, escaped) {
          var lang = (infostring || '').match(/\S*/)[0];

          if (this.options.highlight) {
            var out = this.options.highlight(_code, lang);

            if (out != null && out !== _code) {
              escaped = true;
              _code = out;
            }
          }

          _code = _code.replace(/\n$/, '') + '\n';

          if (!lang) {
            return '<pre><code>' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
          }

          return '<pre><code class="' + this.options.langPrefix + escape$1(lang, true) + '">' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
        };

        _proto.blockquote = function blockquote(quote) {
          return '<blockquote>\n' + quote + '</blockquote>\n';
        };

        _proto.html = function html(_html) {
          return _html;
        };

        _proto.heading = function heading(text, level, raw, slugger) {
          if (this.options.headerIds) {
            return '<h' + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + '</h' + level + '>\n';
          } // ignore IDs


          return '<h' + level + '>' + text + '</h' + level + '>\n';
        };

        _proto.hr = function hr() {
          return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
        };

        _proto.list = function list(body, ordered, start) {
          var type = ordered ? 'ol' : 'ul',
              startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
          return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
        };

        _proto.listitem = function listitem(text) {
          return '<li>' + text + '</li>\n';
        };

        _proto.checkbox = function checkbox(checked) {
          return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
        };

        _proto.paragraph = function paragraph(text) {
          return '<p>' + text + '</p>\n';
        };

        _proto.table = function table(header, body) {
          if (body) body = '<tbody>' + body + '</tbody>';
          return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
        };

        _proto.tablerow = function tablerow(content) {
          return '<tr>\n' + content + '</tr>\n';
        };

        _proto.tablecell = function tablecell(content, flags) {
          var type = flags.header ? 'th' : 'td';
          var tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
          return tag + content + '</' + type + '>\n';
        } // span level renderer
        ;

        _proto.strong = function strong(text) {
          return '<strong>' + text + '</strong>';
        };

        _proto.em = function em(text) {
          return '<em>' + text + '</em>';
        };

        _proto.codespan = function codespan(text) {
          return '<code>' + text + '</code>';
        };

        _proto.br = function br() {
          return this.options.xhtml ? '<br/>' : '<br>';
        };

        _proto.del = function del(text) {
          return '<del>' + text + '</del>';
        };

        _proto.link = function link(href, title, text) {
          href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<a href="' + escape$1(href) + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += '>' + text + '</a>';
          return out;
        };

        _proto.image = function image(href, title, text) {
          href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<img src="' + href + '" alt="' + text + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += this.options.xhtml ? '/>' : '>';
          return out;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        return Renderer;
      }();

      /**
       * TextRenderer
       * returns only the textual part of the token
       */

      var TextRenderer_1 = /*#__PURE__*/function () {
        function TextRenderer() {}

        var _proto = TextRenderer.prototype;

        // no need for block level renderers
        _proto.strong = function strong(text) {
          return text;
        };

        _proto.em = function em(text) {
          return text;
        };

        _proto.codespan = function codespan(text) {
          return text;
        };

        _proto.del = function del(text) {
          return text;
        };

        _proto.html = function html(text) {
          return text;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        _proto.link = function link(href, title, text) {
          return '' + text;
        };

        _proto.image = function image(href, title, text) {
          return '' + text;
        };

        _proto.br = function br() {
          return '';
        };

        return TextRenderer;
      }();

      /**
       * Slugger generates header id
       */

      var Slugger_1 = /*#__PURE__*/function () {
        function Slugger() {
          this.seen = {};
        }

        var _proto = Slugger.prototype;

        _proto.serialize = function serialize(value) {
          return value.toLowerCase().trim() // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');
        }
        /**
         * Finds the next safe (unique) slug to use
         */
        ;

        _proto.getNextSafeSlug = function getNextSafeSlug(originalSlug, isDryRun) {
          var slug = originalSlug;
          var occurenceAccumulator = 0;

          if (this.seen.hasOwnProperty(slug)) {
            occurenceAccumulator = this.seen[originalSlug];

            do {
              occurenceAccumulator++;
              slug = originalSlug + '-' + occurenceAccumulator;
            } while (this.seen.hasOwnProperty(slug));
          }

          if (!isDryRun) {
            this.seen[originalSlug] = occurenceAccumulator;
            this.seen[slug] = 0;
          }

          return slug;
        }
        /**
         * Convert string to unique id
         * @param {object} options
         * @param {boolean} options.dryrun Generates the next unique slug without updating the internal accumulator.
         */
        ;

        _proto.slug = function slug(value, options) {
          if (options === void 0) {
            options = {};
          }

          var slug = this.serialize(value);
          return this.getNextSafeSlug(slug, options.dryrun);
        };

        return Slugger;
      }();

      var Renderer$1 = Renderer_1;
      var TextRenderer$1 = TextRenderer_1;
      var Slugger$1 = Slugger_1;
      var defaults$1 = defaults$5.exports.defaults;
      var unescape = helpers.unescape;
      /**
       * Parsing & Compiling
       */

      var Parser_1 = /*#__PURE__*/function () {
        function Parser(options) {
          this.options = options || defaults$1;
          this.options.renderer = this.options.renderer || new Renderer$1();
          this.renderer = this.options.renderer;
          this.renderer.options = this.options;
          this.textRenderer = new TextRenderer$1();
          this.slugger = new Slugger$1();
        }
        /**
         * Static Parse Method
         */


        Parser.parse = function parse(tokens, options) {
          var parser = new Parser(options);
          return parser.parse(tokens);
        }
        /**
         * Static Parse Inline Method
         */
        ;

        Parser.parseInline = function parseInline(tokens, options) {
          var parser = new Parser(options);
          return parser.parseInline(tokens);
        }
        /**
         * Parse Loop
         */
        ;

        var _proto = Parser.prototype;

        _proto.parse = function parse(tokens, top) {
          if (top === void 0) {
            top = true;
          }

          var out = '',
              i,
              j,
              k,
              l2,
              l3,
              row,
              cell,
              header,
              body,
              token,
              ordered,
              start,
              loose,
              itemBody,
              item,
              checked,
              task,
              checkbox,
              ret;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i]; // Run any renderer extensions

            if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
              ret = this.options.extensions.renderers[token.type].call({
                parser: this
              }, token);

              if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
                out += ret || '';
                continue;
              }
            }

            switch (token.type) {
              case 'space':
                {
                  continue;
                }

              case 'hr':
                {
                  out += this.renderer.hr();
                  continue;
                }

              case 'heading':
                {
                  out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
                  continue;
                }

              case 'code':
                {
                  out += this.renderer.code(token.text, token.lang, token.escaped);
                  continue;
                }

              case 'table':
                {
                  header = ''; // header

                  cell = '';
                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    cell += this.renderer.tablecell(this.parseInline(token.header[j].tokens), {
                      header: true,
                      align: token.align[j]
                    });
                  }

                  header += this.renderer.tablerow(cell);
                  body = '';
                  l2 = token.rows.length;

                  for (j = 0; j < l2; j++) {
                    row = token.rows[j];
                    cell = '';
                    l3 = row.length;

                    for (k = 0; k < l3; k++) {
                      cell += this.renderer.tablecell(this.parseInline(row[k].tokens), {
                        header: false,
                        align: token.align[k]
                      });
                    }

                    body += this.renderer.tablerow(cell);
                  }

                  out += this.renderer.table(header, body);
                  continue;
                }

              case 'blockquote':
                {
                  body = this.parse(token.tokens);
                  out += this.renderer.blockquote(body);
                  continue;
                }

              case 'list':
                {
                  ordered = token.ordered;
                  start = token.start;
                  loose = token.loose;
                  l2 = token.items.length;
                  body = '';

                  for (j = 0; j < l2; j++) {
                    item = token.items[j];
                    checked = item.checked;
                    task = item.task;
                    itemBody = '';

                    if (item.task) {
                      checkbox = this.renderer.checkbox(checked);

                      if (loose) {
                        if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                          item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                            item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                          }
                        } else {
                          item.tokens.unshift({
                            type: 'text',
                            text: checkbox
                          });
                        }
                      } else {
                        itemBody += checkbox;
                      }
                    }

                    itemBody += this.parse(item.tokens, loose);
                    body += this.renderer.listitem(itemBody, task, checked);
                  }

                  out += this.renderer.list(body, ordered, start);
                  continue;
                }

              case 'html':
                {
                  // TODO parse inline content if parameter markdown=1
                  out += this.renderer.html(token.text);
                  continue;
                }

              case 'paragraph':
                {
                  out += this.renderer.paragraph(this.parseInline(token.tokens));
                  continue;
                }

              case 'text':
                {
                  body = token.tokens ? this.parseInline(token.tokens) : token.text;

                  while (i + 1 < l && tokens[i + 1].type === 'text') {
                    token = tokens[++i];
                    body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
                  }

                  out += top ? this.renderer.paragraph(body) : body;
                  continue;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        }
        /**
         * Parse Inline Tokens
         */
        ;

        _proto.parseInline = function parseInline(tokens, renderer) {
          renderer = renderer || this.renderer;
          var out = '',
              i,
              token,
              ret;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i]; // Run any renderer extensions

            if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
              ret = this.options.extensions.renderers[token.type].call({
                parser: this
              }, token);

              if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
                out += ret || '';
                continue;
              }
            }

            switch (token.type) {
              case 'escape':
                {
                  out += renderer.text(token.text);
                  break;
                }

              case 'html':
                {
                  out += renderer.html(token.text);
                  break;
                }

              case 'link':
                {
                  out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'image':
                {
                  out += renderer.image(token.href, token.title, token.text);
                  break;
                }

              case 'strong':
                {
                  out += renderer.strong(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'em':
                {
                  out += renderer.em(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'codespan':
                {
                  out += renderer.codespan(token.text);
                  break;
                }

              case 'br':
                {
                  out += renderer.br();
                  break;
                }

              case 'del':
                {
                  out += renderer.del(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'text':
                {
                  out += renderer.text(token.text);
                  break;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        };

        return Parser;
      }();

      var Lexer = Lexer_1;
      var Parser = Parser_1;
      var Tokenizer = Tokenizer_1;
      var Renderer = Renderer_1;
      var TextRenderer = TextRenderer_1;
      var Slugger = Slugger_1;
      var merge = helpers.merge,
          checkSanitizeDeprecation = helpers.checkSanitizeDeprecation,
          escape = helpers.escape;
      var getDefaults = defaults$5.exports.getDefaults,
          changeDefaults = defaults$5.exports.changeDefaults,
          defaults = defaults$5.exports.defaults;
      /**
       * Marked
       */

      function marked(src, opt, callback) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        if (typeof opt === 'function') {
          callback = opt;
          opt = null;
        }

        opt = merge({}, marked.defaults, opt || {});
        checkSanitizeDeprecation(opt);

        if (callback) {
          var highlight = opt.highlight;
          var tokens;

          try {
            tokens = Lexer.lex(src, opt);
          } catch (e) {
            return callback(e);
          }

          var done = function done(err) {
            var out;

            if (!err) {
              try {
                if (opt.walkTokens) {
                  marked.walkTokens(tokens, opt.walkTokens);
                }

                out = Parser.parse(tokens, opt);
              } catch (e) {
                err = e;
              }
            }

            opt.highlight = highlight;
            return err ? callback(err) : callback(null, out);
          };

          if (!highlight || highlight.length < 3) {
            return done();
          }

          delete opt.highlight;
          if (!tokens.length) return done();
          var pending = 0;
          marked.walkTokens(tokens, function (token) {
            if (token.type === 'code') {
              pending++;
              setTimeout(function () {
                highlight(token.text, token.lang, function (err, code) {
                  if (err) {
                    return done(err);
                  }

                  if (code != null && code !== token.text) {
                    token.text = code;
                    token.escaped = true;
                  }

                  pending--;

                  if (pending === 0) {
                    done();
                  }
                });
              }, 0);
            }
          });

          if (pending === 0) {
            done();
          }

          return;
        }

        try {
          var _tokens = Lexer.lex(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(_tokens, opt.walkTokens);
          }

          return Parser.parse(_tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      }
      /**
       * Options
       */


      marked.options = marked.setOptions = function (opt) {
        merge(marked.defaults, opt);
        changeDefaults(marked.defaults);
        return marked;
      };

      marked.getDefaults = getDefaults;
      marked.defaults = defaults;
      /**
       * Use Extension
       */

      marked.use = function () {
        var _this = this;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var opts = merge.apply(void 0, [{}].concat(args));
        var extensions = marked.defaults.extensions || {
          renderers: {},
          childTokens: {}
        };
        var hasExtensions;
        args.forEach(function (pack) {
          // ==-- Parse "addon" extensions --== //
          if (pack.extensions) {
            hasExtensions = true;
            pack.extensions.forEach(function (ext) {
              if (!ext.name) {
                throw new Error('extension name required');
              }

              if (ext.renderer) {
                // Renderer extensions
                var prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;

                if (prevRenderer) {
                  // Replace extension with func to run new extension but fall back if false
                  extensions.renderers[ext.name] = function () {
                    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      args[_key2] = arguments[_key2];
                    }

                    var ret = ext.renderer.apply(this, args);

                    if (ret === false) {
                      ret = prevRenderer.apply(this, args);
                    }

                    return ret;
                  };
                } else {
                  extensions.renderers[ext.name] = ext.renderer;
                }
              }

              if (ext.tokenizer) {
                // Tokenizer Extensions
                if (!ext.level || ext.level !== 'block' && ext.level !== 'inline') {
                  throw new Error("extension level must be 'block' or 'inline'");
                }

                if (extensions[ext.level]) {
                  extensions[ext.level].unshift(ext.tokenizer);
                } else {
                  extensions[ext.level] = [ext.tokenizer];
                }

                if (ext.start) {
                  // Function to check for start of token
                  if (ext.level === 'block') {
                    if (extensions.startBlock) {
                      extensions.startBlock.push(ext.start);
                    } else {
                      extensions.startBlock = [ext.start];
                    }
                  } else if (ext.level === 'inline') {
                    if (extensions.startInline) {
                      extensions.startInline.push(ext.start);
                    } else {
                      extensions.startInline = [ext.start];
                    }
                  }
                }
              }

              if (ext.childTokens) {
                // Child tokens to be visited by walkTokens
                extensions.childTokens[ext.name] = ext.childTokens;
              }
            });
          } // ==-- Parse "overwrite" extensions --== //


          if (pack.renderer) {
            (function () {
              var renderer = marked.defaults.renderer || new Renderer();

              var _loop = function _loop(prop) {
                var prevRenderer = renderer[prop]; // Replace renderer with func to run extension, but fall back if false

                renderer[prop] = function () {
                  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                  }

                  var ret = pack.renderer[prop].apply(renderer, args);

                  if (ret === false) {
                    ret = prevRenderer.apply(renderer, args);
                  }

                  return ret;
                };
              };

              for (var prop in pack.renderer) {
                _loop(prop);
              }

              opts.renderer = renderer;
            })();
          }

          if (pack.tokenizer) {
            (function () {
              var tokenizer = marked.defaults.tokenizer || new Tokenizer();

              var _loop2 = function _loop2(prop) {
                var prevTokenizer = tokenizer[prop]; // Replace tokenizer with func to run extension, but fall back if false

                tokenizer[prop] = function () {
                  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                  }

                  var ret = pack.tokenizer[prop].apply(tokenizer, args);

                  if (ret === false) {
                    ret = prevTokenizer.apply(tokenizer, args);
                  }

                  return ret;
                };
              };

              for (var prop in pack.tokenizer) {
                _loop2(prop);
              }

              opts.tokenizer = tokenizer;
            })();
          } // ==-- Parse WalkTokens extensions --== //


          if (pack.walkTokens) {
            var walkTokens = marked.defaults.walkTokens;

            opts.walkTokens = function (token) {
              pack.walkTokens.call(_this, token);

              if (walkTokens) {
                walkTokens(token);
              }
            };
          }

          if (hasExtensions) {
            opts.extensions = extensions;
          }

          marked.setOptions(opts);
        });
      };
      /**
       * Run callback for every token
       */


      marked.walkTokens = function (tokens, callback) {
        var _loop3 = function _loop3() {
          var token = _step.value;
          callback(token);

          switch (token.type) {
            case 'table':
              {
                for (var _iterator2 = _createForOfIteratorHelperLoose(token.header), _step2; !(_step2 = _iterator2()).done;) {
                  var cell = _step2.value;
                  marked.walkTokens(cell.tokens, callback);
                }

                for (var _iterator3 = _createForOfIteratorHelperLoose(token.rows), _step3; !(_step3 = _iterator3()).done;) {
                  var row = _step3.value;

                  for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                    var _cell = _step4.value;
                    marked.walkTokens(_cell.tokens, callback);
                  }
                }

                break;
              }

            case 'list':
              {
                marked.walkTokens(token.items, callback);
                break;
              }

            default:
              {
                if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) {
                  // Walk any extensions
                  marked.defaults.extensions.childTokens[token.type].forEach(function (childTokens) {
                    marked.walkTokens(token[childTokens], callback);
                  });
                } else if (token.tokens) {
                  marked.walkTokens(token.tokens, callback);
                }
              }
          }
        };

        for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
          _loop3();
        }
      };
      /**
       * Parse Inline
       */


      marked.parseInline = function (src, opt) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked.parseInline(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked.parseInline(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        opt = merge({}, marked.defaults, opt || {});
        checkSanitizeDeprecation(opt);

        try {
          var tokens = Lexer.lexInline(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(tokens, opt.walkTokens);
          }

          return Parser.parseInline(tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      };
      /**
       * Expose
       */


      marked.Parser = Parser;
      marked.parser = Parser.parse;
      marked.Renderer = Renderer;
      marked.TextRenderer = TextRenderer;
      marked.Lexer = Lexer;
      marked.lexer = Lexer.lex;
      marked.Tokenizer = Tokenizer;
      marked.Slugger = Slugger;
      marked.parse = marked;
      var marked_1 = marked;

      return marked_1;

    })));
    });

    /* src\pages\Article.svelte generated by Svelte v3.31.2 */
    const file$f = "src\\pages\\Article.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (33:4) {#each articleLinks as articleLink}
    function create_each_block$4(ctx) {
    	let a;
    	let t_value = /*articleLink*/ ctx[3].label + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { class: true, href: true });
    			var a_nodes = children(a);
    			t = claim_text(a_nodes, t_value);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "class", "article-content-link");
    			attr_dev(a, "href", a_href_value = /*articleLink*/ ctx[3].link);
    			add_location(a, file$f, 33, 6, 1014);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*articleLinks*/ 2 && t_value !== (t_value = /*articleLink*/ ctx[3].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*articleLinks*/ 2 && a_href_value !== (a_href_value = /*articleLink*/ ctx[3].link)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(33:4) {#each articleLinks as articleLink}",
    		ctx
    	});

    	return block;
    }

    // (48:4) <Link        to="/"        class="px-4 py-2 inline-block leading-4 border-green-400 border bg-green-200 hover:bg-green-300 rounded-none mr-3 text-gray-700 font-mono"      >
    function create_default_slot$3(ctx) {
    	let p;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i = element("i");
    			t = text("Go Back");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			i = claim_element(p_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			t = claim_text(p_nodes, "Go Back");
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", "fas fa-arrow-left mr-3");
    			add_location(i, file$f, 52, 8, 1738);
    			attr_dev(p, "class", "text-gray-700 font-bold font-mono");
    			add_location(p, file$f, 51, 6, 1683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i);
    			append_dev(p, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(48:4) <Link        to=\\\"/\\\"        class=\\\"px-4 py-2 inline-block leading-4 border-green-400 border bg-green-200 hover:bg-green-300 rounded-none mr-3 text-gray-700 font-mono\\\"      >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let article_1;
    	let h1;
    	let t1;
    	let t2;
    	let p;
    	let t3;
    	let t4;
    	let hr;
    	let t5;
    	let link;
    	let t6;
    	let div1;
    	let current;
    	let each_value = /*articleLinks*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	link = new Link({
    			props: {
    				to: "/",
    				class: "px-4 py-2 inline-block leading-4 border-green-400 border bg-green-200 hover:bg-green-300 rounded-none mr-3 text-gray-700 font-mono",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			article_1 = element("article");
    			h1 = element("h1");
    			t1 = text("How I Made My Own Cryptocurrency");
    			t2 = space();
    			p = element("p");
    			t3 = text("by Ng Bob Shoaun  ∙  2 August 2021  ∙  8 minute read");
    			t4 = space();
    			hr = element("hr");
    			t5 = space();
    			create_component(link.$$.fragment);
    			t6 = space();
    			div1 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			div0 = claim_element(main_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(main_nodes);
    			article_1 = claim_element(main_nodes, "ARTICLE", { class: true });
    			var article_1_nodes = children(article_1);
    			h1 = claim_element(article_1_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "How I Made My Own Cryptocurrency");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(article_1_nodes);
    			p = claim_element(article_1_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t3 = claim_text(p_nodes, "by Ng Bob Shoaun  ∙  2 August 2021  ∙  8 minute read");
    			p_nodes.forEach(detach_dev);
    			t4 = claim_space(article_1_nodes);
    			hr = claim_element(article_1_nodes, "HR", { class: true });
    			t5 = claim_space(article_1_nodes);
    			claim_component(link.$$.fragment, article_1_nodes);
    			t6 = claim_space(article_1_nodes);
    			div1 = claim_element(article_1_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div1_nodes.forEach(detach_dev);
    			article_1_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "sticky top-16 text-gray-100 hidden lg:block ml-auto self-start");
    			add_location(div0, file$f, 31, 2, 889);
    			attr_dev(h1, "class", "text-3xl lg:text-5xl font-bold mb-4");
    			add_location(h1, file$f, 39, 4, 1209);
    			attr_dev(p, "class", "text-gray-500 dark:text-gray-300 mb-3");
    			add_location(p, file$f, 42, 4, 1314);
    			attr_dev(hr, "class", "mb-5 border-gray-400 ");
    			add_location(hr, file$f, 45, 4, 1459);
    			attr_dev(div1, "class", "article-content");
    			add_location(div1, file$f, 56, 4, 1814);
    			attr_dev(article_1, "class", "max-w-3xl mx-auto text-gray-700 dark:text-white");
    			add_location(article_1, file$f, 38, 2, 1138);
    			attr_dev(main, "class", "bg-gray-50 dark:bg-gray-800 pt-32 pb-24 px-5 lg:px-10 flex gap-5");
    			add_location(main, file$f, 30, 0, 806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(main, t0);
    			append_dev(main, article_1);
    			append_dev(article_1, h1);
    			append_dev(h1, t1);
    			append_dev(article_1, t2);
    			append_dev(article_1, p);
    			append_dev(p, t3);
    			append_dev(article_1, t4);
    			append_dev(article_1, hr);
    			append_dev(article_1, t5);
    			mount_component(link, article_1, null);
    			append_dev(article_1, t6);
    			append_dev(article_1, div1);
    			div1.innerHTML = /*article*/ ctx[0];
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*articleLinks*/ 2) {
    				each_value = /*articleLinks*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const link_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    			if (!current || dirty & /*article*/ 1) div1.innerHTML = /*article*/ ctx[0];		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Article", slots, []);
    	onMount(mounted);
    	let article = "";
    	let articleLinks = [];

    	async function mounted() {
    		const response = await fetch("/how-i-made-my-own-cryptocurrency.md");
    		const articleMD = await response.text();
    		const renderer = new marked.Renderer();
    		renderer.link = (href, title, text) => `<a target="_blank" href="${href}" title="${title}">${text}</a>`;
    		$$invalidate(0, article = marked(articleMD, { renderer }));
    	}

    	afterUpdate(() => {
    		const headings = document.querySelectorAll("h2");

    		$$invalidate(1, articleLinks = [...headings].map(heading => ({
    			label: heading.innerText,
    			link: `#${heading.id}`
    		})));
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Article> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Link,
    		marked,
    		onMount,
    		afterUpdate,
    		article,
    		articleLinks,
    		mounted
    	});

    	$$self.$inject_state = $$props => {
    		if ("article" in $$props) $$invalidate(0, article = $$props.article);
    		if ("articleLinks" in $$props) $$invalidate(1, articleLinks = $$props.articleLinks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [article, articleLinks];
    }

    class Article extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Article",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.2 */
    const file$g = "src\\App.svelte";

    // (36:4) <Route path="/">
    function create_default_slot_1(ctx) {
    	let main;
    	let updating_theme;
    	let current;

    	function main_theme_binding(value) {
    		/*main_theme_binding*/ ctx[4].call(null, value);
    	}

    	let main_props = {};

    	if (/*theme*/ ctx[1] !== void 0) {
    		main_props.theme = /*theme*/ ctx[1];
    	}

    	main = new Main({ props: main_props, $$inline: true });
    	binding_callbacks.push(() => bind(main, "theme", main_theme_binding));

    	const block = {
    		c: function create() {
    			create_component(main.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(main.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const main_changes = {};

    			if (!updating_theme && dirty & /*theme*/ 2) {
    				updating_theme = true;
    				main_changes.theme = /*theme*/ ctx[1];
    				add_flush_callback(() => updating_theme = false);
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(36:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (35:2) <Router {url}>
    function create_default_slot$4(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let t4;
    	let route5;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "resume", component: Resume },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "Resume", component: Resume },
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "articles/how-i-made-my-own-cryptocurrency",
    				component: Article
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: { path: "Facts", component: FunFacts },
    			$$inline: true
    		});

    	route5 = new Route({
    			props: { path: "facts", component: FunFacts },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(route0.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(route1.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			claim_component(route2.$$.fragment, nodes);
    			t2 = claim_space(nodes);
    			claim_component(route3.$$.fragment, nodes);
    			t3 = claim_space(nodes);
    			claim_component(route4.$$.fragment, nodes);
    			t4 = claim_space(nodes);
    			claim_component(route5.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope, theme*/ 66) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(35:2) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let navbar;
    	let updating_theme;
    	let t0;
    	let router;
    	let t1;
    	let footer;
    	let div_class_value;
    	let current;

    	function navbar_theme_binding(value) {
    		/*navbar_theme_binding*/ ctx[3].call(null, value);
    	}

    	let navbar_props = {};

    	if (/*theme*/ ctx[1] !== void 0) {
    		navbar_props.theme = /*theme*/ ctx[1];
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, "theme", navbar_theme_binding));
    	navbar.$on("toggleTheme", /*toggleTheme*/ ctx[2]);

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(router.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(navbar.$$.fragment, div_nodes);
    			t0 = claim_space(div_nodes);
    			claim_component(router.$$.fragment, div_nodes);
    			t1 = claim_space(div_nodes);
    			claim_component(footer.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "" + ((/*theme*/ ctx[1] === "dark" ? "dark" : "") + " flex flex-col"));
    			add_location(div, file$g, 32, 0, 1102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(navbar, div, null);
    			append_dev(div, t0);
    			mount_component(router, div, null);
    			append_dev(div, t1);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};

    			if (!updating_theme && dirty & /*theme*/ 2) {
    				updating_theme = true;
    				navbar_changes.theme = /*theme*/ ctx[1];
    				add_flush_callback(() => updating_theme = false);
    			}

    			navbar.$set(navbar_changes);
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope, theme*/ 66) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);

    			if (!current || dirty & /*theme*/ 2 && div_class_value !== (div_class_value = "" + ((/*theme*/ ctx[1] === "dark" ? "dark" : "") + " flex flex-col"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(navbar);
    			destroy_component(router);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props; //This property is necessary declare to avoid ignore the Router

    	// On page load or when changing themes, best to add inline in `head` to avoid FOUC
    	let theme = "dark";

    	const setTheme = newTheme => {
    		$$invalidate(1, theme = newTheme);
    		localStorage.theme = newTheme;
    		document.documentElement.style.setProperty("--theme", newTheme);
    	};

    	if ("theme" in localStorage) setTheme(localStorage.theme); else {
    		// new visitor
    		// localStorage.theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    		// 	? "dark"
    		// 	: "light";
    		setTheme("dark"); // force dark theme cuz its nicer
    	}

    	const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function navbar_theme_binding(value) {
    		theme = value;
    		$$invalidate(1, theme);
    	}

    	function main_theme_binding(value) {
    		theme = value;
    		$$invalidate(1, theme);
    	}

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Navbar,
    		Main,
    		Footer,
    		Resume,
    		FunFacts,
    		Article,
    		Router,
    		Route,
    		url,
    		theme,
    		setTheme,
    		toggleTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("theme" in $$props) $$invalidate(1, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, theme, toggleTheme, navbar_theme_binding, main_theme_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // import "tailwindcss/tailwind.css";

    const app = new App({
    	target: document.body,
    	props: {
      },
      hydrate: true,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
