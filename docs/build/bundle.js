
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
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
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
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

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
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
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
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
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
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
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
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
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
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

    var deepFreezeEs6 = {exports: {}};

    function deepFreeze(obj) {
        if (obj instanceof Map) {
            obj.clear = obj.delete = obj.set = function () {
                throw new Error('map is read-only');
            };
        } else if (obj instanceof Set) {
            obj.add = obj.clear = obj.delete = function () {
                throw new Error('set is read-only');
            };
        }

        // Freeze self
        Object.freeze(obj);

        Object.getOwnPropertyNames(obj).forEach(function (name) {
            var prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop == 'object' && !Object.isFrozen(prop)) {
                deepFreeze(prop);
            }
        });

        return obj;
    }

    deepFreezeEs6.exports = deepFreeze;
    deepFreezeEs6.exports.default = deepFreeze;

    var deepFreeze$1 = deepFreezeEs6.exports;

    /** @typedef {import('highlight.js').CallbackResponse} CallbackResponse */
    /** @typedef {import('highlight.js').CompiledMode} CompiledMode */
    /** @implements CallbackResponse */

    class Response {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        // eslint-disable-next-line no-undefined
        if (mode.data === undefined) mode.data = {};

        this.data = mode.data;
        this.isMatchIgnored = false;
      }

      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    }

    /**
     * @param {string} value
     * @returns {string}
     */
    function escapeHTML(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    /**
     * performs a shallow merge of multiple objects into one
     *
     * @template T
     * @param {T} original
     * @param {Record<string,any>[]} objects
     * @returns {T} a single new object
     */
    function inherit$1(original, ...objects) {
      /** @type Record<string,any> */
      const result = Object.create(null);

      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return /** @type {T} */ (result);
    }

    /**
     * @typedef {object} Renderer
     * @property {(text: string) => void} addText
     * @property {(node: Node) => void} openNode
     * @property {(node: Node) => void} closeNode
     * @property {() => string} value
     */

    /** @typedef {{kind?: string, sublanguage?: boolean}} Node */
    /** @typedef {{walk: (r: Renderer) => void}} Tree */
    /** */

    const SPAN_CLOSE = '</span>';

    /**
     * Determines if a node needs to be wrapped in <span>
     *
     * @param {Node} node */
    const emitsWrappingTags = (node) => {
      return !!node.kind;
    };

    /**
     *
     * @param {string} name
     * @param {{prefix:string}} options
     */
    const expandScopeName = (name, { prefix }) => {
      if (name.includes(".")) {
        const pieces = name.split(".");
        return [
          `${prefix}${pieces.shift()}`,
          ...(pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`))
        ].join(" ");
      }
      return `${prefix}${name}`;
    };

    /** @type {Renderer} */
    class HTMLRenderer {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }

      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }

      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;

        let scope = node.kind;
        if (node.sublanguage) {
          scope = `language-${scope}`;
        } else {
          scope = expandScopeName(scope, { prefix: this.classPrefix });
        }
        this.span(scope);
      }

      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;

        this.buffer += SPAN_CLOSE;
      }

      /**
       * returns the accumulated buffer
      */
      value() {
        return this.buffer;
      }

      // helpers

      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    }

    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} | string} Node */
    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} } DataNode */
    /** @typedef {import('highlight.js').Emitter} Emitter */
    /**  */

    class TokenTree {
      constructor() {
        /** @type DataNode */
        this.rootNode = { children: [] };
        this.stack = [this.rootNode];
      }

      get top() {
        return this.stack[this.stack.length - 1];
      }

      get root() { return this.rootNode; }

      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }

      /** @param {string} kind */
      openNode(kind) {
        /** @type Node */
        const node = { kind, children: [] };
        this.add(node);
        this.stack.push(node);
      }

      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        // eslint-disable-next-line no-undefined
        return undefined;
      }

      closeAllNodes() {
        while (this.closeNode());
      }

      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }

      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        // this does not
        return this.constructor._walk(builder, this.rootNode);
        // this works
        // return TokenTree._walk(builder, this.rootNode);
      }

      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }

      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;

        if (node.children.every(el => typeof el === "string")) {
          // node.text = node.children.join("");
          // delete node.children;
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            TokenTree._collapse(child);
          });
        }
      }
    }

    /**
      Currently this is all private API, but this is the minimal API necessary
      that an Emitter must implement to fully support the parser.

      Minimal interface:

      - addKeyword(text, kind)
      - addText(text)
      - addSublanguage(emitter, subLanguageName)
      - finalize()
      - openNode(kind)
      - closeNode()
      - closeAllNodes()
      - toHTML()

    */

    /**
     * @implements {Emitter}
     */
    class TokenTreeEmitter extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }

      /**
       * @param {string} text
       * @param {string} kind
       */
      addKeyword(text, kind) {
        if (text === "") { return; }

        this.openNode(kind);
        this.addText(text);
        this.closeNode();
      }

      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") { return; }

        this.add(text);
      }

      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      addSublanguage(emitter, name) {
        /** @type DataNode */
        const node = emitter.root;
        node.kind = name;
        node.sublanguage = true;
        this.add(node);
      }

      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }

      finalize() {
        return true;
      }
    }

    /**
     * @param {string} value
     * @returns {RegExp}
     * */

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function lookahead(re) {
      return concat('(?=', re, ')');
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function anyNumberOfTimes(re) {
      return concat('(?:', re, ')*');
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function optional(re) {
      return concat('(?:', re, ')?');
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
    }

    /**
     * @param { Array<string | RegExp | Object> } args
     * @returns {object}
     */
    function stripOptionsFromArgs(args) {
      const opts = args[args.length - 1];

      if (typeof opts === 'object' && opts.constructor === Object) {
        args.splice(args.length - 1, 1);
        return opts;
      } else {
        return {};
      }
    }

    /** @typedef { {capture?: boolean} } RegexEitherOptions */

    /**
     * Any of the passed expresssions may match
     *
     * Creates a huge this | this | that | that match
     * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
     * @returns {string}
     */
    function either(...args) {
      /** @type { object & {capture?: boolean} }  */
      const opts = stripOptionsFromArgs(args);
      const joined = '('
        + (opts.capture ? "" : "?:")
        + args.map((x) => source(x)).join("|") + ")";
      return joined;
    }

    /**
     * @param {RegExp | string} re
     * @returns {number}
     */
    function countMatchGroups(re) {
      return (new RegExp(re.toString() + '|')).exec('').length - 1;
    }

    /**
     * Does lexeme start with a regular expression match at the beginning
     * @param {RegExp} re
     * @param {string} lexeme
     */
    function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
    }

    // BACKREF_RE matches an open parenthesis or backreference. To avoid
    // an incorrect parse, it additionally matches the following:
    // - [...] elements, where the meaning of parentheses and escapes change
    // - other escape sequences, so we do not misparse escape sequences as
    //   interesting elements
    // - non-matching or lookahead parentheses, which do not capture. These
    //   follow the '(' with a '?'.
    const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;

    // **INTERNAL** Not intended for outside usage
    // join logically computes regexps.join(separator), but fixes the
    // backreferences so they continue to match.
    // it also places each individual regular expression into it's own
    // match group, keeping track of the sequencing of those match groups
    // is currently an exercise for the caller. :-)
    /**
     * @param {(string | RegExp)[]} regexps
     * @param {{joinWith: string}} opts
     * @returns {string}
     */
    function _rewriteBackreferences(regexps, { joinWith }) {
      let numCaptures = 0;

      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re = source(regex);
        let out = '';

        while (re.length > 0) {
          const match = BACKREF_RE.exec(re);
          if (!match) {
            out += re;
            break;
          }
          out += re.substring(0, match.index);
          re = re.substring(match.index + match[0].length);
          if (match[0][0] === '\\' && match[1]) {
            // Adjust the backreference.
            out += '\\' + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === '(') {
              numCaptures++;
            }
          }
        }
        return out;
      }).map(re => `(${re})`).join(joinWith);
    }

    /** @typedef {import('highlight.js').Mode} Mode */
    /** @typedef {import('highlight.js').ModeCallback} ModeCallback */

    // Common regexps
    const MATCH_NOTHING_RE = /\b\B/;
    const IDENT_RE = '[a-zA-Z]\\w*';
    const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
    const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
    const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
    const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
    const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

    /**
    * @param { Partial<Mode> & {binary?: string | RegExp} } opts
    */
    const SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/);
      }
      return inherit$1({
        scope: 'meta',
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };

    // Common modes
    const BACKSLASH_ESCAPE = {
      begin: '\\\\[\\s\\S]', relevance: 0
    };
    const APOS_STRING_MODE = {
      scope: 'string',
      begin: '\'',
      end: '\'',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const QUOTE_STRING_MODE = {
      scope: 'string',
      begin: '"',
      end: '"',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    /**
     * Creates a comment mode
     *
     * @param {string | RegExp} begin
     * @param {string | RegExp} end
     * @param {Mode | {}} [modeOptions]
     * @returns {Partial<Mode>}
     */
    const COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit$1(
        {
          scope: 'comment',
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push({
        scope: 'doctag',
        // hack to avoid the space from being included. the space is necessary to
        // match here to prevent the plain text rule below from gobbling up doctags
        begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: true,
        relevance: 0
      });
      const ENGLISH_WORD = either(
        // list of common 1 and 2 letter words in English
        "I",
        "a",
        "is",
        "so",
        "us",
        "to",
        "at",
        "if",
        "in",
        "it",
        "on",
        // note: this is not an exhaustive list of contractions, just popular ones
        /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
        /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
        /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
      );
      // looking like plain text, more likely to be a comment
      mode.contains.push(
        {
          // TODO: how to include ", (, ) without breaking grammars that use these for
          // comment delimiters?
          // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
          // ---

          // this tries to find sequences of 3 english words in a row (without any
          // "programming" type syntax) this gives us a strong signal that we've
          // TRULY found a comment - vs perhaps scanning with the wrong language.
          // It's possible to find something that LOOKS like the start of the
          // comment - but then if there is no readable text - good chance it is a
          // false match and not a comment.
          //
          // for a visual example please see:
          // https://github.com/highlightjs/highlight.js/issues/2827

          begin: concat(
            /[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
            '(',
            ENGLISH_WORD,
            /[.]?[:]?([.][ ]|[ ])/,
            '){3}') // look for 3 words in a row
        }
      );
      return mode;
    };
    const C_LINE_COMMENT_MODE = COMMENT('//', '$');
    const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
    const HASH_COMMENT_MODE = COMMENT('#', '$');
    const NUMBER_MODE = {
      scope: 'number',
      begin: NUMBER_RE,
      relevance: 0
    };
    const C_NUMBER_MODE = {
      scope: 'number',
      begin: C_NUMBER_RE,
      relevance: 0
    };
    const BINARY_NUMBER_MODE = {
      scope: 'number',
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    const REGEXP_MODE = {
      // this outer rule makes sure we actually have a WHOLE regex and not simply
      // an expression such as:
      //
      //     3 / something
      //
      // (which will then blow up when regex's `illegal` sees the newline)
      begin: /(?=\/[^/\n]*\/)/,
      contains: [{
        scope: 'regexp',
        begin: /\//,
        end: /\/[gimuy]*/,
        illegal: /\n/,
        contains: [
          BACKSLASH_ESCAPE,
          {
            begin: /\[/,
            end: /\]/,
            relevance: 0,
            contains: [BACKSLASH_ESCAPE]
          }
        ]
      }]
    };
    const TITLE_MODE = {
      scope: 'title',
      begin: IDENT_RE,
      relevance: 0
    };
    const UNDERSCORE_TITLE_MODE = {
      scope: 'title',
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    const METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
      relevance: 0
    };

    /**
     * Adds end same as begin mechanics to a mode
     *
     * Your mode must include at least a single () match group as that first match
     * group is what is used for comparison
     * @param {Partial<Mode>} mode
     */
    const END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(mode,
        {
          /** @type {ModeCallback} */
          'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
          /** @type {ModeCallback} */
          'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
        });
    };

    var MODES = /*#__PURE__*/Object.freeze({
        __proto__: null,
        MATCH_NOTHING_RE: MATCH_NOTHING_RE,
        IDENT_RE: IDENT_RE,
        UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
        NUMBER_RE: NUMBER_RE,
        C_NUMBER_RE: C_NUMBER_RE,
        BINARY_NUMBER_RE: BINARY_NUMBER_RE,
        RE_STARTERS_RE: RE_STARTERS_RE,
        SHEBANG: SHEBANG,
        BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
        APOS_STRING_MODE: APOS_STRING_MODE,
        QUOTE_STRING_MODE: QUOTE_STRING_MODE,
        PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
        COMMENT: COMMENT,
        C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
        C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
        HASH_COMMENT_MODE: HASH_COMMENT_MODE,
        NUMBER_MODE: NUMBER_MODE,
        C_NUMBER_MODE: C_NUMBER_MODE,
        BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
        REGEXP_MODE: REGEXP_MODE,
        TITLE_MODE: TITLE_MODE,
        UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE,
        METHOD_GUARD: METHOD_GUARD,
        END_SAME_AS_BEGIN: END_SAME_AS_BEGIN
    });

    /**
    @typedef {import('highlight.js').CallbackResponse} CallbackResponse
    @typedef {import('highlight.js').CompilerExt} CompilerExt
    */

    // Grammar extensions / plugins
    // See: https://github.com/highlightjs/highlight.js/issues/2833

    // Grammar extensions allow "syntactic sugar" to be added to the grammar modes
    // without requiring any underlying changes to the compiler internals.

    // `compileMatch` being the perfect small example of now allowing a grammar
    // author to write `match` when they desire to match a single expression rather
    // than being forced to use `begin`.  The extension then just moves `match` into
    // `begin` when it runs.  Ie, no features have been added, but we've just made
    // the experience of writing (and reading grammars) a little bit nicer.

    // ------

    // TODO: We need negative look-behind support to do this properly
    /**
     * Skip a match if it has a preceding dot
     *
     * This is used for `beginKeywords` to prevent matching expressions such as
     * `bob.keyword.do()`. The mode compiler automatically wires this up as a
     * special _internal_ 'on:begin' callback for modes with `beginKeywords`
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    function skipIfHasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }

    /**
     *
     * @type {CompilerExt}
     */
    function scopeClassName(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.className !== undefined) {
        mode.scope = mode.className;
        delete mode.className;
      }
    }

    /**
     * `beginKeywords` syntactic sugar
     * @type {CompilerExt}
     */
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;

      // for languages with keywords that include non-word characters checking for
      // a word boundary is not sufficient, so instead we check for a word boundary
      // or whitespace - this does no harm in any case since our keyword engine
      // doesn't allow spaces in keywords anyways and we still check for the boundary
      // first
      mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
      mode.__beforeBegin = skipIfHasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;

      // prevents double relevance, the keywords themselves provide
      // relevance, the mode doesn't need to double it
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 0;
    }

    /**
     * Allow `illegal` to contain an array of illegal values
     * @type {CompilerExt}
     */
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;

      mode.illegal = either(...mode.illegal);
    }

    /**
     * `match` to match a single expression for readability
     * @type {CompilerExt}
     */
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

      mode.begin = mode.match;
      delete mode.match;
    }

    /**
     * provides the default 1 relevance to all modes
     * @type {CompilerExt}
     */
    function compileRelevance(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 1;
    }

    // allow beforeMatch to act as a "qualifier" for the match
    // the full match begin must be [beforeMatch][begin]
    const beforeMatchExt = (mode, parent) => {
      if (!mode.beforeMatch) return;
      // starts conflicts with endsParent which we need to make sure the child
      // rule is not matched multiple times
      if (mode.starts) throw new Error("beforeMatch cannot be used with starts");

      const originalMode = Object.assign({}, mode);
      Object.keys(mode).forEach((key) => { delete mode[key]; });

      mode.keywords = originalMode.keywords;
      mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
      mode.starts = {
        relevance: 0,
        contains: [
          Object.assign(originalMode, { endsParent: true })
        ]
      };
      mode.relevance = 0;

      delete originalMode.beforeMatch;
    };

    // keywords that should have no default relevance value
    const COMMON_KEYWORDS = [
      'of',
      'and',
      'for',
      'in',
      'not',
      'or',
      'if',
      'then',
      'parent', // common variable name
      'list', // common variable name
      'value' // common variable name
    ];

    const DEFAULT_KEYWORD_SCOPE = "keyword";

    /**
     * Given raw keywords from a language definition, compile them.
     *
     * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
     * @param {boolean} caseInsensitive
     */
    function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
      /** @type KeywordDict */
      const compiledKeywords = Object.create(null);

      // input can be a string of keywords, an array of keywords, or a object with
      // named keys representing scopeName (which can then point to a string or array)
      if (typeof rawKeywords === 'string') {
        compileList(scopeName, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(scopeName, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(scopeName) {
          // collapse all our objects back into the parent object
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[scopeName], caseInsensitive, scopeName)
          );
        });
      }
      return compiledKeywords;

      // ---

      /**
       * Compiles an individual list of keywords
       *
       * Ex: "for if when while|5"
       *
       * @param {string} scopeName
       * @param {Array<string>} keywordList
       */
      function compileList(scopeName, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map(x => x.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split('|');
          compiledKeywords[pair[0]] = [scopeName, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }

    /**
     * Returns the proper score for a given keyword
     *
     * Also takes into account comment keywords, which will be scored 0 UNLESS
     * another score has been manually assigned.
     * @param {string} keyword
     * @param {string} [providedScore]
     */
    function scoreForKeyword(keyword, providedScore) {
      // manual scores always win over common keywords
      // so you can force a score of 1 if you really insist
      if (providedScore) {
        return Number(providedScore);
      }

      return commonKeyword(keyword) ? 0 : 1;
    }

    /**
     * Determines if a given keyword is common or not
     *
     * @param {string} keyword */
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }

    /*

    For the reasoning behind this please see:
    https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

    */

    /**
     * @type {Record<string, boolean>}
     */
    const seenDeprecations = {};

    /**
     * @param {string} message
     */
    const error = (message) => {
      console.error(message);
    };

    /**
     * @param {string} message
     * @param {any} args
     */
    const warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };

    /**
     * @param {string} version
     * @param {string} message
     */
    const deprecated = (version, message) => {
      if (seenDeprecations[`${version}/${message}`]) return;

      console.log(`Deprecated as of ${version}. ${message}`);
      seenDeprecations[`${version}/${message}`] = true;
    };

    /* eslint-disable no-throw-literal */

    /**
    @typedef {import('highlight.js').CompiledMode} CompiledMode
    */

    const MultiClassError = new Error();

    /**
     * Renumbers labeled scope names to account for additional inner match
     * groups that otherwise would break everything.
     *
     * Lets say we 3 match scopes:
     *
     *   { 1 => ..., 2 => ..., 3 => ... }
     *
     * So what we need is a clean match like this:
     *
     *   (a)(b)(c) => [ "a", "b", "c" ]
     *
     * But this falls apart with inner match groups:
     *
     * (a)(((b)))(c) => ["a", "b", "b", "b", "c" ]
     *
     * Our scopes are now "out of alignment" and we're repeating `b` 3 times.
     * What needs to happen is the numbers are remapped:
     *
     *   { 1 => ..., 2 => ..., 5 => ... }
     *
     * We also need to know that the ONLY groups that should be output
     * are 1, 2, and 5.  This function handles this behavior.
     *
     * @param {CompiledMode} mode
     * @param {Array<RegExp | string>} regexes
     * @param {{key: "beginScope"|"endScope"}} opts
     */
    function remapScopeNames(mode, regexes, { key }) {
      let offset = 0;
      const scopeNames = mode[key];
      /** @type Record<number,boolean> */
      const emit = {};
      /** @type Record<number,string> */
      const positions = {};

      for (let i = 1; i <= regexes.length; i++) {
        positions[i + offset] = scopeNames[i];
        emit[i + offset] = true;
        offset += countMatchGroups(regexes[i - 1]);
      }
      // we use _emit to keep track of which match groups are "top-level" to avoid double
      // output from inside match groups
      mode[key] = positions;
      mode[key]._emit = emit;
      mode[key]._multi = true;
    }

    /**
     * @param {CompiledMode} mode
     */
    function beginMultiClass(mode) {
      if (!Array.isArray(mode.begin)) return;

      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
        error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
        throw MultiClassError;
      }

      if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
        error("beginScope must be object");
        throw MultiClassError;
      }

      remapScopeNames(mode, mode.begin, { key: "beginScope" });
      mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
    }

    /**
     * @param {CompiledMode} mode
     */
    function endMultiClass(mode) {
      if (!Array.isArray(mode.end)) return;

      if (mode.skip || mode.excludeEnd || mode.returnEnd) {
        error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
        throw MultiClassError;
      }

      if (typeof mode.endScope !== "object" || mode.endScope === null) {
        error("endScope must be object");
        throw MultiClassError;
      }

      remapScopeNames(mode, mode.end, { key: "endScope" });
      mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
    }

    /**
     * this exists only to allow `scope: {}` to be used beside `match:`
     * Otherwise `beginScope` would necessary and that would look weird

      {
        match: [ /def/, /\w+/ ]
        scope: { 1: "keyword" , 2: "title" }
      }

     * @param {CompiledMode} mode
     */
    function scopeSugar(mode) {
      if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
        mode.beginScope = mode.scope;
        delete mode.scope;
      }
    }

    /**
     * @param {CompiledMode} mode
     */
    function MultiClass(mode) {
      scopeSugar(mode);

      if (typeof mode.beginScope === "string") {
        mode.beginScope = { _wrap: mode.beginScope };
      }
      if (typeof mode.endScope === "string") {
        mode.endScope = { _wrap: mode.endScope };
      }

      beginMultiClass(mode);
      endMultiClass(mode);
    }

    /**
    @typedef {import('highlight.js').Mode} Mode
    @typedef {import('highlight.js').CompiledMode} CompiledMode
    @typedef {import('highlight.js').Language} Language
    @typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
    @typedef {import('highlight.js').CompiledLanguage} CompiledLanguage
    */

    // compilation

    /**
     * Compiles a language definition result
     *
     * Given the raw result of a language definition (Language), compiles this so
     * that it is ready for highlighting code.
     * @param {Language} language
     * @returns {CompiledLanguage}
     */
    function compileLanguage(language) {
      /**
       * Builds a regex with the case sensitivity of the current language
       *
       * @param {RegExp | string} value
       * @param {boolean} [global]
       */
      function langRe(value, global) {
        return new RegExp(
          source(value),
          'm'
          + (language.case_insensitive ? 'i' : '')
          + (language.unicodeRegex ? 'u' : '')
          + (global ? 'g' : '')
        );
      }

      /**
        Stores multiple regular expressions and allows you to quickly search for
        them all in a string simultaneously - returning the first match.  It does
        this by creating a huge (a|b|c) regex - each individual item wrapped with ()
        and joined by `|` - using match groups to track position.  When a match is
        found checking which position in the array has content allows us to figure
        out which of the original regexes / match groups triggered the match.

        The match object itself (the result of `Regex.exec`) is returned but also
        enhanced by merging in any meta-data that was registered with the regex.
        This is how we keep track of which mode matched, and what type of rule
        (`illegal`, `begin`, end, etc).
      */
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          // @ts-ignore
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          opts.position = this.position++;
          // @ts-ignore
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re]);
          this.matchAt += countMatchGroups(re) + 1;
        }

        compile() {
          if (this.regexes.length === 0) {
            // avoids the need to check length every time exec is called
            // @ts-ignore
            this.exec = () => null;
          }
          const terminators = this.regexes.map(el => el[1]);
          this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: '|' }), true);
          this.lastIndex = 0;
        }

        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) { return null; }

          // eslint-disable-next-line no-undefined
          const i = match.findIndex((el, i) => i > 0 && el !== undefined);
          // @ts-ignore
          const matchData = this.matchIndexes[i];
          // trim off any earlier non-relevant match groups (ie, the other regex
          // match groups that make up the multi-matcher)
          match.splice(0, i);

          return Object.assign(match, matchData);
        }
      }

      /*
        Created to solve the key deficiently with MultiRegex - there is no way to
        test for multiple matches at a single location.  Why would we need to do
        that?  In the future a more dynamic engine will allow certain matches to be
        ignored.  An example: if we matched say the 3rd regex in a large group but
        decided to ignore it - we'd need to started testing again at the 4th
        regex... but MultiRegex itself gives us no real way to do that.

        So what this class creates MultiRegexs on the fly for whatever search
        position they are needed.

        NOTE: These additional MultiRegex objects are created dynamically.  For most
        grammars most of the time we will never actually need anything more than the
        first MultiRegex - so this shouldn't have too much overhead.

        Say this is our search group, and we match regex3, but wish to ignore it.

          regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

        What we need is a new MultiRegex that only includes the remaining
        possibilities:

          regex4 | regex5                               ' ie, startAt = 3

        This class wraps all that complexity up in a simple API... `startAt` decides
        where in the array of expressions to start doing the matching. It
        auto-increments, so if a match is found at position 2, then startAt will be
        set to 3.  If the end is reached startAt will return to 0.

        MOST of the time the parser will be setting startAt manually to 0.
      */
      class ResumableMultiRegex {
        constructor() {
          // @ts-ignore
          this.rules = [];
          // @ts-ignore
          this.multiRegexes = [];
          this.count = 0;

          this.lastIndex = 0;
          this.regexIndex = 0;
        }

        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];

          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }

        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }

        considerAll() {
          this.regexIndex = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          this.rules.push([re, opts]);
          if (opts.type === "begin") this.count++;
        }

        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);

          // The following is because we have no easy way to say "resume scanning at the
          // existing position but also skip the current rule ONLY". What happens is
          // all prior rules are also skipped which can result in matching the wrong
          // thing. Example of matching "booger":

          // our matcher is [string, "booger", number]
          //
          // ....booger....

          // if "booger" is ignored then we'd really need a regex to scan from the
          // SAME position for only: [string, number] but ignoring "booger" (if it
          // was the first match), a simple resume would scan ahead who knows how
          // far looking only for "number", ignoring potential string matches (or
          // future "booger" matches that might be valid.)

          // So what we do: We execute two matchers, one resuming at the same
          // position, but the second full matcher starting at the position after:

          //     /--- resume first regex match here (for [number])
          //     |/---- full match here for [string, "booger", number]
          //     vv
          // ....booger....

          // Which ever results in a match first is then used. So this 3-4 step
          // process essentially allows us to say "match at this position, excluding
          // a prior rule that was ignored".
          //
          // 1. Match "booger" first, ignore. Also proves that [string] does non match.
          // 2. Resume matching for [number]
          // 3. Match at index + 1 for [string, "booger", number]
          // 4. If #2 and #3 result in matches, which came first?
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ; else { // use the second matcher result
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }

          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              // wrap-around to considering all matches again
              this.considerAll();
            }
          }

          return result;
        }
      }

      /**
       * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
       * the content and find matches.
       *
       * @param {CompiledMode} mode
       * @returns {ResumableMultiRegex}
       */
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();

        mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }

        return mm;
      }

      /** skip vs abort vs ignore
       *
       * @skip   - The mode is still entered and exited normally (and contains rules apply),
       *           but all content is held and added to the parent buffer rather than being
       *           output when the mode ends.  Mostly used with `sublanguage` to build up
       *           a single large buffer than can be parsed by sublanguage.
       *
       *             - The mode begin ands ends normally.
       *             - Content matched is added to the parent mode buffer.
       *             - The parser cursor is moved forward normally.
       *
       * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
       *           never matched) but DOES NOT continue to match subsequent `contains`
       *           modes.  Abort is bad/suboptimal because it can result in modes
       *           farther down not getting applied because an earlier rule eats the
       *           content but then aborts.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is added to the mode buffer.
       *             - The parser cursor is moved forward accordingly.
       *
       * @ignore - Ignores the mode (as if it never matched) and continues to match any
       *           subsequent `contains` modes.  Ignore isn't technically possible with
       *           the current parser implementation.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is ignored.
       *             - The parser cursor is not moved forward.
       */

      /**
       * Compiles an individual mode
       *
       * This can raise an error if the mode contains certain detectable known logic
       * issues.
       * @param {Mode} mode
       * @param {CompiledMode | null} [parent]
       * @returns {CompiledMode | never}
       */
      function compileMode(mode, parent) {
        const cmode = /** @type CompiledMode */ (mode);
        if (mode.isCompiled) return cmode;

        [
          scopeClassName,
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch,
          MultiClass,
          beforeMatchExt
        ].forEach(ext => ext(mode, parent));

        language.compilerExtensions.forEach(ext => ext(mode, parent));

        // __beforeBegin is considered private API, internal use only
        mode.__beforeBegin = null;

        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach(ext => ext(mode, parent));

        mode.isCompiled = true;

        let keywordPattern = null;
        if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
          // we need a copy because keywords might be compiled multiple times
          // so we can't go deleting $pattern from the original on the first
          // pass
          mode.keywords = Object.assign({}, mode.keywords);
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }
        keywordPattern = keywordPattern || /\w+/;

        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }

        cmode.keywordPatternRe = langRe(keywordPattern, true);

        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(cmode.begin);
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(cmode.end);
          cmode.terminatorEnd = source(cmode.end) || '';
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
        if (!mode.contains) mode.contains = [];

        mode.contains = [].concat(...mode.contains.map(function(c) {
          return expandOrCloneMode(c === 'self' ? mode : c);
        }));
        mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

        if (mode.starts) {
          compileMode(mode.starts, parent);
        }

        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }

      if (!language.compilerExtensions) language.compilerExtensions = [];

      // self is not valid at the top-level
      if (language.contains && language.contains.includes('self')) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }

      // we need a null object, which inherit will guarantee
      language.classNameAliases = inherit$1(language.classNameAliases || {});

      return compileMode(/** @type Mode */ (language));
    }

    /**
     * Determines if a mode has a dependency on it's parent or not
     *
     * If a mode does have a parent dependency then often we need to clone it if
     * it's used in multiple places so that each copy points to the correct parent,
     * where-as modes without a parent can often safely be re-used at the bottom of
     * a mode chain.
     *
     * @param {Mode | null} mode
     * @returns {boolean} - is there a dependency on the parent?
     * */
    function dependencyOnParent(mode) {
      if (!mode) return false;

      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }

    /**
     * Expands a mode or clones it if necessary
     *
     * This is necessary for modes with parental dependenceis (see notes on
     * `dependencyOnParent`) and for nodes that have `variants` - which must then be
     * exploded into their own individual modes at compile time.
     *
     * @param {Mode} mode
     * @returns {Mode | Mode[]}
     * */
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit$1(mode, { variants: null }, variant);
        });
      }

      // EXPAND
      // if we have variants then essentially "replace" the mode with the variants
      // this happens in compileMode, where this function is called from
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }

      // CLONE
      // if we have dependencies on parents then we need a unique
      // instance of ourselves, so we can be reused with many
      // different parents without issue
      if (dependencyOnParent(mode)) {
        return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
      }

      if (Object.isFrozen(mode)) {
        return inherit$1(mode);
      }

      // no special dependency issues, just return ourselves
      return mode;
    }

    var version = "11.5.0";

    class HTMLInjectionError extends Error {
      constructor(reason, html) {
        super(reason);
        this.name = "HTMLInjectionError";
        this.html = html;
      }
    }

    /*
    Syntax highlighting with language autodetection.
    https://highlightjs.org/
    */

    /**
    @typedef {import('highlight.js').Mode} Mode
    @typedef {import('highlight.js').CompiledMode} CompiledMode
    @typedef {import('highlight.js').CompiledScope} CompiledScope
    @typedef {import('highlight.js').Language} Language
    @typedef {import('highlight.js').HLJSApi} HLJSApi
    @typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
    @typedef {import('highlight.js').PluginEvent} PluginEvent
    @typedef {import('highlight.js').HLJSOptions} HLJSOptions
    @typedef {import('highlight.js').LanguageFn} LanguageFn
    @typedef {import('highlight.js').HighlightedHTMLElement} HighlightedHTMLElement
    @typedef {import('highlight.js').BeforeHighlightContext} BeforeHighlightContext
    @typedef {import('highlight.js/private').MatchType} MatchType
    @typedef {import('highlight.js/private').KeywordData} KeywordData
    @typedef {import('highlight.js/private').EnhancedMatch} EnhancedMatch
    @typedef {import('highlight.js/private').AnnotatedError} AnnotatedError
    @typedef {import('highlight.js').AutoHighlightResult} AutoHighlightResult
    @typedef {import('highlight.js').HighlightOptions} HighlightOptions
    @typedef {import('highlight.js').HighlightResult} HighlightResult
    */


    const escape = escapeHTML;
    const inherit = inherit$1;
    const NO_MATCH = Symbol("nomatch");
    const MAX_KEYWORD_HITS = 7;

    /**
     * @param {any} hljs - object that is extended (legacy)
     * @returns {HLJSApi}
     */
    const HLJS = function(hljs) {
      // Global internal variables used within the highlight.js library.
      /** @type {Record<string, Language>} */
      const languages = Object.create(null);
      /** @type {Record<string, string>} */
      const aliases = Object.create(null);
      /** @type {HLJSPlugin[]} */
      const plugins = [];

      // safe/production mode - swallows more errors, tries to keep running
      // even if a single syntax or parse hits a fatal error
      let SAFE_MODE = true;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      /** @type {Language} */
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

      // Global options used when within external APIs. This is modified when
      // calling the `hljs.configure` function.
      /** @type HLJSOptions */
      let options = {
        ignoreUnescapedHTML: false,
        throwUnescapedHTML: false,
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: 'hljs-',
        cssSelector: 'pre code',
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };

      /* Utility functions */

      /**
       * Tests a language name to see if highlighting should be skipped
       * @param {string} languageName
       */
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }

      /**
       * @param {HighlightedHTMLElement} block - the HTML element to determine language for
       */
      function blockLanguage(block) {
        let classes = block.className + ' ';

        classes += block.parentNode ? block.parentNode.className : '';

        // language-* takes precedence over non-prefixed class names.
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : 'no-highlight';
        }

        return classes
          .split(/\s+/)
          .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }

      /**
       * Core highlighting function.
       *
       * OLD API
       * highlight(lang, code, ignoreIllegals, continuation)
       *
       * NEW API
       * highlight(code, {lang, ignoreIllegals})
       *
       * @param {string} codeOrLanguageName - the language to use for highlighting
       * @param {string | HighlightOptions} optionsOrCode - the code to highlight
       * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       *
       * @returns {HighlightResult} Result - an object that represents the result
       * @property {string} language - the language name
       * @property {number} relevance - the relevance score
       * @property {string} value - the highlighted HTML code
       * @property {string} code - the original raw code
       * @property {CompiledMode} top - top of the current mode stack
       * @property {boolean} illegal - indicates whether any illegal matches were found
      */
      function highlight(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrLanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
        } else {
          // old API
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrLanguageName;
          code = optionsOrCode;
        }

        // https://github.com/highlightjs/highlight.js/issues/3149
        // eslint-disable-next-line no-undefined
        if (ignoreIllegals === undefined) { ignoreIllegals = true; }

        /** @type {BeforeHighlightContext} */
        const context = {
          code,
          language: languageName
        };
        // the plugin can change the desired language or the code to be highlighted
        // just be changing the object it was passed
        fire("before:highlight", context);

        // a before plugin can usurp the result completely by providing it's own
        // in which case we don't even need to call highlight
        const result = context.result
          ? context.result
          : _highlight(context.language, context.code, ignoreIllegals);

        result.code = context.code;
        // the plugin can change anything in result to suite it
        fire("after:highlight", result);

        return result;
      }

      /**
       * private highlight that's used internally and does not fire callbacks
       *
       * @param {string} languageName - the language to use for highlighting
       * @param {string} codeToHighlight - the code to highlight
       * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       * @param {CompiledMode?} [continuation] - current continuation mode, if any
       * @returns {HighlightResult} - result of the highlight operation
      */
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        const keywordHits = Object.create(null);

        /**
         * Return keyword data if a match is a keyword
         * @param {CompiledMode} mode - current mode
         * @param {string} matchText - the textual match
         * @returns {KeywordData | false}
         */
        function keywordData(mode, matchText) {
          return mode.keywords[matchText];
        }

        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }

          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";

          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
            const data = keywordData(top, word);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";

              keywordHits[word] = (keywordHits[word] || 0) + 1;
              if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                // _ implied for relevance only, do not highlight
                // by applying a class name
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitter.addKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substr(lastIndex);
          emitter.addText(buf);
        }

        function processSubLanguage() {
          if (modeBuffer === "") return;
          /** @type HighlightResult */
          let result = null;

          if (typeof top.subLanguage === 'string') {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */ (result._top);
          } else {
            result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }

          // Counting embedded language score towards the host language may be disabled
          // with zeroing the containing mode relevance. Use case in point is Markdown that
          // allows XML everywhere and makes every XML snippet to have a much larger Markdown
          // score.
          if (top.relevance > 0) {
            relevance += result.relevance;
          }
          emitter.addSublanguage(result._emitter, result.language);
        }

        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = '';
        }

        /**
         * @param {CompiledScope} scope
         * @param {RegExpMatchArray} match
         */
        function emitMultiClass(scope, match) {
          let i = 1;
          const max = match.length - 1;
          while (i <= max) {
            if (!scope._emit[i]) { i++; continue; }
            const klass = language.classNameAliases[scope[i]] || scope[i];
            const text = match[i];
            if (klass) {
              emitter.addKeyword(text, klass);
            } else {
              modeBuffer = text;
              processKeywords();
              modeBuffer = "";
            }
            i++;
          }
        }

        /**
         * @param {CompiledMode} mode - new mode to start
         * @param {RegExpMatchArray} match
         */
        function startNewMode(mode, match) {
          if (mode.scope && typeof mode.scope === "string") {
            emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
          }
          if (mode.beginScope) {
            // beginScope just wraps the begin match itself in a scope
            if (mode.beginScope._wrap) {
              emitter.addKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
              modeBuffer = "";
            } else if (mode.beginScope._multi) {
              // at this point modeBuffer should just be the match
              emitMultiClass(mode.beginScope, match);
              modeBuffer = "";
            }
          }

          top = Object.create(mode, { parent: { value: top } });
          return top;
        }

        /**
         * @param {CompiledMode } mode - the mode to potentially end
         * @param {RegExpMatchArray} match - the latest match
         * @param {string} matchPlusRemainder - match plus remainder of content
         * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
         */
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);

          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }

            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          // even if on:end fires an `ignore` it's still possible
          // that we might trigger the end node because of a parent mode
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }

        /**
         * Handle matching but then ignoring a sequence of text
         *
         * @param {string} lexeme - string containing full match text
         */
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            // no more regexes to potentially match here, so we move the cursor forward one
            // space
            modeBuffer += lexeme[0];
            return 1;
          } else {
            // no need to move the cursor, we still have additional regexes to try and
            // match at this very spot
            resumeScanAtSamePosition = true;
            return 0;
          }
        }

        /**
         * Handle the start of a new potential mode match
         *
         * @param {EnhancedMatch} match - the current match
         * @returns {number} how far to advance the parse cursor
         */
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;

          const resp = new Response(newMode);
          // first internal before callbacks, then the public ones
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }

          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode, match);
          return newMode.returnBegin ? 0 : lexeme.length;
        }

        /**
         * Handle the potential end of mode
         *
         * @param {RegExpMatchArray} match - the current match
         */
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substr(match.index);

          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) { return NO_MATCH; }

          const origin = top;
          if (top.endScope && top.endScope._wrap) {
            processBuffer();
            emitter.addKeyword(lexeme, top.endScope._wrap);
          } else if (top.endScope && top.endScope._multi) {
            processBuffer();
            emitMultiClass(top.endScope, match);
          } else if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.scope) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            startNewMode(endMode.starts, match);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }

        function processContinuations() {
          const list = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.scope) {
              list.unshift(current.scope);
            }
          }
          list.forEach(item => emitter.openNode(item));
        }

        /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
        let lastMatch = {};

        /**
         *  Process an individual match
         *
         * @param {string} textBeforeMatch - text preceding the match (since the last match)
         * @param {EnhancedMatch} [match] - the match itself
         */
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];

          // add non-matched text to the current mode buffer
          modeBuffer += textBeforeMatch;

          if (lexeme == null) {
            processBuffer();
            return 0;
          }

          // we've found a 0 width match and we're stuck, so we need to advance
          // this happens when we have badly behaved rules that have optional matchers to the degree that
          // sometimes they can end up matching nothing at all
          // Ref: https://github.com/highlightjs/highlight.js/issues/2140
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            // spit the "skipped" character that our regex choked on back into the output sequence
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              /** @type {AnnotatedError} */
              const err = new Error(`0 width match regex (${languageName})`);
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;

          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            // illegal match, we do not continue processing
            /** @type {AnnotatedError} */
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || '<unnamed>') + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }

          // edge case for when illegal matches $ (end of line) which is technically
          // a 0 width match but not a begin/end match so it's not caught by the
          // first handler (when ignoreIllegals is true)
          if (match.type === "illegal" && lexeme === "") {
            // advance so we aren't stuck in an infinite loop
            return 1;
          }

          // infinite loops are BAD, this is a last ditch catch all. if we have a
          // decent number of iterations yet our index (cursor position in our
          // parsing) still 3x behind our index then something is very wrong
          // so we bail
          if (iterations > 100000 && iterations > match.index * 3) {
            const err = new Error('potential infinite loop, way more iterations than matches');
            throw err;
          }

          /*
          Why might be find ourselves here?  An potential end match that was
          triggered but could not be completed.  IE, `doEndMatch` returned NO_MATCH.
          (this could be because a callback requests the match be ignored, etc)

          This causes no real harm other than stopping a few times too many.
          */

          modeBuffer += lexeme;
          return lexeme.length;
        }

        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }

        const md = compileLanguage(language);
        let result = '';
        /** @type {CompiledMode} */
        let top = continuation || md;
        /** @type Record<string,CompiledMode> */
        const continuations = {}; // keep continuations for sub-languages
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = '';
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;

        try {
          top.matcher.considerAll();

          for (;;) {
            iterations++;
            if (resumeScanAtSamePosition) {
              // only regexes not matched previously will now be
              // considered for a potential match
              resumeScanAtSamePosition = false;
            } else {
              top.matcher.considerAll();
            }
            top.matcher.lastIndex = index;

            const match = top.matcher.exec(codeToHighlight);
            // console.log("match", match[0], match.rule && match.rule.begin)

            if (!match) break;

            const beforeMatch = codeToHighlight.substring(index, match.index);
            const processedCount = processLexeme(beforeMatch, match);
            index = match.index + processedCount;
          }
          processLexeme(codeToHighlight.substr(index));
          emitter.closeAllNodes();
          emitter.finalize();
          result = emitter.toHTML();

          return {
            language: languageName,
            value: result,
            relevance: relevance,
            illegal: false,
            _emitter: emitter,
            _top: top
          };
        } catch (err) {
          if (err.message && err.message.includes('Illegal')) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: true,
              relevance: 0,
              _illegalBy: {
                message: err.message,
                index: index,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode,
                resultSoFar: result
              },
              _emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: false,
              relevance: 0,
              errorRaised: err,
              _emitter: emitter,
              _top: top
            };
          } else {
            throw err;
          }
        }
      }

      /**
       * returns a valid highlight result, without actually doing any actual work,
       * auto highlight starts with this and it's possible for small snippets that
       * auto-detection may not find a better match
       * @param {string} code
       * @returns {HighlightResult}
       */
      function justTextHighlightResult(code) {
        const result = {
          value: escape(code),
          illegal: false,
          relevance: 0,
          _top: PLAINTEXT_LANGUAGE,
          _emitter: new options.__emitter(options)
        };
        result._emitter.addText(code);
        return result;
      }

      /**
      Highlighting with language detection. Accepts a string with the code to
      highlight. Returns an object with the following properties:

      - language (detected language)
      - relevance (int)
      - value (an HTML string with highlighting markup)
      - secondBest (object with the same structure for second-best heuristically
        detected language, may be absent)

        @param {string} code
        @param {Array<string>} [languageSubset]
        @returns {AutoHighlightResult}
      */
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext = justTextHighlightResult(code);

        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
          _highlight(name, code, false)
        );
        results.unshift(plaintext); // plaintext is always an option

        const sorted = results.sort((a, b) => {
          // sort base on relevance
          if (a.relevance !== b.relevance) return b.relevance - a.relevance;

          // always award the tie to the base language
          // ie if C++ and Arduino are tied, it's more likely to be C++
          if (a.language && b.language) {
            if (getLanguage(a.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a.language) {
              return -1;
            }
          }

          // otherwise say they are equal, which has the effect of sorting on
          // relevance while preserving the original ordering - which is how ties
          // have historically been settled, ie the language that comes first always
          // wins in the case of a tie
          return 0;
        });

        const [best, secondBest] = sorted;

        /** @type {AutoHighlightResult} */
        const result = best;
        result.secondBest = secondBest;

        return result;
      }

      /**
       * Builds new class name for block given the language name
       *
       * @param {HTMLElement} element
       * @param {string} [currentLang]
       * @param {string} [resultLang]
       */
      function updateClassName(element, currentLang, resultLang) {
        const language = (currentLang && aliases[currentLang]) || resultLang;

        element.classList.add("hljs");
        element.classList.add(`language-${language}`);
      }

      /**
       * Applies highlighting to a DOM node containing code.
       *
       * @param {HighlightedHTMLElement} element - the HTML element to highlight
      */
      function highlightElement(element) {
        /** @type HTMLElement */
        let node = null;
        const language = blockLanguage(element);

        if (shouldNotHighlight(language)) return;

        fire("before:highlightElement",
          { el: element, language: language });

        // we should be all text, no child nodes (unescaped HTML) - this is possibly
        // an HTML injection attack - it's likely too late if this is already in
        // production (the code has likely already done its damage by the time
        // we're seeing it)... but we yell loudly about this so that hopefully it's
        // more likely to be caught in development before making it to production
        if (element.children.length > 0) {
          if (!options.ignoreUnescapedHTML) {
            console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
            console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
            console.warn("The element with unescaped HTML:");
            console.warn(element);
          }
          if (options.throwUnescapedHTML) {
            const err = new HTMLInjectionError(
              "One of your code blocks includes unescaped HTML.",
              element.innerHTML
            );
            throw err;
          }
        }

        node = element;
        const text = node.textContent;
        const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

        element.innerHTML = result.value;
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relevance: result.relevance
        };
        if (result.secondBest) {
          element.secondBest = {
            language: result.secondBest.language,
            relevance: result.secondBest.relevance
          };
        }

        fire("after:highlightElement", { el: element, result, text });
      }

      /**
       * Updates highlight.js global options with the passed options
       *
       * @param {Partial<HLJSOptions>} userOptions
       */
      function configure(userOptions) {
        options = inherit(options, userOptions);
      }

      // TODO: remove v12, deprecated
      const initHighlighting = () => {
        highlightAll();
        deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      };

      // TODO: remove v12, deprecated
      function initHighlightingOnLoad() {
        highlightAll();
        deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      }

      let wantsHighlight = false;

      /**
       * auto-highlights all pre>code elements on the page
       */
      function highlightAll() {
        // if we are called too early in the loading process
        if (document.readyState === "loading") {
          wantsHighlight = true;
          return;
        }

        const blocks = document.querySelectorAll(options.cssSelector);
        blocks.forEach(highlightElement);
      }

      function boot() {
        // if a highlight was requested before DOM was loaded, do now
        if (wantsHighlight) highlightAll();
      }

      // make sure we are in the browser environment
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('DOMContentLoaded', boot, false);
      }

      /**
       * Register a language grammar module
       *
       * @param {string} languageName
       * @param {LanguageFn} languageDefinition
       */
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          // hard or soft error
          if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
          // languages that have serious errors are replaced with essentially a
          // "plaintext" stand-in so that the code blocks will still get normal
          // css classes applied to them - and one bad language won't break the
          // entire highlighter
          lang = PLAINTEXT_LANGUAGE;
        }
        // give it a temporary name if it doesn't have one in the meta-data
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);

        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }

      /**
       * Remove a language grammar module
       *
       * @param {string} languageName
       */
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }

      /**
       * @returns {string[]} List of language internal names
       */
      function listLanguages() {
        return Object.keys(languages);
      }

      /**
       * @param {string} name - name of the language to retrieve
       * @returns {Language | undefined}
       */
      function getLanguage(name) {
        name = (name || '').toLowerCase();
        return languages[name] || languages[aliases[name]];
      }

      /**
       *
       * @param {string|string[]} aliasList - single alias or list of aliases
       * @param {{languageName: string}} opts
       */
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === 'string') {
          aliasList = [aliasList];
        }
        aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
      }

      /**
       * Determines if a given language has auto-detection enabled
       * @param {string} name - name of the language
       */
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }

      /**
       * Upgrades the old highlightBlock plugins to the new
       * highlightElement API
       * @param {HLJSPlugin} plugin
       */
      function upgradePluginAPI(plugin) {
        // TODO: remove with v12
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }

      /**
       * @param {HLJSPlugin} plugin
       */
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }

      /**
       *
       * @param {PluginEvent} event
       * @param {any} args
       */
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }

      /**
       * DEPRECATED
       * @param {HighlightedHTMLElement} el
       */
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");

        return highlightElement(el);
      }

      /* Interface definition */
      Object.assign(hljs, {
        highlight,
        highlightAuto,
        highlightAll,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        autoDetection,
        inherit,
        addPlugin
      });

      hljs.debugMode = function() { SAFE_MODE = false; };
      hljs.safeMode = function() { SAFE_MODE = true; };
      hljs.versionString = version;

      hljs.regex = {
        concat: concat,
        lookahead: lookahead,
        either: either,
        optional: optional,
        anyNumberOfTimes: anyNumberOfTimes
      };

      for (const key in MODES) {
        // @ts-ignore
        if (typeof MODES[key] === "object") {
          // @ts-ignore
          deepFreeze$1(MODES[key]);
        }
      }

      // merge all the modes/regexes into our main object
      Object.assign(hljs, MODES);

      return hljs;
    };

    // export an "instance" of the highlighter
    var highlight = HLJS({});

    var core = highlight;
    highlight.HighlightJS = highlight;
    highlight.default = highlight;

    var HighlightJS = core;

    /* node_modules\svelte-highlight\Highlight.svelte generated by Svelte v3.59.2 */
    const file$d = "node_modules\\svelte-highlight\\Highlight.svelte";
    const get_default_slot_changes$1 = dirty => ({ highlighted: dirty & /*highlighted*/ 8 });
    const get_default_slot_context$1 = ctx => ({ highlighted: /*highlighted*/ ctx[3] });

    // (40:90) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*code*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*code*/ 2) set_data_dev(t, /*code*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(40:90) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:40) {#if highlighted !== undefined}
    function create_if_block$a(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*highlighted*/ ctx[3], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*highlighted*/ 8) html_tag.p(/*highlighted*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(40:40) {#if highlighted !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (35:20)    
    function fallback_block$1(ctx) {
    	let pre;
    	let code_1;
    	let pre_data_language_value;

    	function select_block_type(ctx, dirty) {
    		if (/*highlighted*/ ctx[3] !== undefined) return create_if_block$a;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	let pre_levels = [
    		{
    			"data-language": pre_data_language_value = /*language*/ ctx[0].name && /*language*/ ctx[0].name || "plaintext"
    		},
    		/*$$restProps*/ ctx[4]
    	];

    	let pre_data = {};

    	for (let i = 0; i < pre_levels.length; i += 1) {
    		pre_data = assign(pre_data, pre_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			code_1 = element("code");
    			if_block.c();
    			attr_dev(code_1, "class", "hljs");
    			add_location(code_1, file$d, 39, 21, 1015);
    			set_attributes(pre, pre_data);
    			toggle_class(pre, "langtag", /*langtag*/ ctx[2]);
    			toggle_class(pre, "svelte-pjwdro", true);
    			add_location(pre, file$d, 36, 2, 903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);
    			append_dev(pre, code_1);
    			if_block.m(code_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(code_1, null);
    				}
    			}

    			set_attributes(pre, pre_data = get_spread_update(pre_levels, [
    				dirty & /*language*/ 1 && pre_data_language_value !== (pre_data_language_value = /*language*/ ctx[0].name && /*language*/ ctx[0].name || "plaintext") && { "data-language": pre_data_language_value },
    				dirty & /*$$restProps*/ 16 && /*$$restProps*/ ctx[4]
    			]));

    			toggle_class(pre, "langtag", /*langtag*/ ctx[2]);
    			toggle_class(pre, "svelte-pjwdro", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(35:20)    ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$1);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, highlighted*/ 40)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*language, $$restProps, langtag, highlighted, code*/ 31)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
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
    	const omit_props_names = ["language","code","langtag"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Highlight', slots, ['default']);
    	let { language = { name: undefined, register: undefined } } = $$props;
    	let { code = undefined } = $$props;
    	let { langtag = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let highlighted = undefined;

    	afterUpdate(() => {
    		if (highlighted) dispatch("highlight", { highlighted });
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('language' in $$new_props) $$invalidate(0, language = $$new_props.language);
    		if ('code' in $$new_props) $$invalidate(1, code = $$new_props.code);
    		if ('langtag' in $$new_props) $$invalidate(2, langtag = $$new_props.langtag);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		language,
    		code,
    		langtag,
    		hljs: HighlightJS,
    		createEventDispatcher,
    		afterUpdate,
    		dispatch,
    		highlighted
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('language' in $$props) $$invalidate(0, language = $$new_props.language);
    		if ('code' in $$props) $$invalidate(1, code = $$new_props.code);
    		if ('langtag' in $$props) $$invalidate(2, langtag = $$new_props.langtag);
    		if ('highlighted' in $$props) $$invalidate(3, highlighted = $$new_props.highlighted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*language, code*/ 3) {
    			if (language.name && language.register) {
    				HighlightJS.registerLanguage(language.name, language.register);
    				$$invalidate(3, highlighted = HighlightJS.highlight(code, { language: language.name }).value);
    			}
    		}
    	};

    	return [language, code, langtag, highlighted, $$restProps, $$scope, slots];
    }

    class Highlight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { language: 0, code: 1, langtag: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Highlight",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get language() {
    		throw new Error("<Highlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Highlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get code() {
    		throw new Error("<Highlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set code(value) {
    		throw new Error("<Highlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get langtag() {
    		throw new Error("<Highlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set langtag(value) {
    		throw new Error("<Highlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Highlight$1 = Highlight;

    /*
    Language: JSON
    Description: JSON (JavaScript Object Notation) is a lightweight data-interchange format.
    Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
    Website: http://www.json.org
    Category: common, protocols, web
    */

    function json$2(hljs) {
      const ATTRIBUTE = {
        className: 'attr',
        begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
        relevance: 1.01
      };
      const PUNCTUATION = {
        match: /[{}[\],:]/,
        className: "punctuation",
        relevance: 0
      };
      // normally we would rely on `keywords` for this but using a mode here allows us
      // to use the very tight `illegal: \S` rule later to flag any other character
      // as illegal indicating that despite looking like JSON we do not truly have
      // JSON and thus improve false-positively greatly since JSON will try and claim
      // all sorts of JSON looking stuff
      const LITERALS = { beginKeywords: [
        "true",
        "false",
        "null"
      ].join(" ") };

      return {
        name: 'JSON',
        contains: [
          ATTRIBUTE,
          PUNCTUATION,
          hljs.QUOTE_STRING_MODE,
          LITERALS,
          hljs.C_NUMBER_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ],
        illegal: '\\S'
      };
    }

    const json = { name: "json", register: json$2 };
    var json$1 = json;

    const atomOneDark = `<style>pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#abb2bf;background:#282c34}.hljs-comment,.hljs-quote{color:#5c6370;font-style:italic}.hljs-doctag,.hljs-formula,.hljs-keyword{color:#c678dd}.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst{color:#e06c75}.hljs-literal{color:#56b6c2}.hljs-addition,.hljs-attribute,.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#98c379}.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable{color:#d19a66}.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title{color:#61aeee}.hljs-built_in,.hljs-class .hljs-title,.hljs-title.class_{color:#e6c07b}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}.hljs-link{text-decoration:underline}</style>`;

    var atomOneDark$1 = atomOneDark;

    var ApplicationCommandOptionType;
    (function (ApplicationCommandOptionType) {
        ApplicationCommandOptionType[ApplicationCommandOptionType["SUB_COMMAND"] = 1] = "SUB_COMMAND";
        ApplicationCommandOptionType[ApplicationCommandOptionType["SUB_COMMAND_GROUP"] = 2] = "SUB_COMMAND_GROUP";
        ApplicationCommandOptionType[ApplicationCommandOptionType["STRING"] = 3] = "STRING";
        ApplicationCommandOptionType[ApplicationCommandOptionType["INTEGER"] = 4] = "INTEGER";
        ApplicationCommandOptionType[ApplicationCommandOptionType["BOOLEAN"] = 5] = "BOOLEAN";
        ApplicationCommandOptionType[ApplicationCommandOptionType["USER"] = 6] = "USER";
        ApplicationCommandOptionType[ApplicationCommandOptionType["CHANNEL"] = 7] = "CHANNEL";
        ApplicationCommandOptionType[ApplicationCommandOptionType["ROLE"] = 8] = "ROLE";
        ApplicationCommandOptionType[ApplicationCommandOptionType["MENTIONABLE"] = 9] = "MENTIONABLE";
        ApplicationCommandOptionType[ApplicationCommandOptionType["NUMBER"] = 10] = "NUMBER";
        ApplicationCommandOptionType[ApplicationCommandOptionType["ATTACHMENT"] = 11] = "ATTACHMENT";
    })(ApplicationCommandOptionType || (ApplicationCommandOptionType = {}));
    var ChannelType;
    (function (ChannelType) {
        ChannelType[ChannelType["GUILD_TEXT"] = 0] = "GUILD_TEXT";
        ChannelType[ChannelType["DM"] = 1] = "DM";
        ChannelType[ChannelType["GUILD_VOICE"] = 2] = "GUILD_VOICE";
        ChannelType[ChannelType["GROUP_DM"] = 3] = "GROUP_DM";
        ChannelType[ChannelType["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
        ChannelType[ChannelType["GUILD_NEWS"] = 5] = "GUILD_NEWS";
        ChannelType[ChannelType["GUILD_NEWS_THREAD"] = 10] = "GUILD_NEWS_THREAD";
        ChannelType[ChannelType["GUILD_PUBLIC_THREAD"] = 11] = "GUILD_PUBLIC_THREAD";
        ChannelType[ChannelType["GUILD_PRIVATE_THREAD"] = 12] = "GUILD_PRIVATE_THREAD";
        ChannelType[ChannelType["GUILD_STAGE_VOICE"] = 13] = "GUILD_STAGE_VOICE";
        ChannelType[ChannelType["GUILD_DIRECTORY"] = 14] = "GUILD_DIRECTORY";
        ChannelType[ChannelType["GUILD_FORUM"] = 15] = "GUILD_FORUM";
    })(ChannelType || (ChannelType = {}));
    var Locale;
    (function (Locale) {
        Locale["Danish"] = "da";
        Locale["German"] = "de";
        Locale["English_UK"] = "en-GB";
        Locale["English_US"] = "en-US";
        Locale["Spanish"] = "es-ES";
        Locale["French"] = "fr";
        Locale["Croatian"] = "hr";
        Locale["Italian"] = "it";
        Locale["Lithuanian"] = "lt";
        Locale["Hungarian"] = "hu";
        Locale["Dutch"] = "nl";
        Locale["Norwegian"] = "no";
        Locale["Polish"] = "pl";
        Locale["Portuguese_Brazilian"] = "pt-BR";
        Locale["Romanian"] = "ro";
        Locale["Finnish"] = "fi";
        Locale["Swedish"] = "sv-SE";
        Locale["Vietnamese"] = "vi";
        Locale["Turkish"] = "tr";
        Locale["Czech"] = "cs";
        Locale["Greek"] = "el";
        Locale["Bulgarian"] = "bg";
        Locale["Russian"] = "ru";
        Locale["Ukrainian"] = "uk";
        Locale["Hindi"] = "hi";
        Locale["Thai"] = "th";
        Locale["Chinese_China"] = "zh-CN";
        Locale["Japanese"] = "ja";
        Locale["Chinese_Taiwan"] = "zh-TW";
        Locale["Korean"] = "ko";
    })(Locale || (Locale = {}));
    var ApplicationCommandType;
    (function (ApplicationCommandType) {
        ApplicationCommandType[ApplicationCommandType["CHAT_INPUT"] = 1] = "CHAT_INPUT";
        ApplicationCommandType[ApplicationCommandType["USER"] = 2] = "USER";
        ApplicationCommandType[ApplicationCommandType["MESSAGE"] = 3] = "MESSAGE";
    })(ApplicationCommandType || (ApplicationCommandType = {}));
    var Permissions;
    (function (Permissions) {
        Permissions["CREATE_INSTANT_INVITE"] = "CreateInstantInvite";
        Permissions["KICK_MEMBERS"] = "KickMembers";
        Permissions["BAN_MEMBERS"] = "BanMembers";
        Permissions["ADMINISTRATOR"] = "Administrator";
        Permissions["MANAGE_CHANNELS"] = "ManageChannels";
        Permissions["MANAGE_GUILD"] = "ManageGuild";
        Permissions["ADD_REACTIONS"] = "AddReactions";
        Permissions["VIEW_AUDIT_LOG"] = "ViewAuditLog";
        Permissions["PRIORITY_SPEAKER"] = "PrioritySpeaker";
        Permissions["STREAM"] = "Stream";
        Permissions["VIEW_CHANNEL"] = "ViewChannel";
        Permissions["SEND_MESSAGES"] = "SendMessages";
        Permissions["SEND_TTS_MESSAGES"] = " SendTTSMessages";
        Permissions["MANAGE_MESSAGES"] = "ManageMessages";
        Permissions["EMBED_LINKS"] = "EmbedLinks";
        Permissions["ATTACH_FILES"] = "AttachFiles";
        Permissions["READ_MESSAGE_HISTORY"] = "ReadMessageHistory";
        Permissions["MENTION_EVERYONE"] = "MentionEveryone";
        Permissions["USE_EXTERNAL_EMOJIS"] = "UseExternalEmojis";
        Permissions["VIEW_GUILD_INSIGHTS"] = "ViewGuildInsights";
        Permissions["CONNECT"] = "Connect";
        Permissions["SPEAK"] = "Speak";
        Permissions["MUTE_MEMBERS"] = "MuteMembers";
        Permissions["DEAFEN_MEMBERS"] = "DeafenMembers";
        Permissions["MOVE_MEMBERS"] = "MoveMembers";
        Permissions["USE_VAD"] = "UseVAD";
        Permissions["CHANGE_NICKNAME"] = "ChangeNickname";
        Permissions["MANAGE_NICKNAMES"] = "ManageNicknames";
        Permissions["MANAGE_ROLES"] = "ManageRoles";
        Permissions["MANAGE_WEBHOOKS"] = "ManageWebhooks";
        Permissions["MANAGE_EMOJIS_AND_STICKERS"] = "ManageGuildExpressions";
        Permissions["USE_APPLICATION_COMMANDS"] = "UseApplicationCommands";
        Permissions["REQUEST_TO_SPEAK"] = "RequestToSpeak";
        Permissions["MANAGE_EVENTS"] = "ManageEvents";
        Permissions["MANAGE_THREADS"] = "ManageThreads";
        Permissions["CREATE_PUBLIC_THREADS"] = "CreatePublicThreads";
        Permissions["CREATE_PRIVATE_THREADS"] = "CreatePrivateThreads";
        Permissions["USE_EXTERNAL_STICKERS"] = "UseExternalStickers";
        Permissions["SEND_MESSAGES_IN_THREADS"] = "SendMessagesInThreads";
        Permissions["USE_EMBEDDED_ACTIVITIES"] = "UseEmbeddedActivities";
        Permissions["MODERATE_MEMBERS"] = "ModerateMembers";
        Permissions["VIEW_CREATOR_MONETIZATION_ANALYTICS"] = "ViewCreatorMonetizationAnalytics";
        Permissions["USE_SOUNDBOARD"] = "UseSoundboard";
        Permissions["CREATE_GUILD_EXPRESSIONS"] = "CreateGuildExpressions";
        Permissions["CREATE_EVENTS"] = "CreateEvents";
        Permissions["USE_EXTERNAL_SOUNDS"] = "UseExternalSounds";
        Permissions["SEND_VOICE_MESSAGES"] = " SendVoiceMessages";
    })(Permissions || (Permissions = {}));

    function buildOptionsFromEnum(enumType, perms) {
        let options = [];
        const entries = Object.entries(enumType);
        if (!perms)
            entries.splice(0, entries.length / 2);
        for (let entry of entries) {
            let display = entry[0].toLowerCase();
            const split = display.split("_");
            display = split
                .map((str) => str[0].toUpperCase() + str.slice(1))
                .join(" ");
            options.push({
                display: display,
                value: entry[1],
            });
        }
        return options;
    }

    /* src\components\base\Checkbox.svelte generated by Svelte v3.59.2 */

    const file$c = "src\\components\\base\\Checkbox.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			attr_dev(label_1, "for", /*name*/ ctx[2]);
    			attr_dev(label_1, "class", "input-label svelte-g8noal");
    			add_location(label_1, file$c, 6, 4, 123);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "class", "svelte-g8noal");
    			add_location(input, file$c, 7, 4, 182);
    			attr_dev(div, "class", "checkbox svelte-g8noal");
    			add_location(div, file$c, 5, 0, 95);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			input.checked = /*value*/ ctx[0];

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*name*/ 4) {
    				attr_dev(label_1, "for", /*name*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1) {
    				input.checked = /*value*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Checkbox', slots, []);
    	let { label } = $$props;
    	let { value } = $$props;
    	let { name = label } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (label === undefined && !('label' in $$props || $$self.$$.bound[$$self.$$.props['label']])) {
    			console.warn("<Checkbox> was created without expected prop 'label'");
    		}

    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<Checkbox> was created without expected prop 'value'");
    		}
    	});

    	const writable_props = ['label', 'value', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ label, value, name });

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, label, name, input_change_handler];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { label: 1, value: 0, name: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Icon.svelte generated by Svelte v3.59.2 */

    const file$b = "src\\components\\Icon.svelte";

    // (21:0) {#if icon}
    function create_if_block$9(ctx) {
    	let i;
    	let raw_value = /*icon*/ ctx[0].svg + "";
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", i_class_value = /*$$props*/ ctx[1].class);
    			add_location(i, file$b, 21, 4, 1489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			i.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 1 && raw_value !== (raw_value = /*icon*/ ctx[0].svg + "")) i.innerHTML = raw_value;
    			if (dirty & /*$$props*/ 2 && i_class_value !== (i_class_value = /*$$props*/ ctx[1].class)) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(21:0) {#if icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let if_block = /*icon*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let icon;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { name } = $$props;
    	let icons = new Map();

    	icons.set("add", {
    		svg: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>'
    	});

    	icons.set("copy", {
    		svg: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>'
    	});

    	icons.set("chevron_down", {
    		svg: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>'
    	});

    	icons.set("chevron_right", {
    		svg: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>'
    	});

    	icons.set("delete", {
    		svg: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>'
    	});

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<Icon> was created without expected prop 'name'");
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('name' in $$new_props) $$invalidate(2, name = $$new_props.name);
    	};

    	$$self.$capture_state = () => ({ name, icons, icon });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('name' in $$props) $$invalidate(2, name = $$new_props.name);
    		if ('icons' in $$props) $$invalidate(3, icons = $$new_props.icons);
    		if ('icon' in $$props) $$invalidate(0, icon = $$new_props.icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*name*/ 4) {
    			$$invalidate(0, icon = icons.get(name));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [icon, $$props, name];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { name: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\base\Collapsible.svelte generated by Svelte v3.59.2 */
    const file$a = "src\\components\\base\\Collapsible.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({ name1: "option-names" });

    // (20:4) {#if !collapsed}
    function create_if_block$8(ctx) {
    	let current;
    	const content_slot_template = /*#slots*/ ctx[3].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[2], get_content_slot_context);

    	const block = {
    		c: function create() {
    			if (content_slot) content_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (content_slot) {
    				content_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (content_slot) {
    				if (content_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						content_slot,
    						content_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[2], dirty, get_content_slot_changes),
    						get_content_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (content_slot) content_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(20:4) {#if !collapsed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let icon_1;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	icon_1 = new Icon({
    			props: {
    				name: /*icon*/ ctx[1],
    				class: "collapse-icon"
    			},
    			$$inline: true
    		});

    	const header_slot_template = /*#slots*/ ctx[3].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[2], get_header_slot_context);
    	let if_block = !/*collapsed*/ ctx[0] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(icon_1.$$.fragment);
    			t0 = space();
    			if (header_slot) header_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "collapsible-header svelte-bsuje");
    			toggle_class(div0, "collapsed-header", /*collapsed*/ ctx[0]);
    			add_location(div0, file$a, 8, 4, 190);
    			attr_dev(div1, "class", "collapsible");
    			add_location(div1, file$a, 7, 0, 159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(icon_1, div0, null);
    			append_dev(div0, t0);

    			if (header_slot) {
    				header_slot.m(div0, null);
    			}

    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "mouseup", /*mouseup_handler*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 2) icon_1_changes.name = /*icon*/ ctx[1];
    			icon_1.$set(icon_1_changes);

    			if (header_slot) {
    				if (header_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[2], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*collapsed*/ 1) {
    				toggle_class(div0, "collapsed-header", /*collapsed*/ ctx[0]);
    			}

    			if (!/*collapsed*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
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
    			transition_in(icon_1.$$.fragment, local);
    			transition_in(header_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			transition_out(header_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(icon_1);
    			if (header_slot) header_slot.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
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
    	let icon;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Collapsible', slots, ['header','content']);
    	let { collapsed = false } = $$props;
    	const writable_props = ['collapsed'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Collapsible> was created with unknown prop '${key}'`);
    	});

    	const mouseup_handler = e => {
    		if (e.target.tagName !== "DIV" && e.target.tagName !== "H2" && e.target.tagName !== "H3" && e.target.tagName !== "H" || e.button !== 0) return;
    		$$invalidate(0, collapsed = !collapsed);
    	};

    	$$self.$$set = $$props => {
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Icon, collapsed, icon });

    	$$self.$inject_state = $$props => {
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*collapsed*/ 1) {
    			$$invalidate(1, icon = collapsed ? "chevron_right" : "chevron_down");
    		}
    	};

    	return [collapsed, icon, $$scope, slots, mouseup_handler];
    }

    class Collapsible extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { collapsed: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapsible",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get collapsed() {
    		throw new Error("<Collapsible>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<Collapsible>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\base\Select.svelte generated by Svelte v3.59.2 */
    const file$9 = "src\\components\\base\\Select.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (65:4) {#if label != undefined}
    function create_if_block_1$3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*label*/ ctx[0]);
    			attr_dev(span, "class", "input-label svelte-f4pt3d");
    			add_location(span, file$9, 65, 8, 1952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(65:4) {#if label != undefined}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if opened}
    function create_if_block$7(ctx) {
    	let div;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "select-options svelte-f4pt3d");
    			add_location(div, file$9, 71, 12, 2196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			/*div_binding*/ ctx[12](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleSelection, options*/ 130) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(71:8) {#if opened}",
    		ctx
    	});

    	return block;
    }

    // (73:16) {#each options as option, i}
    function create_each_block$5(ctx) {
    	let div;
    	let t0_value = /*option*/ ctx[16].display + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function mouseup_handler() {
    		return /*mouseup_handler*/ ctx[11](/*i*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "option svelte-f4pt3d");
    			add_location(div, file$9, 73, 20, 2320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "mouseup", mouseup_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*options*/ 2 && t0_value !== (t0_value = /*option*/ ctx[16].display + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(73:16) {#each options as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let t2;
    	let icon;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*label*/ ctx[0] != undefined && create_if_block_1$3(ctx);

    	icon = new Icon({
    			props: {
    				name: "chevron_down",
    				class: "select-chevron"
    			},
    			$$inline: true
    		});

    	let if_block1 = /*opened*/ ctx[3] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = text(/*formattedText*/ ctx[2]);
    			t2 = space();
    			create_component(icon.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "select-input svelte-f4pt3d");
    			add_location(div0, file$9, 67, 4, 2009);
    			attr_dev(div1, "class", "select svelte-f4pt3d");
    			toggle_class(div1, "unlabeled", /*label*/ ctx[0] == undefined);
    			add_location(div1, file$9, 59, 0, 1812);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			mount_component(icon, div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			/*div1_binding*/ ctx[14](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousedown", /*handleWindowClick*/ ctx[6], false, false, false, false),
    					listen_dev(div0, "mouseup", /*mouseup_handler_1*/ ctx[13], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[0] != undefined) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*formattedText*/ 4) set_data_dev(t1, /*formattedText*/ ctx[2]);

    			if (/*opened*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*label, undefined*/ 1) {
    				toggle_class(div1, "unlabeled", /*label*/ ctx[0] == undefined);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			destroy_component(icon);
    			if (if_block1) if_block1.d();
    			/*div1_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
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

    const defaultText = "Select...";

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Select', slots, []);
    	let { label = undefined } = $$props;
    	let { options } = $$props;
    	let { currentIndex = -1 } = $$props;
    	let { selectionMode = "single" } = $$props;
    	let { currentIndices = [] } = $$props;
    	let formattedText = defaultText;
    	let opened = false;
    	let selectElement;
    	let optionsElements;

    	function handleWindowClick(event) {
    		if (event.target.parentNode != selectElement && event.target.parentNode != optionsElements && opened) {
    			$$invalidate(3, opened = false);
    		}
    	}

    	function handleSelection(i) {
    		if (selectionMode === "multiple") {
    			const index = currentIndices.findIndex(x => x === i);

    			if (index === -1) {
    				$$invalidate(9, currentIndices = [...currentIndices, i]);
    			} else {
    				currentIndices.splice(index, 1);
    				$$invalidate(9, currentIndices);
    			}

    			dispatch("selectionChanged", {
    				values: options.filter((_val, idx, _arr) => currentIndices.findIndex(x => x === idx) !== -1)
    			});
    		} else {
    			$$invalidate(8, currentIndex = i);
    			dispatch("selectionChanged", { newValue: options[i] });
    		}
    	}

    	const dispatch = createEventDispatcher();

    	$$self.$$.on_mount.push(function () {
    		if (options === undefined && !('options' in $$props || $$self.$$.bound[$$self.$$.props['options']])) {
    			console.warn("<Select> was created without expected prop 'options'");
    		}
    	});

    	const writable_props = ['label', 'options', 'currentIndex', 'selectionMode', 'currentIndices'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	const mouseup_handler = i => handleSelection(i);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			optionsElements = $$value;
    			$$invalidate(5, optionsElements);
    		});
    	}

    	const mouseup_handler_1 = () => $$invalidate(3, opened = !opened);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			selectElement = $$value;
    			$$invalidate(4, selectElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('currentIndex' in $$props) $$invalidate(8, currentIndex = $$props.currentIndex);
    		if ('selectionMode' in $$props) $$invalidate(10, selectionMode = $$props.selectionMode);
    		if ('currentIndices' in $$props) $$invalidate(9, currentIndices = $$props.currentIndices);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Icon,
    		label,
    		options,
    		currentIndex,
    		selectionMode,
    		currentIndices,
    		defaultText,
    		formattedText,
    		opened,
    		selectElement,
    		optionsElements,
    		handleWindowClick,
    		handleSelection,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('currentIndex' in $$props) $$invalidate(8, currentIndex = $$props.currentIndex);
    		if ('selectionMode' in $$props) $$invalidate(10, selectionMode = $$props.selectionMode);
    		if ('currentIndices' in $$props) $$invalidate(9, currentIndices = $$props.currentIndices);
    		if ('formattedText' in $$props) $$invalidate(2, formattedText = $$props.formattedText);
    		if ('opened' in $$props) $$invalidate(3, opened = $$props.opened);
    		if ('selectElement' in $$props) $$invalidate(4, selectElement = $$props.selectElement);
    		if ('optionsElements' in $$props) $$invalidate(5, optionsElements = $$props.optionsElements);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectionMode, currentIndex, options, currentIndices*/ 1794) {
    			{
    				if (selectionMode === "single" && currentIndex >= 0) {
    					$$invalidate(2, formattedText = options[currentIndex].display);
    				} else if (selectionMode === "multiple" && currentIndices.length > 0) {
    					$$invalidate(2, formattedText = options.filter((_val, idx, _arr) => currentIndices.findIndex(x => x === idx) !== -1).map(x => x.display).join(", "));
    				} else {
    					$$invalidate(2, formattedText = defaultText);
    				}
    			}
    		}
    	};

    	return [
    		label,
    		options,
    		formattedText,
    		opened,
    		selectElement,
    		optionsElements,
    		handleWindowClick,
    		handleSelection,
    		currentIndex,
    		currentIndices,
    		selectionMode,
    		mouseup_handler,
    		div_binding,
    		mouseup_handler_1,
    		div1_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			label: 0,
    			options: 1,
    			currentIndex: 8,
    			selectionMode: 10,
    			currentIndices: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get label() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentIndex() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentIndex(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectionMode() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectionMode(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentIndices() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentIndices(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function handleOutEvent(event) {
        var _a, _b, _c;
        const val = event.target.value;
        var target_type = ((_a = event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("collapsible-header")[0]) === null || _a === void 0 ? void 0 : _a.getElementsByClassName("container-header")[0].getElementsByClassName("heading")[0].localName) || ((_c = (_b = event.currentTarget.parentNode.parentNode.parentNode.getElementsByClassName("container-header")[0]) === null || _b === void 0 ? void 0 : _b.getElementsByClassName("heading")[0]) === null || _c === void 0 ? void 0 : _c.localName) || event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("label")[0].localName;
        switch (target_type) {
            case "h2":
                target_type = "A Command";
                break;
            case "h3":
                target_type = "An Option";
                break;
            case "h4":
                target_type = "A Choice";
                break;
            case "undefined":
                target_type = "A Localized";
        }
        const target_name = String(event.target.name) || String(target_type);
        switch (target_name) {
            case "Name *":
                if (target_type !== "A Choice") {
                    if (val.match(/([^a-z0-9-_])+/g) || event.target.value.match(/(^$)/g)) {
                        showError(event, "error", `${target_type} Name is Required`);
                    }
                    else {
                        showError(event);
                    }
                }
                else {
                    if (val.match(/(^$)/g)) {
                        showError(event, "error", `${target_type} Name is Required`);
                    }
                    else if (val.replace(" ", "") == "") {
                        showError(event, "error", `${target_type} Name can not contain only Spaces`);
                    }
                    else {
                        showError(event);
                    }
                }
                break;
            case "Description *":
                if (!val) {
                    showError(event, "error", `${target_type} Description is Required`);
                }
                else if (val.replace(" ", "") == "") {
                    showError(event, "error", `${target_type} Description can not contain only Spaces`);
                }
                else {
                    showError(event);
                }
                break;
            case "GuildID":
                showError(event, "guildID");
                break;
            case "Value *":
                if (!val) {
                    showError(event, "error", `${target_type} Value is Required`);
                }
                else if (val.replace(" ", "") == "") {
                    showError(event, "error", `${target_type} Value can not contain only Spaces`);
                }
                else {
                    showError(event);
                }
                break;
            case "A Localized":
                if (!val) {
                    showError(event, "error", `${target_type} Translation is Required`);
                }
                else {
                    showError(event);
                }
                break;
            default:
                console.log(target_name);
                event.target.style.border = "2px solid var(--input-border)";
                break;
        }
    }
    function handleInEvent(event) {
        event.target.style.border = "2px solid var(--primary-color)";
    }
    function showError(event, type, message) {
        switch (type) {
            case "error":
                event.target.style.border = "2px solid red";
                event.target.style.borderBottom = "2px dotted red";
                event.target.style.borderBottomLeftRadius = 0;
                event.target.style.borderBottomRightRadius = 0;
                event.srcElement.nextElementSibling.style.borderTopLeftRadius = 0;
                event.srcElement.nextElementSibling.style.borderTopRightRadius = 0;
                event.srcElement.nextElementSibling.innerHTML = message;
                event.srcElement.nextElementSibling.hidden = false;
                break;
            case "guildID":
                event.target.style.border = "2px solid var(--input-border)";
                event.target.style.borderRadius = "0.5em";
                event.srcElement.nextElementSibling.hidden = true;
                break;
            default:
                event.target.style.border = "2px solid green";
                event.target.style.borderRadius = "0.5em";
                event.srcElement.nextElementSibling.hidden = true;
                break;
        }
    }

    /* src\components\base\Textbox.svelte generated by Svelte v3.59.2 */
    const file$8 = "src\\components\\base\\Textbox.svelte";

    // (106:4) {#if label != undefined}
    function create_if_block$6(ctx) {
    	let label_1;
    	let t;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(label_1, "class", "input-label svelte-g0yrrn");
    			attr_dev(label_1, "for", /*name*/ ctx[3]);
    			add_location(label_1, file$8, 106, 8, 4296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);

    			if (dirty & /*name*/ 8) {
    				attr_dev(label_1, "for", /*name*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(106:4) {#if label != undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let input;
    	let input_value_value;
    	let t1;
    	let div0;
    	let mounted;
    	let dispose;
    	let if_block = /*label*/ ctx[1] != undefined && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			input = element("input");
    			t1 = space();
    			div0 = element("div");
    			attr_dev(input, "type", /*html_input_type*/ ctx[2]);
    			input.value = input_value_value = /*value*/ ctx[0] ? /*value*/ ctx[0] : "";
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			attr_dev(input, "maxlength", /*maxlength*/ ctx[4]);
    			attr_dev(input, "class", "svelte-g0yrrn");
    			add_location(input, file$8, 109, 8, 4405);
    			div0.hidden = true;
    			attr_dev(div0, "class", "message svelte-g0yrrn");
    			add_location(div0, file$8, 118, 8, 4672);
    			attr_dev(div1, "class", "input-container svelte-g0yrrn");
    			add_location(div1, file$8, 108, 4, 4366);
    			attr_dev(div2, "class", "input-group svelte-g0yrrn");
    			toggle_class(div2, "unlabeled", /*label*/ ctx[1] == undefined);
    			add_location(div2, file$8, 104, 0, 4194);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*handleInput*/ ctx[5], false, false, false, false),
    					listen_dev(input, "focusout", handleOutEvent, false, false, false, false),
    					listen_dev(input, "focusin", handleInEvent, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[1] != undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div2, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*html_input_type*/ 4) {
    				attr_dev(input, "type", /*html_input_type*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1 && input_value_value !== (input_value_value = /*value*/ ctx[0] ? /*value*/ ctx[0] : "") && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(input, "name", /*name*/ ctx[3]);
    			}

    			if (dirty & /*maxlength*/ 16) {
    				attr_dev(input, "maxlength", /*maxlength*/ ctx[4]);
    			}

    			if (dirty & /*label, undefined*/ 2) {
    				toggle_class(div2, "unlabeled", /*label*/ ctx[1] == undefined);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('Textbox', slots, []);
    	let { label = undefined } = $$props;
    	let { value } = $$props;
    	let { html_input_type = "text" } = $$props;
    	let { input_type = undefined } = $$props;
    	let { name = label } = $$props;
    	let { maxlength = -1 } = $$props;

    	function handleInput(event) {
    		var _a, _b, _c;
    		const val = event.target.value;

    		var target_type = ((_a = event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("collapsible-header")[0]) === null || _a === void 0
    		? void 0
    		: _a.getElementsByClassName("container-header")[0].getElementsByClassName("heading")[0].localName) || ((_c = (_b = event.currentTarget.parentNode.parentNode.parentNode.getElementsByClassName("container-header")[0]) === null || _b === void 0
    		? void 0
    		: _b.getElementsByClassName("heading")[0]) === null || _c === void 0
    		? void 0
    		: _c.localName) || event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("label")[0].localName;

    		switch (target_type) {
    			case "h2":
    				target_type = "A Command";
    				break;
    			case "h3":
    				target_type = "An Option";
    				break;
    			case "h4":
    				target_type = "A Choice";
    				break;
    			case "undefined":
    				target_type = "A Localized";
    		}

    		const target_name = String(event.target.name) || String(target_type);

    		switch (target_name) {
    			case "Name *":
    				if (target_type !== "A Choice") {
    					if (val.match(/(^$)/g)) {
    						showError(event, "error", `${target_type} Name is Required`);
    					} else if (val.match(/([A-Z])/g)) {
    						showError(event, "error", `${target_type} Name can not contain Capital Letters`);
    					} else if (val.match(/([^a-z0-9-_])/g)) {
    						showError(event, "error", `${target_type} Name can only contain Letters, Numbers, Underscores and Dashes`);
    					} else {
    						showError(event);
    					}
    				} else {
    					if (val.match(/(^$)/g)) {
    						showError(event, "error", `${target_type} Name is Required`);
    					} else if (val.replaceAll(" ", "") == "") {
    						showError(event, "error", `${target_type} Name can not contain only Spaces`);
    					} else {
    						showError(event);
    					}
    				}
    				break;
    			case "Description *":
    				if (!val) {
    					showError(event, "error", `${target_type} Description is Required`);
    				} else if (val.replaceAll(" ", "") == "") {
    					showError(event, "error", `${target_type} Description can not contain only Spaces`);
    				} else {
    					showError(event);
    				}
    				break;
    			case "GuildID":
    				if (!val.match(/([0-9])+/g) && val !== " ") {
    					showError(event, "error", "A Guild ID consists of only Numbers");
    				} else {
    					showError(event, "guildID");
    				}
    				break;
    			case "Value *":
    				if (!val) {
    					showError(event, "error", `${target_type} Value is Required`);
    				} else if (val.replaceAll(" ", "") == "") {
    					showError(event, "error", `${target_type} Value can not contain only Spaces`);
    				} else {
    					showError(event);
    				}
    				break;
    			case "A Localized":
    				if (!val) {
    					showError(event, "error", `${target_type} Translation is Required`);
    				} else {
    					showError(event);
    				}
    				break;
    		}

    		if (input_type === "integer") {
    			$$invalidate(0, value = parseInt(val));
    		} else if (input_type === "float") {
    			$$invalidate(0, value = parseFloat(val));
    		} else {
    			$$invalidate(0, value = val);
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<Textbox> was created without expected prop 'value'");
    		}
    	});

    	const writable_props = ['label', 'value', 'html_input_type', 'input_type', 'name', 'maxlength'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Textbox> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('html_input_type' in $$props) $$invalidate(2, html_input_type = $$props.html_input_type);
    		if ('input_type' in $$props) $$invalidate(6, input_type = $$props.input_type);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('maxlength' in $$props) $$invalidate(4, maxlength = $$props.maxlength);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		value,
    		html_input_type,
    		input_type,
    		name,
    		maxlength,
    		handleInEvent,
    		handleOutEvent,
    		showError,
    		handleInput
    	});

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('html_input_type' in $$props) $$invalidate(2, html_input_type = $$props.html_input_type);
    		if ('input_type' in $$props) $$invalidate(6, input_type = $$props.input_type);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('maxlength' in $$props) $$invalidate(4, maxlength = $$props.maxlength);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, label, html_input_type, name, maxlength, handleInput, input_type];
    }

    class Textbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			label: 1,
    			value: 0,
    			html_input_type: 2,
    			input_type: 6,
    			name: 3,
    			maxlength: 4,
    			handleInput: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Textbox",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get label() {
    		throw new Error("<Textbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Textbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Textbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Textbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get html_input_type() {
    		throw new Error("<Textbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set html_input_type(value) {
    		throw new Error("<Textbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input_type() {
    		throw new Error("<Textbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input_type(value) {
    		throw new Error("<Textbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Textbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Textbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxlength() {
    		throw new Error("<Textbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxlength(value) {
    		throw new Error("<Textbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleInput() {
    		return this.$$.ctx[5];
    	}

    	set handleInput(value) {
    		throw new Error("<Textbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CommandOptionChoice.svelte generated by Svelte v3.59.2 */
    const file$7 = "src\\components\\CommandOptionChoice.svelte";

    function create_fragment$7(ctx) {
    	let div2;
    	let div1;
    	let h4;
    	let t1;
    	let div0;
    	let icon;
    	let t2;
    	let textbox0;
    	let updating_value;
    	let t3;
    	let textbox1;
    	let updating_value_1;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: { name: "delete", class: "delete-icon" },
    			$$inline: true
    		});

    	function textbox0_value_binding(value) {
    		/*textbox0_value_binding*/ ctx[5](value);
    	}

    	let textbox0_props = { label: "Name *" };

    	if (/*choice*/ ctx[0].name !== void 0) {
    		textbox0_props.value = /*choice*/ ctx[0].name;
    	}

    	textbox0 = new Textbox({ props: textbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox0, 'value', textbox0_value_binding));

    	function textbox1_value_binding(value) {
    		/*textbox1_value_binding*/ ctx[6](value);
    	}

    	let textbox1_props = {
    		label: "Value *",
    		input_type: /*input_type*/ ctx[1]
    	};

    	if (/*choice*/ ctx[0].value !== void 0) {
    		textbox1_props.value = /*choice*/ ctx[0].value;
    	}

    	textbox1 = new Textbox({ props: textbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox1, 'value', textbox1_value_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Choice";
    			t1 = space();
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			t2 = space();
    			create_component(textbox0.$$.fragment);
    			t3 = space();
    			create_component(textbox1.$$.fragment);
    			attr_dev(h4, "class", "heading");
    			add_location(h4, file$7, 22, 8, 721);
    			attr_dev(div0, "class", "delete-icon-wrapper");
    			add_location(div0, file$7, 23, 8, 762);
    			attr_dev(div1, "class", "container-header");
    			add_location(div1, file$7, 21, 4, 681);
    			attr_dev(div2, "class", "command-choice-container svelte-6n3z0y");
    			add_location(div2, file$7, 20, 0, 637);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h4);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(icon, div0, null);
    			append_dev(div2, t2);
    			mount_component(textbox0, div2, null);
    			append_dev(div2, t3);
    			mount_component(textbox1, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[4], false, false, false, false),
    					listen_dev(div0, "keyup", keyup_handler$3, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const textbox0_changes = {};

    			if (!updating_value && dirty & /*choice*/ 1) {
    				updating_value = true;
    				textbox0_changes.value = /*choice*/ ctx[0].name;
    				add_flush_callback(() => updating_value = false);
    			}

    			textbox0.$set(textbox0_changes);
    			const textbox1_changes = {};
    			if (dirty & /*input_type*/ 2) textbox1_changes.input_type = /*input_type*/ ctx[1];

    			if (!updating_value_1 && dirty & /*choice*/ 1) {
    				updating_value_1 = true;
    				textbox1_changes.value = /*choice*/ ctx[0].value;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textbox1.$set(textbox1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			transition_in(textbox0.$$.fragment, local);
    			transition_in(textbox1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			transition_out(textbox0.$$.fragment, local);
    			transition_out(textbox1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(icon);
    			destroy_component(textbox0);
    			destroy_component(textbox1);
    			mounted = false;
    			run_all(dispose);
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

    const keyup_handler$3 = () => {
    	
    };

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CommandOptionChoice', slots, []);
    	let { choice } = $$props;
    	let { optionType } = $$props;
    	const dispatch = createEventDispatcher();
    	let input_type;

    	$$self.$$.on_mount.push(function () {
    		if (choice === undefined && !('choice' in $$props || $$self.$$.bound[$$self.$$.props['choice']])) {
    			console.warn("<CommandOptionChoice> was created without expected prop 'choice'");
    		}

    		if (optionType === undefined && !('optionType' in $$props || $$self.$$.bound[$$self.$$.props['optionType']])) {
    			console.warn("<CommandOptionChoice> was created without expected prop 'optionType'");
    		}
    	});

    	const writable_props = ['choice', 'optionType'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CommandOptionChoice> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("remove");

    	function textbox0_value_binding(value) {
    		if ($$self.$$.not_equal(choice.name, value)) {
    			choice.name = value;
    			$$invalidate(0, choice);
    		}
    	}

    	function textbox1_value_binding(value) {
    		if ($$self.$$.not_equal(choice.value, value)) {
    			choice.value = value;
    			$$invalidate(0, choice);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('choice' in $$props) $$invalidate(0, choice = $$props.choice);
    		if ('optionType' in $$props) $$invalidate(3, optionType = $$props.optionType);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ApplicationCommandOptionType,
    		Textbox,
    		Icon,
    		choice,
    		optionType,
    		dispatch,
    		input_type
    	});

    	$$self.$inject_state = $$props => {
    		if ('choice' in $$props) $$invalidate(0, choice = $$props.choice);
    		if ('optionType' in $$props) $$invalidate(3, optionType = $$props.optionType);
    		if ('input_type' in $$props) $$invalidate(1, input_type = $$props.input_type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*optionType*/ 8) {
    			switch (optionType) {
    				case ApplicationCommandOptionType.STRING:
    					$$invalidate(1, input_type = undefined);
    					break;
    				case ApplicationCommandOptionType.INTEGER:
    					$$invalidate(1, input_type = "integer");
    					break;
    				case ApplicationCommandOptionType.NUMBER:
    					$$invalidate(1, input_type = "float");
    			}
    		}
    	};

    	return [
    		choice,
    		input_type,
    		dispatch,
    		optionType,
    		click_handler,
    		textbox0_value_binding,
    		textbox1_value_binding
    	];
    }

    class CommandOptionChoice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { choice: 0, optionType: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CommandOptionChoice",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get choice() {
    		throw new Error("<CommandOptionChoice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choice(value) {
    		throw new Error("<CommandOptionChoice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionType() {
    		throw new Error("<CommandOptionChoice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionType(value) {
    		throw new Error("<CommandOptionChoice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Localization.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1$3 } = globals;
    const file$6 = "src\\components\\Localization.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (50:8) {#if keys}
    function create_if_block$5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*keys*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*deleteLocale, keys, localizations, locales, locale_keys, selectionChanged*/ 111) {
    				each_value = /*keys*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(50:8) {#if keys}",
    		ctx
    	});

    	return block;
    }

    // (51:12) {#each keys as locale}
    function create_each_block$4(ctx) {
    	let div1;
    	let select;
    	let t0;
    	let textbox;
    	let updating_value;
    	let t1;
    	let div0;
    	let icon;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;

    	function func(...args) {
    		return /*func*/ ctx[7](/*locale*/ ctx[12], ...args);
    	}

    	function selectionChanged_handler(...args) {
    		return /*selectionChanged_handler*/ ctx[8](/*locale*/ ctx[12], ...args);
    	}

    	select = new Select({
    			props: {
    				options: /*locales*/ ctx[2],
    				currentIndex: /*locale_keys*/ ctx[3].findIndex(func)
    			},
    			$$inline: true
    		});

    	select.$on("selectionChanged", selectionChanged_handler);

    	function textbox_value_binding(value) {
    		/*textbox_value_binding*/ ctx[9](value, /*locale*/ ctx[12]);
    	}

    	let textbox_props = {};

    	if (/*localizations*/ ctx[0][/*locale*/ ctx[12]] !== void 0) {
    		textbox_props.value = /*localizations*/ ctx[0][/*locale*/ ctx[12]];
    	}

    	textbox = new Textbox({ props: textbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox, 'value', textbox_value_binding));

    	icon = new Icon({
    			props: { name: "delete", class: "btn-icon" },
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*locale*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(select.$$.fragment);
    			t0 = space();
    			create_component(textbox.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			t2 = space();
    			attr_dev(div0, "class", "delete-locale svelte-1ro3vwp");
    			add_location(div0, file$6, 61, 20, 2054);
    			attr_dev(div1, "class", "locale svelte-1ro3vwp");
    			add_location(div1, file$6, 51, 16, 1590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(select, div1, null);
    			append_dev(div1, t0);
    			mount_component(textbox, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(icon, div0, null);
    			append_dev(div1, t2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", click_handler, false, false, false, false),
    					listen_dev(div0, "keyup", keyup_handler$2, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const select_changes = {};
    			if (dirty & /*keys*/ 2) select_changes.currentIndex = /*locale_keys*/ ctx[3].findIndex(func);
    			select.$set(select_changes);
    			const textbox_changes = {};

    			if (!updating_value && dirty & /*localizations, keys*/ 3) {
    				updating_value = true;
    				textbox_changes.value = /*localizations*/ ctx[0][/*locale*/ ctx[12]];
    				add_flush_callback(() => updating_value = false);
    			}

    			textbox.$set(textbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			transition_in(textbox.$$.fragment, local);
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			transition_out(textbox.$$.fragment, local);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(select);
    			destroy_component(textbox);
    			destroy_component(icon);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(51:12) {#each keys as locale}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let span;
    	let t1;
    	let div0;
    	let t2;
    	let button;
    	let icon;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*keys*/ ctx[1] && create_if_block$5(ctx);

    	icon = new Icon({
    			props: { name: "add", class: "btn-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "Localization";
    			t1 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t3 = text("Add Localization");
    			attr_dev(span, "class", "label svelte-1ro3vwp");
    			add_location(span, file$6, 47, 4, 1444);
    			attr_dev(button, "class", "btn-text svelte-1ro3vwp");
    			add_location(button, file$6, 71, 8, 2399);
    			attr_dev(div0, "class", "localizations svelte-1ro3vwp");
    			add_location(div0, file$6, 48, 4, 1489);
    			attr_dev(div1, "class", "localization-input svelte-1ro3vwp");
    			add_location(div1, file$6, 46, 0, 1406);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t2);
    			append_dev(div0, button);
    			mount_component(icon, button, null);
    			append_dev(button, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addLocale*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*keys*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*keys*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t2);
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
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			destroy_component(icon);
    			mounted = false;
    			dispose();
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

    const keyup_handler$2 = () => {
    	
    };

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Localization', slots, []);
    	let { localizations } = $$props;
    	let keys;
    	const locales = [];
    	const locale_keys = [];
    	const entries = Object.entries(Locale);

    	for (let commandType of entries) {
    		locale_keys.push(commandType[1]);
    		let display = commandType[0].toLowerCase();
    		const split = display.split("_");
    		display = split.map(str => str[0].toUpperCase() + str.slice(1)).join(" ");
    		locales.push({ display, value: commandType[1] });
    	}

    	function addLocale() {
    		if (!localizations) {
    			$$invalidate(0, localizations = {});
    		}

    		const index = keys ? keys.length : 0;
    		$$invalidate(0, localizations[locales[index].value] = "", localizations);
    	}

    	function selectionChanged(event, locale) {
    		$$invalidate(0, localizations = Object.fromEntries(Object.entries(localizations).map(([key, value]) => {
    			if (key === locale) {
    				return [event.detail.newValue.value, value];
    			}

    			return [key, value];
    		})));
    	}

    	function deleteLocale(locale) {
    		$$invalidate(0, localizations = Object.fromEntries(Object.entries(localizations).filter(([key, _]) => key !== locale)));
    	}

    	if (!localizations) localizations = {};

    	$$self.$$.on_mount.push(function () {
    		if (localizations === undefined && !('localizations' in $$props || $$self.$$.bound[$$self.$$.props['localizations']])) {
    			console.warn("<Localization> was created without expected prop 'localizations'");
    		}
    	});

    	const writable_props = ['localizations'];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Localization> was created with unknown prop '${key}'`);
    	});

    	const func = (locale, l) => l === locale;
    	const selectionChanged_handler = (locale, event) => selectionChanged(event, locale);

    	function textbox_value_binding(value, locale) {
    		if ($$self.$$.not_equal(localizations[locale], value)) {
    			localizations[locale] = value;
    			$$invalidate(0, localizations);
    		}
    	}

    	const click_handler = locale => deleteLocale(locale);

    	$$self.$$set = $$props => {
    		if ('localizations' in $$props) $$invalidate(0, localizations = $$props.localizations);
    	};

    	$$self.$capture_state = () => ({
    		Locale,
    		Select,
    		Textbox,
    		Icon,
    		localizations,
    		keys,
    		locales,
    		locale_keys,
    		entries,
    		addLocale,
    		selectionChanged,
    		deleteLocale
    	});

    	$$self.$inject_state = $$props => {
    		if ('localizations' in $$props) $$invalidate(0, localizations = $$props.localizations);
    		if ('keys' in $$props) $$invalidate(1, keys = $$props.keys);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*localizations*/ 1) {
    			if (localizations) {
    				$$invalidate(1, keys = Object.keys(localizations));
    			}
    		}
    	};

    	return [
    		localizations,
    		keys,
    		locales,
    		locale_keys,
    		addLocale,
    		selectionChanged,
    		deleteLocale,
    		func,
    		selectionChanged_handler,
    		textbox_value_binding,
    		click_handler
    	];
    }

    class Localization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { localizations: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Localization",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get localizations() {
    		throw new Error("<Localization>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set localizations(value) {
    		throw new Error("<Localization>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CommandOption.svelte generated by Svelte v3.59.2 */

    const { Boolean: Boolean_1$1, Object: Object_1$2 } = globals;
    const file$5 = "src\\components\\CommandOption.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[28] = list;
    	child_ctx[29] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	child_ctx[29] = i;
    	return child_ctx;
    }

    // (102:8) 
    function create_header_slot$1(ctx) {
    	let div1;
    	let h3;
    	let t0_value = (/*option*/ ctx[0].name || "Option") + "";
    	let t0;
    	let t1;
    	let div0;
    	let icon;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: { name: "delete", class: "delete-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			attr_dev(h3, "class", "heading");
    			add_location(h3, file$5, 102, 12, 4222);
    			attr_dev(div0, "class", "delete-icon-wrapper");
    			add_location(div0, file$5, 103, 12, 4286);
    			attr_dev(div1, "class", "container-header svelte-p664fs");
    			attr_dev(div1, "slot", "header");
    			add_location(div1, file$5, 101, 8, 4164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(icon, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[24], false, false, false, false),
    					listen_dev(div0, "keyup", keyup_handler$1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*option*/ 1) && t0_value !== (t0_value = (/*option*/ ctx[0].name || "Option") + "")) set_data_dev(t0, t0_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(icon);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot$1.name,
    		type: "slot",
    		source: "(102:8) ",
    		ctx
    	});

    	return block;
    }

    // (121:16) {#if advanced}
    function create_if_block_9$1(ctx) {
    	let localization;
    	let updating_localizations;
    	let current;

    	function localization_localizations_binding(value) {
    		/*localization_localizations_binding*/ ctx[12](value);
    	}

    	let localization_props = {};

    	if (/*option*/ ctx[0].name_localizations !== void 0) {
    		localization_props.localizations = /*option*/ ctx[0].name_localizations;
    	}

    	localization = new Localization({
    			props: localization_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(localization, 'localizations', localization_localizations_binding));

    	const block = {
    		c: function create() {
    			create_component(localization.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(localization, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const localization_changes = {};

    			if (!updating_localizations && dirty[0] & /*option*/ 1) {
    				updating_localizations = true;
    				localization_changes.localizations = /*option*/ ctx[0].name_localizations;
    				add_flush_callback(() => updating_localizations = false);
    			}

    			localization.$set(localization_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(localization.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(localization.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(localization, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(121:16) {#if advanced}",
    		ctx
    	});

    	return block;
    }

    // (129:16) {#if advanced}
    function create_if_block_8$1(ctx) {
    	let localization;
    	let updating_localizations;
    	let current;

    	function localization_localizations_binding_1(value) {
    		/*localization_localizations_binding_1*/ ctx[14](value);
    	}

    	let localization_props = {};

    	if (/*option*/ ctx[0].description_localizations !== void 0) {
    		localization_props.localizations = /*option*/ ctx[0].description_localizations;
    	}

    	localization = new Localization({
    			props: localization_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(localization, 'localizations', localization_localizations_binding_1));

    	const block = {
    		c: function create() {
    			create_component(localization.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(localization, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const localization_changes = {};

    			if (!updating_localizations && dirty[0] & /*option*/ 1) {
    				updating_localizations = true;
    				localization_changes.localizations = /*option*/ ctx[0].description_localizations;
    				add_flush_callback(() => updating_localizations = false);
    			}

    			localization.$set(localization_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(localization.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(localization.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(localization, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(129:16) {#if advanced}",
    		ctx
    	});

    	return block;
    }

    // (139:12) {#if option.type === ApplicationCommandOptionType.SUB_COMMAND || option.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP}
    function create_if_block_6$1(ctx) {
    	let t0;
    	let div;
    	let button;
    	let icon;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*option*/ ctx[0].options && create_if_block_7$1(ctx);

    	icon = new Icon({
    			props: { name: "add", class: "btn-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t1 = text("Add Option");
    			add_location(button, file$5, 155, 20, 6503);
    			attr_dev(div, "class", "button-bar");
    			add_location(div, file$5, 154, 16, 6457);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			mount_component(icon, button, null);
    			append_dev(button, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addOption*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*option*/ ctx[0].options) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*option*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_7$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
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
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(139:12) {#if option.type === ApplicationCommandOptionType.SUB_COMMAND || option.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP}",
    		ctx
    	});

    	return block;
    }

    // (140:16) {#if option.options}
    function create_if_block_7$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*option*/ ctx[0].options;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*option*/ 1) {
    				each_value_1 = /*option*/ ctx[0].options;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean_1$1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(140:16) {#if option.options}",
    		ctx
    	});

    	return block;
    }

    // (141:20) {#each option.options as child_option, i}
    function create_each_block_1$2(ctx) {
    	let commandoption;
    	let current;

    	function remove_handler() {
    		return /*remove_handler*/ ctx[17](/*i*/ ctx[29]);
    	}

    	commandoption = new CommandOption({
    			props: { option: /*child_option*/ ctx[30] },
    			$$inline: true
    		});

    	commandoption.$on("remove", remove_handler);

    	const block = {
    		c: function create() {
    			create_component(commandoption.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(commandoption, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const commandoption_changes = {};
    			if (dirty[0] & /*option*/ 1) commandoption_changes.option = /*child_option*/ ctx[30];
    			commandoption.$set(commandoption_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(commandoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(commandoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(commandoption, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(141:20) {#each option.options as child_option, i}",
    		ctx
    	});

    	return block;
    }

    // (161:12) {#if option.type === ApplicationCommandOptionType.CHANNEL}
    function create_if_block_5$1(ctx) {
    	let select;
    	let current;

    	select = new Select({
    			props: {
    				label: "Channel Type",
    				options: /*channelTypes*/ ctx[7],
    				selectionMode: "multiple"
    			},
    			$$inline: true
    		});

    	select.$on("selectionChanged", /*handleChannelTypeSelectionChanged*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(161:12) {#if option.type === ApplicationCommandOptionType.CHANNEL}",
    		ctx
    	});

    	return block;
    }

    // (169:12) {#if option.type === ApplicationCommandOptionType.NUMBER || option.type === ApplicationCommandOptionType.INTEGER}
    function create_if_block_4$2(ctx) {
    	let textbox0;
    	let updating_value;
    	let t;
    	let textbox1;
    	let updating_value_1;
    	let current;

    	function textbox0_value_binding_1(value) {
    		/*textbox0_value_binding_1*/ ctx[18](value);
    	}

    	let textbox0_props = {
    		label: "Min Value",
    		input_type: /*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER
    		? "integer"
    		: "float"
    	};

    	if (/*option*/ ctx[0].min_value !== void 0) {
    		textbox0_props.value = /*option*/ ctx[0].min_value;
    	}

    	textbox0 = new Textbox({ props: textbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox0, 'value', textbox0_value_binding_1));

    	function textbox1_value_binding_1(value) {
    		/*textbox1_value_binding_1*/ ctx[19](value);
    	}

    	let textbox1_props = {
    		label: "Max Value",
    		input_type: /*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER
    		? "integer"
    		: "float"
    	};

    	if (/*option*/ ctx[0].max_value !== void 0) {
    		textbox1_props.value = /*option*/ ctx[0].max_value;
    	}

    	textbox1 = new Textbox({ props: textbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox1, 'value', textbox1_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(textbox0.$$.fragment);
    			t = space();
    			create_component(textbox1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textbox0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(textbox1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textbox0_changes = {};

    			if (dirty[0] & /*option*/ 1) textbox0_changes.input_type = /*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER
    			? "integer"
    			: "float";

    			if (!updating_value && dirty[0] & /*option*/ 1) {
    				updating_value = true;
    				textbox0_changes.value = /*option*/ ctx[0].min_value;
    				add_flush_callback(() => updating_value = false);
    			}

    			textbox0.$set(textbox0_changes);
    			const textbox1_changes = {};

    			if (dirty[0] & /*option*/ 1) textbox1_changes.input_type = /*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER
    			? "integer"
    			: "float";

    			if (!updating_value_1 && dirty[0] & /*option*/ 1) {
    				updating_value_1 = true;
    				textbox1_changes.value = /*option*/ ctx[0].max_value;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textbox1.$set(textbox1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textbox0.$$.fragment, local);
    			transition_in(textbox1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textbox0.$$.fragment, local);
    			transition_out(textbox1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textbox0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(textbox1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(169:12) {#if option.type === ApplicationCommandOptionType.NUMBER || option.type === ApplicationCommandOptionType.INTEGER}",
    		ctx
    	});

    	return block;
    }

    // (187:12) {#if option.type === ApplicationCommandOptionType.NUMBER || option.type === ApplicationCommandOptionType.INTEGER || option.type === ApplicationCommandOptionType.STRING}
    function create_if_block$4(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let button;
    	let icon;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*option*/ ctx[0].choices && create_if_block_3$2(ctx);
    	let if_block1 = (/*option*/ ctx[0].choices == undefined || /*option*/ ctx[0].choices.length == 0) && create_if_block_1$2(ctx);

    	icon = new Icon({
    			props: { name: "add", class: "btn-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div = element("div");
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t2 = text("Add Option Choice");
    			add_location(button, file$5, 215, 20, 9270);
    			attr_dev(div, "class", "button-bar");
    			add_location(div, file$5, 214, 16, 9224);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			mount_component(icon, button, null);
    			append_dev(button, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addOptionChoice*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*option*/ ctx[0].choices) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*option*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*option*/ ctx[0].choices == undefined || /*option*/ ctx[0].choices.length == 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*option*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(187:12) {#if option.type === ApplicationCommandOptionType.NUMBER || option.type === ApplicationCommandOptionType.INTEGER || option.type === ApplicationCommandOptionType.STRING}",
    		ctx
    	});

    	return block;
    }

    // (189:16) {#if option.choices}
    function create_if_block_3$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*option*/ ctx[0].choices;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "option-choice-list svelte-p664fs");
    			add_location(div, file$5, 189, 20, 8043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*option*/ 1) {
    				each_value = /*option*/ ctx[0].choices;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean_1$1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(189:16) {#if option.choices}",
    		ctx
    	});

    	return block;
    }

    // (191:24) {#each option.choices as choice, i}
    function create_each_block$3(ctx) {
    	let commandoptionchoice;
    	let updating_choice;
    	let updating_optionType;
    	let current;

    	function commandoptionchoice_choice_binding(value) {
    		/*commandoptionchoice_choice_binding*/ ctx[20](value, /*choice*/ ctx[27], /*each_value*/ ctx[28], /*i*/ ctx[29]);
    	}

    	function commandoptionchoice_optionType_binding(value) {
    		/*commandoptionchoice_optionType_binding*/ ctx[21](value);
    	}

    	function remove_handler_1() {
    		return /*remove_handler_1*/ ctx[22](/*i*/ ctx[29]);
    	}

    	let commandoptionchoice_props = {};

    	if (/*choice*/ ctx[27] !== void 0) {
    		commandoptionchoice_props.choice = /*choice*/ ctx[27];
    	}

    	if (/*option*/ ctx[0].type !== void 0) {
    		commandoptionchoice_props.optionType = /*option*/ ctx[0].type;
    	}

    	commandoptionchoice = new CommandOptionChoice({
    			props: commandoptionchoice_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(commandoptionchoice, 'choice', commandoptionchoice_choice_binding));
    	binding_callbacks.push(() => bind(commandoptionchoice, 'optionType', commandoptionchoice_optionType_binding));
    	commandoptionchoice.$on("remove", remove_handler_1);

    	const block = {
    		c: function create() {
    			create_component(commandoptionchoice.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(commandoptionchoice, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const commandoptionchoice_changes = {};

    			if (!updating_choice && dirty[0] & /*option*/ 1) {
    				updating_choice = true;
    				commandoptionchoice_changes.choice = /*choice*/ ctx[27];
    				add_flush_callback(() => updating_choice = false);
    			}

    			if (!updating_optionType && dirty[0] & /*option*/ 1) {
    				updating_optionType = true;
    				commandoptionchoice_changes.optionType = /*option*/ ctx[0].type;
    				add_flush_callback(() => updating_optionType = false);
    			}

    			commandoptionchoice.$set(commandoptionchoice_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(commandoptionchoice.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(commandoptionchoice.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(commandoptionchoice, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(191:24) {#each option.choices as choice, i}",
    		ctx
    	});

    	return block;
    }

    // (207:16) {#if option.choices == undefined || option.choices.length == 0}
    function create_if_block_1$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*advanced*/ ctx[2] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*advanced*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*advanced*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(207:16) {#if option.choices == undefined || option.choices.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (208:20) {#if advanced}
    function create_if_block_2$2(ctx) {
    	let checkbox;
    	let updating_value;
    	let current;

    	function checkbox_value_binding(value) {
    		/*checkbox_value_binding*/ ctx[23](value);
    	}

    	let checkbox_props = { label: "Autocomplete" };

    	if (/*option*/ ctx[0].autocomplete !== void 0) {
    		checkbox_props.value = /*option*/ ctx[0].autocomplete;
    	}

    	checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, 'value', checkbox_value_binding));

    	const block = {
    		c: function create() {
    			create_component(checkbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};

    			if (!updating_value && dirty[0] & /*option*/ 1) {
    				updating_value = true;
    				checkbox_changes.value = /*option*/ ctx[0].autocomplete;
    				add_flush_callback(() => updating_value = false);
    			}

    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(208:20) {#if advanced}",
    		ctx
    	});

    	return block;
    }

    // (113:8) 
    function create_content_slot$1(ctx) {
    	let div1;
    	let div0;
    	let checkbox0;
    	let updating_value;
    	let t0;
    	let textbox0;
    	let updating_value_1;
    	let t1;
    	let t2;
    	let textbox1;
    	let updating_value_2;
    	let t3;
    	let t4;
    	let checkbox1;
    	let updating_value_3;
    	let t5;
    	let select;
    	let updating_currentIndex;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let current;

    	function checkbox0_value_binding(value) {
    		/*checkbox0_value_binding*/ ctx[10](value);
    	}

    	let checkbox0_props = { label: "Advanced Options" };

    	if (/*advanced*/ ctx[2] !== void 0) {
    		checkbox0_props.value = /*advanced*/ ctx[2];
    	}

    	checkbox0 = new Checkbox({ props: checkbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox0, 'value', checkbox0_value_binding));

    	function textbox0_value_binding(value) {
    		/*textbox0_value_binding*/ ctx[11](value);
    	}

    	let textbox0_props = { label: "Name *", maxlength: 32 };

    	if (/*option*/ ctx[0].name !== void 0) {
    		textbox0_props.value = /*option*/ ctx[0].name;
    	}

    	textbox0 = new Textbox({ props: textbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox0, 'value', textbox0_value_binding));
    	let if_block0 = /*advanced*/ ctx[2] && create_if_block_9$1(ctx);

    	function textbox1_value_binding(value) {
    		/*textbox1_value_binding*/ ctx[13](value);
    	}

    	let textbox1_props = { label: "Description *", maxlength: 100 };

    	if (/*option*/ ctx[0].description !== void 0) {
    		textbox1_props.value = /*option*/ ctx[0].description;
    	}

    	textbox1 = new Textbox({ props: textbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox1, 'value', textbox1_value_binding));
    	let if_block1 = /*advanced*/ ctx[2] && create_if_block_8$1(ctx);

    	function checkbox1_value_binding(value) {
    		/*checkbox1_value_binding*/ ctx[15](value);
    	}

    	let checkbox1_props = { label: "Required" };

    	if (/*option*/ ctx[0].required !== void 0) {
    		checkbox1_props.value = /*option*/ ctx[0].required;
    	}

    	checkbox1 = new Checkbox({ props: checkbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox1, 'value', checkbox1_value_binding));

    	function select_currentIndex_binding(value) {
    		/*select_currentIndex_binding*/ ctx[16](value);
    	}

    	let select_props = {
    		label: "Type",
    		options: /*commandOptionTypes*/ ctx[6]
    	};

    	if (/*defaultOptionType*/ ctx[1] !== void 0) {
    		select_props.currentIndex = /*defaultOptionType*/ ctx[1];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, 'currentIndex', select_currentIndex_binding));
    	let if_block2 = (/*option*/ ctx[0].type === ApplicationCommandOptionType.SUB_COMMAND || /*option*/ ctx[0].type === ApplicationCommandOptionType.SUB_COMMAND_GROUP) && create_if_block_6$1(ctx);
    	let if_block3 = /*option*/ ctx[0].type === ApplicationCommandOptionType.CHANNEL && create_if_block_5$1(ctx);
    	let if_block4 = (/*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER || /*option*/ ctx[0].type === ApplicationCommandOptionType.INTEGER) && create_if_block_4$2(ctx);
    	let if_block5 = (/*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER || /*option*/ ctx[0].type === ApplicationCommandOptionType.INTEGER || /*option*/ ctx[0].type === ApplicationCommandOptionType.STRING) && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(checkbox0.$$.fragment);
    			t0 = space();
    			create_component(textbox0.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			create_component(textbox1.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			create_component(checkbox1.$$.fragment);
    			t5 = space();
    			create_component(select.$$.fragment);
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			if (if_block3) if_block3.c();
    			t8 = space();
    			if (if_block4) if_block4.c();
    			t9 = space();
    			if (if_block5) if_block5.c();
    			attr_dev(div0, "class", "command-option-info");
    			add_location(div0, file$5, 114, 12, 4602);
    			attr_dev(div1, "class", "content svelte-p664fs");
    			attr_dev(div1, "slot", "content");
    			add_location(div1, file$5, 112, 8, 4550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(checkbox0, div0, null);
    			append_dev(div0, t0);
    			mount_component(textbox0, div0, null);
    			append_dev(div0, t1);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t2);
    			mount_component(textbox1, div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t4);
    			mount_component(checkbox1, div0, null);
    			append_dev(div0, t5);
    			mount_component(select, div0, null);
    			append_dev(div1, t6);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t7);
    			if (if_block3) if_block3.m(div1, null);
    			append_dev(div1, t8);
    			if (if_block4) if_block4.m(div1, null);
    			append_dev(div1, t9);
    			if (if_block5) if_block5.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkbox0_changes = {};

    			if (!updating_value && dirty[0] & /*advanced*/ 4) {
    				updating_value = true;
    				checkbox0_changes.value = /*advanced*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			checkbox0.$set(checkbox0_changes);
    			const textbox0_changes = {};

    			if (!updating_value_1 && dirty[0] & /*option*/ 1) {
    				updating_value_1 = true;
    				textbox0_changes.value = /*option*/ ctx[0].name;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textbox0.$set(textbox0_changes);

    			if (/*advanced*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*advanced*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_9$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const textbox1_changes = {};

    			if (!updating_value_2 && dirty[0] & /*option*/ 1) {
    				updating_value_2 = true;
    				textbox1_changes.value = /*option*/ ctx[0].description;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			textbox1.$set(textbox1_changes);

    			if (/*advanced*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*advanced*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_8$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t4);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const checkbox1_changes = {};

    			if (!updating_value_3 && dirty[0] & /*option*/ 1) {
    				updating_value_3 = true;
    				checkbox1_changes.value = /*option*/ ctx[0].required;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			checkbox1.$set(checkbox1_changes);
    			const select_changes = {};

    			if (!updating_currentIndex && dirty[0] & /*defaultOptionType*/ 2) {
    				updating_currentIndex = true;
    				select_changes.currentIndex = /*defaultOptionType*/ ctx[1];
    				add_flush_callback(() => updating_currentIndex = false);
    			}

    			select.$set(select_changes);

    			if (/*option*/ ctx[0].type === ApplicationCommandOptionType.SUB_COMMAND || /*option*/ ctx[0].type === ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*option*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_6$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, t7);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*option*/ ctx[0].type === ApplicationCommandOptionType.CHANNEL) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*option*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_5$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div1, t8);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER || /*option*/ ctx[0].type === ApplicationCommandOptionType.INTEGER) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*option*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_4$2(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div1, t9);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*option*/ ctx[0].type === ApplicationCommandOptionType.NUMBER || /*option*/ ctx[0].type === ApplicationCommandOptionType.INTEGER || /*option*/ ctx[0].type === ApplicationCommandOptionType.STRING) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*option*/ 1) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block$4(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div1, null);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);
    			transition_in(textbox0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(textbox1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(checkbox1.$$.fragment, local);
    			transition_in(select.$$.fragment, local);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(textbox0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(textbox1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(checkbox1.$$.fragment, local);
    			transition_out(select.$$.fragment, local);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(checkbox0);
    			destroy_component(textbox0);
    			if (if_block0) if_block0.d();
    			destroy_component(textbox1);
    			if (if_block1) if_block1.d();
    			destroy_component(checkbox1);
    			destroy_component(select);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot$1.name,
    		type: "slot",
    		source: "(113:8) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let collapsible;
    	let current;

    	collapsible = new Collapsible({
    			props: {
    				$$slots: {
    					content: [create_content_slot$1],
    					header: [create_header_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(collapsible.$$.fragment);
    			attr_dev(div, "class", "command-option-container svelte-p664fs");
    			add_location(div, file$5, 99, 0, 4097);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(collapsible, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const collapsible_changes = {};

    			if (dirty[0] & /*option, advanced, defaultOptionType*/ 7 | dirty[1] & /*$$scope*/ 2) {
    				collapsible_changes.$$scope = { dirty, ctx };
    			}

    			collapsible.$set(collapsible_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collapsible.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collapsible.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(collapsible);
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

    function removeFalsy$2(object, copy) {
    	if (typeof object == "string") {
    		object = JSON.parse(object);
    	}

    	Object.entries(object).forEach(([k, v]) => {
    		if (v && typeof v === 'object' && copy) {
    			removeFalsy$2(v, true);
    		}

    		if (v && typeof v === 'object' && !Object.keys(v).length || v === "" && k != "name" && k != "description" && k != "value" || (v === null || v === void 0 ? void 0 : v.name) == "" && (v === null || v === void 0 ? void 0 : v.value) == "" && copy || v == null) {
    			if (Array.isArray(object)) {
    				object.splice(Number(k), 1);
    			} else {
    				delete object[k];
    			}
    		}
    	});

    	return object;
    }

    const keyup_handler$1 = () => {
    	
    };

    function instance$5($$self, $$props, $$invalidate) {
    	let option_json;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CommandOption', slots, []);
    	var _a;
    	let { option } = $$props;
    	const dispatch = createEventDispatcher();

    	function addOption() {
    		if (!option.options) {
    			$$invalidate(0, option.options = [], option);
    		}

    		$$invalidate(0, option.options = [...option.options, { name: "", description: "" }], option);
    	}

    	function addOptionChoice() {
    		if (!option.choices) {
    			$$invalidate(0, option.choices = [], option);
    		}

    		$$invalidate(0, option.choices = [...option.choices, { name: "", value: "" }], option);
    	}

    	function cleanUpOption(opt) {
    		if (opt.options != undefined && opt.type !== ApplicationCommandOptionType.SUB_COMMAND && opt.type !== ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
    			opt.options = undefined;
    		}

    		if ((opt.max_value != undefined || option.min_value != undefined) && opt.type !== ApplicationCommandOptionType.INTEGER && opt.type !== ApplicationCommandOptionType.NUMBER) {
    			opt.max_value = undefined;
    			opt.min_value = undefined;
    		}

    		if (opt.autocomplete != undefined && (opt.type !== ApplicationCommandOptionType.NUMBER && opt.type !== ApplicationCommandOptionType.INTEGER && opt.type !== ApplicationCommandOptionType.STRING || opt.choices != undefined && opt.choices.length > 0)) {
    			opt.autocomplete = undefined;
    		}

    		if (opt.choices != undefined && opt.type !== ApplicationCommandOptionType.NUMBER && opt.type !== ApplicationCommandOptionType.INTEGER && opt.type !== ApplicationCommandOptionType.STRING) {
    			opt.choices = undefined;
    		}

    		if (opt.channel_types != undefined && opt.type !== ApplicationCommandOptionType.CHANNEL) {
    			opt.channel_types = undefined;
    		}
    	}

    	let commandOptionTypes = buildOptionsFromEnum(ApplicationCommandOptionType);
    	let channelTypes = buildOptionsFromEnum(ChannelType);
    	let defaultOptionType = 2;

    	function handleChannelTypeSelectionChanged(event) {
    		$$invalidate(0, option.channel_types = event.detail.values.map(x => x.value), option);
    	}

    	option.required = true;
    	option.max_value = null;
    	option.max_value = null;
    	option.name = option.name || "";
    	let advanced = Boolean("");
    	option.min_value = option.min_value;
    	option.max_value = option.max_value;

    	$$self.$$.on_mount.push(function () {
    		if (option === undefined && !('option' in $$props || $$self.$$.bound[$$self.$$.props['option']])) {
    			console.warn("<CommandOption> was created without expected prop 'option'");
    		}
    	});

    	const writable_props = ['option'];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CommandOption> was created with unknown prop '${key}'`);
    	});

    	function checkbox0_value_binding(value) {
    		advanced = value;
    		$$invalidate(2, advanced);
    	}

    	function textbox0_value_binding(value) {
    		if ($$self.$$.not_equal(option.name, value)) {
    			option.name = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	function localization_localizations_binding(value) {
    		if ($$self.$$.not_equal(option.name_localizations, value)) {
    			option.name_localizations = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	function textbox1_value_binding(value) {
    		if ($$self.$$.not_equal(option.description, value)) {
    			option.description = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	function localization_localizations_binding_1(value) {
    		if ($$self.$$.not_equal(option.description_localizations, value)) {
    			option.description_localizations = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	function checkbox1_value_binding(value) {
    		if ($$self.$$.not_equal(option.required, value)) {
    			option.required = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	function select_currentIndex_binding(value) {
    		defaultOptionType = value;
    		$$invalidate(1, defaultOptionType);
    	}

    	const remove_handler = i => {
    		option.options.splice(i, 1);

    		if (option.options.length === 0) {
    			$$invalidate(0, option.options = undefined, option);
    		} else {
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	};

    	function textbox0_value_binding_1(value) {
    		if ($$self.$$.not_equal(option.min_value, value)) {
    			option.min_value = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	function textbox1_value_binding_1(value) {
    		if ($$self.$$.not_equal(option.max_value, value)) {
    			option.max_value = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	function commandoptionchoice_choice_binding(value, choice, each_value, i) {
    		each_value[i] = value;
    		((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    	}

    	function commandoptionchoice_optionType_binding(value) {
    		if ($$self.$$.not_equal(option.type, value)) {
    			option.type = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	const remove_handler_1 = i => {
    		option.choices.splice(i, 1);

    		if (option.choices.length === 0) {
    			$$invalidate(0, option.choices = undefined, option);
    		} else {
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	};

    	function checkbox_value_binding(value) {
    		if ($$self.$$.not_equal(option.autocomplete, value)) {
    			option.autocomplete = value;
    			((($$invalidate(0, option), $$invalidate(6, commandOptionTypes)), $$invalidate(1, defaultOptionType)), $$invalidate(9, _a));
    		}
    	}

    	const click_handler = () => dispatch("remove");

    	$$self.$$set = $$props => {
    		if ('option' in $$props) $$invalidate(0, option = $$props.option);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		createEventDispatcher,
    		ApplicationCommandOptionType,
    		ChannelType,
    		buildOptionsFromEnum,
    		Checkbox,
    		Collapsible,
    		Select,
    		Textbox,
    		CommandOptionChoice,
    		Icon,
    		Localization,
    		option,
    		removeFalsy: removeFalsy$2,
    		dispatch,
    		addOption,
    		addOptionChoice,
    		cleanUpOption,
    		commandOptionTypes,
    		channelTypes,
    		defaultOptionType,
    		handleChannelTypeSelectionChanged,
    		advanced,
    		option_json
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) $$invalidate(9, _a = $$props._a);
    		if ('option' in $$props) $$invalidate(0, option = $$props.option);
    		if ('commandOptionTypes' in $$props) $$invalidate(6, commandOptionTypes = $$props.commandOptionTypes);
    		if ('channelTypes' in $$props) $$invalidate(7, channelTypes = $$props.channelTypes);
    		if ('defaultOptionType' in $$props) $$invalidate(1, defaultOptionType = $$props.defaultOptionType);
    		if ('advanced' in $$props) $$invalidate(2, advanced = $$props.advanced);
    		if ('option_json' in $$props) option_json = $$props.option_json;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*defaultOptionType*/ 2) {
    			$$invalidate(0, option.type = commandOptionTypes[defaultOptionType].value, option);
    		}

    		if ($$self.$$.dirty[0] & /*option, _a*/ 513) {
    			$$invalidate(
    				0,
    				option.name = $$invalidate(9, _a = option === null || option === void 0
    				? void 0
    				: option.name) === null || _a === void 0
    				? void 0
    				: _a.toLocaleLowerCase().replace(" ", "-").replace(/[^a-z0-9-_]/g, ''),
    				option
    			);
    		}

    		if ($$self.$$.dirty[0] & /*option*/ 1) {
    			$$invalidate(0, option.min_value = Number(String(option.min_value).replace(/[^0-9]/g, "")) || null, option);
    		}

    		if ($$self.$$.dirty[0] & /*option*/ 1) {
    			$$invalidate(0, option.max_value = Number(String(option.max_value).replace(/[^0-9]/g, "")) || null, option);
    		}

    		if ($$self.$$.dirty[0] & /*option*/ 1) {
    			option_json = JSON.stringify(removeFalsy$2(option), null, 4);
    		}

    		if ($$self.$$.dirty[0] & /*option*/ 1) {
    			cleanUpOption(option);
    		}

    		if ($$self.$$.dirty[0] & /*advanced*/ 4) {
    			$$invalidate(2, advanced = advanced || false);
    		}
    	};

    	return [
    		option,
    		defaultOptionType,
    		advanced,
    		dispatch,
    		addOption,
    		addOptionChoice,
    		commandOptionTypes,
    		channelTypes,
    		handleChannelTypeSelectionChanged,
    		_a,
    		checkbox0_value_binding,
    		textbox0_value_binding,
    		localization_localizations_binding,
    		textbox1_value_binding,
    		localization_localizations_binding_1,
    		checkbox1_value_binding,
    		select_currentIndex_binding,
    		remove_handler,
    		textbox0_value_binding_1,
    		textbox1_value_binding_1,
    		commandoptionchoice_choice_binding,
    		commandoptionchoice_optionType_binding,
    		remove_handler_1,
    		checkbox_value_binding,
    		click_handler
    	];
    }

    class CommandOption extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { option: 0 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CommandOption",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get option() {
    		throw new Error("<CommandOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set option(value) {
    		throw new Error("<CommandOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Command.svelte generated by Svelte v3.59.2 */

    const { Boolean: Boolean_1, Object: Object_1$1 } = globals;
    const file$4 = "src\\components\\Command.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[23] = list;
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (100:16) {#if command?.options?.[0]}
    function create_if_block_8(ctx) {
    	let t0;
    	let show_if = /*command*/ ctx[0]?.options?.map(func).filter(func_1).toString() != "";
    	let t1;
    	let each1_anchor;
    	let each_value_2 = /*command*/ ctx[0]?.options;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block = show_if && create_if_block_10(ctx);
    	let each_value_1 = /*command*/ ctx[0]?.options;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*command*/ 1) {
    				each_value_2 = /*command*/ ctx[0]?.options;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*command*/ 1) show_if = /*command*/ ctx[0]?.options?.map(func).filter(func_1).toString() != "";

    			if (show_if) {
    				if (if_block) ; else {
    					if_block = create_if_block_10(ctx);
    					if_block.c();
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*command*/ 1) {
    				each_value_1 = /*command*/ ctx[0]?.options;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(100:16) {#if command?.options?.[0]}",
    		ctx
    	});

    	return block;
    }

    // (102:24) {#if option.required}
    function create_if_block_11(ctx) {
    	let h;
    	let t0;
    	let required;
    	let t1_value = /*option*/ ctx[22].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h = element("h");
    			t0 = space();
    			required = element("required");
    			t1 = text(t1_value);
    			attr_dev(h, "class", "svelte-mh64dy");
    			add_location(h, file$4, 102, 28, 3974);
    			attr_dev(required, "class", "svelte-mh64dy");
    			add_location(required, file$4, 103, 28, 4012);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, required, anchor);
    			append_dev(required, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*command*/ 1 && t1_value !== (t1_value = /*option*/ ctx[22].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(required);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(102:24) {#if option.required}",
    		ctx
    	});

    	return block;
    }

    // (101:20) {#each command?.options as option}
    function create_each_block_2(ctx) {
    	let if_block_anchor;
    	let if_block = /*option*/ ctx[22].required && create_if_block_11(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*option*/ ctx[22].required) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_11(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(101:20) {#each command?.options as option}",
    		ctx
    	});

    	return block;
    }

    // (108:20) {#if ((command?.options?.map(o => o).filter(r => !r.required && r.name)).toString() != "")}
    function create_if_block_10(ctx) {
    	let optional_text;

    	const block = {
    		c: function create() {
    			optional_text = element("optional-text");
    			optional_text.textContent = "| Optional";
    			set_custom_element_data(optional_text, "class", "svelte-mh64dy");
    			add_location(optional_text, file$4, 108, 24, 4271);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, optional_text, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(optional_text);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(108:20) {#if ((command?.options?.map(o => o).filter(r => !r.required && r.name)).toString() != \\\"\\\")}",
    		ctx
    	});

    	return block;
    }

    // (112:24) {#if !option.required}
    function create_if_block_9(ctx) {
    	let h;
    	let t0;
    	let optional;
    	let t1_value = /*option*/ ctx[22].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h = element("h");
    			t0 = space();
    			optional = element("optional");
    			t1 = text(t1_value);
    			attr_dev(h, "class", "svelte-mh64dy");
    			add_location(h, file$4, 112, 28, 4474);
    			attr_dev(optional, "class", "svelte-mh64dy");
    			add_location(optional, file$4, 113, 28, 4512);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, optional, anchor);
    			append_dev(optional, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*command*/ 1 && t1_value !== (t1_value = /*option*/ ctx[22].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(optional);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(112:24) {#if !option.required}",
    		ctx
    	});

    	return block;
    }

    // (111:20) {#each command?.options as option}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;
    	let if_block = !/*option*/ ctx[22].required && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*option*/ ctx[22].required) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(111:20) {#each command?.options as option}",
    		ctx
    	});

    	return block;
    }

    // (98:8) 
    function create_header_slot(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1_value = (/*command*/ ctx[0].name || "command") + "";
    	let t1;
    	let h;
    	let t2_value = "   " + "";
    	let t2;
    	let t3;
    	let t4;
    	let div0;
    	let icon;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*command*/ ctx[0]?.options?.[0] && create_if_block_8(ctx);

    	icon = new Icon({
    			props: { name: "delete", class: "delete-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("/ ");
    			t1 = text(t1_value);
    			h = element("h");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			attr_dev(div0, "class", "delete-icon-wrapper svelte-mh64dy");
    			add_location(div0, file$4, 119, 12, 4675);
    			attr_dev(h, "class", "svelte-mh64dy");
    			add_location(h, file$4, 98, 61, 3786);
    			attr_dev(h2, "class", "heading svelte-mh64dy");
    			add_location(h2, file$4, 98, 12, 3737);
    			attr_dev(div1, "class", "container-header svelte-mh64dy");
    			attr_dev(div1, "slot", "header");
    			add_location(div1, file$4, 97, 8, 3679);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, h);
    			append_dev(h, t2);
    			append_dev(h, t3);
    			if (if_block) if_block.m(h, null);
    			append_dev(h, t4);
    			append_dev(h, div0);
    			mount_component(icon, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[19], false, false, false, false),
    					listen_dev(div0, "keyup", keyup_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*command*/ 1) && t1_value !== (t1_value = (/*command*/ ctx[0].name || "command") + "")) set_data_dev(t1, t1_value);

    			if (/*command*/ ctx[0]?.options?.[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					if_block.m(h, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			destroy_component(icon);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(98:8) ",
    		ctx
    	});

    	return block;
    }

    // (137:12) {#if advanced}
    function create_if_block_7(ctx) {
    	let localization;
    	let updating_localizations;
    	let current;

    	function localization_localizations_binding(value) {
    		/*localization_localizations_binding*/ ctx[11](value);
    	}

    	let localization_props = {};

    	if (/*command*/ ctx[0].name_localizations !== void 0) {
    		localization_props.localizations = /*command*/ ctx[0].name_localizations;
    	}

    	localization = new Localization({
    			props: localization_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(localization, 'localizations', localization_localizations_binding));

    	const block = {
    		c: function create() {
    			create_component(localization.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(localization, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const localization_changes = {};

    			if (!updating_localizations && dirty & /*command*/ 1) {
    				updating_localizations = true;
    				localization_changes.localizations = /*command*/ ctx[0].name_localizations;
    				add_flush_callback(() => updating_localizations = false);
    			}

    			localization.$set(localization_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(localization.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(localization.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(localization, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(137:12) {#if advanced}",
    		ctx
    	});

    	return block;
    }

    // (152:16) {#if command.hasOwnProperty("description")}
    function create_if_block_6(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1
    	};

    	handle_promise(promise = delete /*command*/ ctx[0].description, info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;
    			dirty & /*command*/ 1 && promise !== (promise = delete /*command*/ ctx[0].description) && handle_promise(promise, info);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(152:16) {#if command.hasOwnProperty(\\\"description\\\")}",
    		ctx
    	});

    	return block;
    }

    // (140:12) {#if command.type !== 2}
    function create_if_block_4$1(ctx) {
    	let t;
    	let textbox;
    	let updating_value;
    	let current;
    	let if_block = !/*command*/ ctx[0].description && create_if_block_5(ctx);

    	function textbox_value_binding_1(value) {
    		/*textbox_value_binding_1*/ ctx[12](value);
    	}

    	let textbox_props = { label: "Description *", maxlength: 100 };

    	if (/*command*/ ctx[0].description !== void 0) {
    		textbox_props.value = /*command*/ ctx[0].description;
    	}

    	textbox = new Textbox({ props: textbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox, 'value', textbox_value_binding_1));

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(textbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(textbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*command*/ ctx[0].description) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const textbox_changes = {};

    			if (!updating_value && dirty & /*command*/ 1) {
    				updating_value = true;
    				textbox_changes.value = /*command*/ ctx[0].description;
    				add_flush_callback(() => updating_value = false);
    			}

    			textbox.$set(textbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(textbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(140:12) {#if command.type !== 2}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts" context="module">var _a;  </script>  <script lang="ts">var _a;  import { createEventDispatcher }
    function create_catch_block_1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\" context=\\\"module\\\">var _a;  </script>  <script lang=\\\"ts\\\">var _a;  import { createEventDispatcher }",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts" context="module">var _a;  </script>  <script lang="ts">var _a;  import { createEventDispatcher }
    function create_then_block_1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(1:0) <script lang=\\\"ts\\\" context=\\\"module\\\">var _a;  </script>  <script lang=\\\"ts\\\">var _a;  import { createEventDispatcher }",
    		ctx
    	});

    	return block;
    }

    // (153:55)                       {/await}
    function create_pending_block_1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(153:55)                       {/await}",
    		ctx
    	});

    	return block;
    }

    // (141:16) {#if !command.description}
    function create_if_block_5(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block
    	};

    	handle_promise(promise = /*command*/ ctx[0].description = "", info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;
    			dirty & /*command*/ 1 && promise !== (promise = /*command*/ ctx[0].description = "") && handle_promise(promise, info);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(141:16) {#if !command.description}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts" context="module">var _a;  </script>  <script lang="ts">var _a;  import { createEventDispatcher }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\" context=\\\"module\\\">var _a;  </script>  <script lang=\\\"ts\\\">var _a;  import { createEventDispatcher }",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts" context="module">var _a;  </script>  <script lang="ts">var _a;  import { createEventDispatcher }
    function create_then_block(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(1:0) <script lang=\\\"ts\\\" context=\\\"module\\\">var _a;  </script>  <script lang=\\\"ts\\\">var _a;  import { createEventDispatcher }",
    		ctx
    	});

    	return block;
    }

    // (142:53)                       {/await}
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(142:53)                       {/await}",
    		ctx
    	});

    	return block;
    }

    // (158:12) {#if advanced}
    function create_if_block_3$1(ctx) {
    	let localization;
    	let updating_localizations;
    	let current;

    	function localization_localizations_binding_1(value) {
    		/*localization_localizations_binding_1*/ ctx[13](value);
    	}

    	let localization_props = {};

    	if (/*command*/ ctx[0].description_localizations !== void 0) {
    		localization_props.localizations = /*command*/ ctx[0].description_localizations;
    	}

    	localization = new Localization({
    			props: localization_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(localization, 'localizations', localization_localizations_binding_1));

    	const block = {
    		c: function create() {
    			create_component(localization.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(localization, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const localization_changes = {};

    			if (!updating_localizations && dirty & /*command*/ 1) {
    				updating_localizations = true;
    				localization_changes.localizations = /*command*/ ctx[0].description_localizations;
    				add_flush_callback(() => updating_localizations = false);
    			}

    			localization.$set(localization_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(localization.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(localization.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(localization, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(158:12) {#if advanced}",
    		ctx
    	});

    	return block;
    }

    // (168:12) {#if advanced}
    function create_if_block_1$1(ctx) {
    	let select;
    	let t;
    	let if_block_anchor;
    	let current;

    	select = new Select({
    			props: {
    				label: "Permissions",
    				options: /*permissions*/ ctx[6],
    				selectionMode: "multiple"
    			},
    			$$inline: true
    		});

    	select.$on("selectionChanged", /*selectionChanged_handler*/ ctx[15]);
    	let if_block = !/*command*/ ctx[0].guild_id && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*command*/ ctx[0].guild_id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*command*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
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
    			transition_in(select.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(168:12) {#if advanced}",
    		ctx
    	});

    	return block;
    }

    // (176:16) {#if !command.guild_id}
    function create_if_block_2$1(ctx) {
    	let checkbox;
    	let updating_value;
    	let current;

    	function checkbox_value_binding_1(value) {
    		/*checkbox_value_binding_1*/ ctx[16](value);
    	}

    	let checkbox_props = { label: "DM Permission" };

    	if (/*command*/ ctx[0].dm_permission !== void 0) {
    		checkbox_props.value = /*command*/ ctx[0].dm_permission;
    	}

    	checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, 'value', checkbox_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(checkbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};

    			if (!updating_value && dirty & /*command*/ 1) {
    				updating_value = true;
    				checkbox_changes.value = /*command*/ ctx[0].dm_permission;
    				add_flush_callback(() => updating_value = false);
    			}

    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(176:16) {#if !command.guild_id}",
    		ctx
    	});

    	return block;
    }

    // (184:16) {#if command.options}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*command*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*command, undefined*/ 1) {
    				each_value = /*command*/ ctx[0].options;
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
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(184:16) {#if command.options}",
    		ctx
    	});

    	return block;
    }

    // (185:20) {#each command.options as option, i}
    function create_each_block$2(ctx) {
    	let commandoption;
    	let updating_option;
    	let current;

    	function commandoption_option_binding(value) {
    		/*commandoption_option_binding*/ ctx[17](value, /*option*/ ctx[22], /*each_value*/ ctx[23], /*i*/ ctx[24]);
    	}

    	function remove_handler() {
    		return /*remove_handler*/ ctx[18](/*i*/ ctx[24]);
    	}

    	let commandoption_props = {};

    	if (/*option*/ ctx[22] !== void 0) {
    		commandoption_props.option = /*option*/ ctx[22];
    	}

    	commandoption = new CommandOption({
    			props: commandoption_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(commandoption, 'option', commandoption_option_binding));
    	commandoption.$on("remove", remove_handler);

    	const block = {
    		c: function create() {
    			create_component(commandoption.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(commandoption, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const commandoption_changes = {};

    			if (!updating_option && dirty & /*command*/ 1) {
    				updating_option = true;
    				commandoption_changes.option = /*option*/ ctx[22];
    				add_flush_callback(() => updating_option = false);
    			}

    			commandoption.$set(commandoption_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(commandoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(commandoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(commandoption, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(185:20) {#each command.options as option, i}",
    		ctx
    	});

    	return block;
    }

    // (128:8) 
    function create_content_slot(ctx) {
    	let div2;
    	let checkbox;
    	let updating_value;
    	let t0;
    	let textbox;
    	let updating_value_1;
    	let t1;
    	let t2;
    	let show_if;
    	let current_block_type_index;
    	let if_block1;
    	let t3;
    	let t4;
    	let select;
    	let updating_currentIndex;
    	let t5;
    	let t6;
    	let div0;
    	let t7;
    	let div1;
    	let button;
    	let icon;
    	let t8;
    	let current;
    	let mounted;
    	let dispose;

    	function checkbox_value_binding(value) {
    		/*checkbox_value_binding*/ ctx[9](value);
    	}

    	let checkbox_props = { label: "Advanced Options" };

    	if (/*advanced*/ ctx[2] !== void 0) {
    		checkbox_props.value = /*advanced*/ ctx[2];
    	}

    	checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, 'value', checkbox_value_binding));

    	function textbox_value_binding(value) {
    		/*textbox_value_binding*/ ctx[10](value);
    	}

    	let textbox_props = { label: "Name *", maxlength: 32 };

    	if (/*command*/ ctx[0].name !== void 0) {
    		textbox_props.value = /*command*/ ctx[0].name;
    	}

    	textbox = new Textbox({ props: textbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(textbox, 'value', textbox_value_binding));
    	let if_block0 = /*advanced*/ ctx[2] && create_if_block_7(ctx);
    	const if_block_creators = [create_if_block_4$1, create_if_block_6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*command*/ 1) show_if = null;
    		if (/*command*/ ctx[0].type !== 2) return 0;
    		if (show_if == null) show_if = !!/*command*/ ctx[0].hasOwnProperty("description");
    		if (show_if) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx, -1))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block2 = /*advanced*/ ctx[2] && create_if_block_3$1(ctx);

    	function select_currentIndex_binding(value) {
    		/*select_currentIndex_binding*/ ctx[14](value);
    	}

    	let select_props = {
    		label: "Type",
    		options: /*commandTypes*/ ctx[5]
    	};

    	if (/*defaultCommandType*/ ctx[1] !== void 0) {
    		select_props.currentIndex = /*defaultCommandType*/ ctx[1];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, 'currentIndex', select_currentIndex_binding));
    	let if_block3 = /*advanced*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block4 = /*command*/ ctx[0].options && create_if_block$3(ctx);

    	icon = new Icon({
    			props: { name: "add", class: "btn-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(checkbox.$$.fragment);
    			t0 = space();
    			create_component(textbox.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			create_component(select.$$.fragment);
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			div0 = element("div");
    			if (if_block4) if_block4.c();
    			t7 = space();
    			div1 = element("div");
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t8 = text("Add Option");
    			attr_dev(div0, "class", "command-options svelte-mh64dy");
    			add_location(div0, file$4, 182, 12, 6968);
    			attr_dev(button, "class", "svelte-mh64dy");
    			add_location(button, file$4, 200, 16, 7798);
    			attr_dev(div1, "class", "button-bar svelte-mh64dy");
    			attr_dev(div1, "id", "add-command-button");
    			add_location(div1, file$4, 199, 12, 7732);
    			attr_dev(div2, "class", "content svelte-mh64dy");
    			attr_dev(div2, "slot", "content");
    			add_location(div2, file$4, 127, 8, 4938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(checkbox, div2, null);
    			append_dev(div2, t0);
    			mount_component(textbox, div2, null);
    			append_dev(div2, t1);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div2, null);
    			}

    			append_dev(div2, t3);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t4);
    			mount_component(select, div2, null);
    			append_dev(div2, t5);
    			if (if_block3) if_block3.m(div2, null);
    			append_dev(div2, t6);
    			append_dev(div2, div0);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			mount_component(icon, button, null);
    			append_dev(button, t8);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addOption*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};

    			if (!updating_value && dirty & /*advanced*/ 4) {
    				updating_value = true;
    				checkbox_changes.value = /*advanced*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			checkbox.$set(checkbox_changes);
    			const textbox_changes = {};

    			if (!updating_value_1 && dirty & /*command*/ 1) {
    				updating_value_1 = true;
    				textbox_changes.value = /*command*/ ctx[0].name;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textbox.$set(textbox_changes);

    			if (/*advanced*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*advanced*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div2, t3);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (/*advanced*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*advanced*/ 4) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_3$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			const select_changes = {};

    			if (!updating_currentIndex && dirty & /*defaultCommandType*/ 2) {
    				updating_currentIndex = true;
    				select_changes.currentIndex = /*defaultCommandType*/ ctx[1];
    				add_flush_callback(() => updating_currentIndex = false);
    			}

    			select.$set(select_changes);

    			if (/*advanced*/ ctx[2]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*advanced*/ 4) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div2, t6);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*command*/ ctx[0].options) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*command*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$3(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div0, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			transition_in(textbox.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(select.$$.fragment, local);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			transition_out(textbox.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(select.$$.fragment, local);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(checkbox);
    			destroy_component(textbox);
    			if (if_block0) if_block0.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block2) if_block2.d();
    			destroy_component(select);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(128:8) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let html_tag;
    	let html_anchor;
    	let t;
    	let div;
    	let collapsible;
    	let current;

    	collapsible = new Collapsible({
    			props: {
    				$$slots: {
    					content: [create_content_slot],
    					header: [create_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			t = space();
    			div = element("div");
    			create_component(collapsible.$$.fragment);
    			html_tag.a = html_anchor;
    			attr_dev(div, "class", "command-container svelte-mh64dy");
    			add_location(div, file$4, 95, 0, 3619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(atomOneDark$1, document.head);
    			append_dev(document.head, html_anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(collapsible, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const collapsible_changes = {};

    			if (dirty & /*$$scope, command, advanced, defaultCommandType*/ 536870919) {
    				collapsible_changes.$$scope = { dirty, ctx };
    			}

    			collapsible.$set(collapsible_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collapsible.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collapsible.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(collapsible);
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

    function removeFalsy$1(object, copy) {
    	if (typeof object == "string") {
    		object = JSON.parse(object);
    	}

    	Object.entries(object).forEach(([k, v]) => {
    		if (v && typeof v === 'object' && copy) {
    			removeFalsy$1(v, true);
    		}

    		if (v && typeof v === 'object' && !Object.keys(v).length || v === false && k !== "dm_permission" || v === "" && k != "name" && k != "description" && k != "value" || (v === null || v === void 0 ? void 0 : v.name) == "" && (v === null || v === void 0 ? void 0 : v.value) == "" && copy || k == "type" && v == "1") {
    			// console.log(`${v.name} | ${v.value}`)
    			if (v[k] === "") {
    				delete object[k];
    				return;
    			}

    			if (Array.isArray(object)) {
    				object.splice(Number(k), 1);
    			} else {
    				delete object[k];
    			}
    		} // object[dm_permission] = dm_perms
    	});

    	return object;
    }

    const func = o => o;
    const func_1 = r => !r.required && r.name;

    const keyup_handler = () => {
    	
    };

    function instance$4($$self, $$props, $$invalidate) {
    	let command_json;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Command', slots, []);
    	var _a;
    	let { command } = $$props;
    	const dispatch = createEventDispatcher();

    	function addOption() {
    		if (!command.options) {
    			$$invalidate(0, command.options = [], command);
    		}

    		$$invalidate(0, command.options = [...command.options, { name: "", description: "" }], command);
    	}

    	let commandTypes = buildOptionsFromEnum(ApplicationCommandType);
    	let defaultCommandType = 0;
    	let permissions = buildOptionsFromEnum(Permissions, true);

    	function setPermissions(permissions) {
    		$$invalidate(0, command.defaultMemberPermissions = permissions.map(p => p.value), command);
    	}

    	command.guild_id = command.guild_id;
    	command.name = command.name;
    	command.dm_permission = command.dm_permission;
    	let advanced = Boolean("");

    	// let options = []
    	// $: if (Array.isArray(command.options)) {
    	//     let i = 0
    	//     for (const option of command?.options) {
    	//         if (i === 0){
    	//             i++
    	//             const name = option.name
    	//             console.log(name)
    	//             if (!options.includes(name) && name) options.push(name)                
    	//         }
    	//     }
    	//     console.log(options)
    	// }
    	// for (const option of command.options) {
    	//     options.push(option.name)
    	//     console.log(option.name)
    	// }
    	let breakLoop = false;

    	$$self.$$.on_mount.push(function () {
    		if (command === undefined && !('command' in $$props || $$self.$$.bound[$$self.$$.props['command']])) {
    			console.warn("<Command> was created without expected prop 'command'");
    		}
    	});

    	const writable_props = ['command'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Command> was created with unknown prop '${key}'`);
    	});

    	function checkbox_value_binding(value) {
    		advanced = value;
    		$$invalidate(2, advanced);
    	}

    	function textbox_value_binding(value) {
    		if ($$self.$$.not_equal(command.name, value)) {
    			command.name = value;
    			((($$invalidate(0, command), $$invalidate(5, commandTypes)), $$invalidate(1, defaultCommandType)), $$invalidate(8, _a));
    		}
    	}

    	function localization_localizations_binding(value) {
    		if ($$self.$$.not_equal(command.name_localizations, value)) {
    			command.name_localizations = value;
    			((($$invalidate(0, command), $$invalidate(5, commandTypes)), $$invalidate(1, defaultCommandType)), $$invalidate(8, _a));
    		}
    	}

    	function textbox_value_binding_1(value) {
    		if ($$self.$$.not_equal(command.description, value)) {
    			command.description = value;
    			((($$invalidate(0, command), $$invalidate(5, commandTypes)), $$invalidate(1, defaultCommandType)), $$invalidate(8, _a));
    		}
    	}

    	function localization_localizations_binding_1(value) {
    		if ($$self.$$.not_equal(command.description_localizations, value)) {
    			command.description_localizations = value;
    			((($$invalidate(0, command), $$invalidate(5, commandTypes)), $$invalidate(1, defaultCommandType)), $$invalidate(8, _a));
    		}
    	}

    	function select_currentIndex_binding(value) {
    		defaultCommandType = value;
    		$$invalidate(1, defaultCommandType);
    	}

    	const selectionChanged_handler = event => setPermissions(event.detail.values);

    	function checkbox_value_binding_1(value) {
    		if ($$self.$$.not_equal(command.dm_permission, value)) {
    			command.dm_permission = value;
    			((($$invalidate(0, command), $$invalidate(5, commandTypes)), $$invalidate(1, defaultCommandType)), $$invalidate(8, _a));
    		}
    	}

    	function commandoption_option_binding(value, option, each_value, i) {
    		each_value[i] = value;
    		((($$invalidate(0, command), $$invalidate(5, commandTypes)), $$invalidate(1, defaultCommandType)), $$invalidate(8, _a));
    	}

    	const remove_handler = i => {
    		command.options.splice(i, 1);

    		if (command.options.length === 0) {
    			$$invalidate(0, command.options = undefined, command);
    		} else {
    			((($$invalidate(0, command), $$invalidate(5, commandTypes)), $$invalidate(1, defaultCommandType)), $$invalidate(8, _a));
    		}
    	};

    	const click_handler = () => dispatch("remove");

    	$$self.$$set = $$props => {
    		if ('command' in $$props) $$invalidate(0, command = $$props.command);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		_a,
    		createEventDispatcher,
    		atomOneDark: atomOneDark$1,
    		ApplicationCommandType,
    		Permissions,
    		buildOptionsFromEnum,
    		Checkbox,
    		Collapsible,
    		Select,
    		Textbox,
    		CommandOption,
    		Icon,
    		Localization,
    		command,
    		removeFalsy: removeFalsy$1,
    		dispatch,
    		addOption,
    		commandTypes,
    		defaultCommandType,
    		permissions,
    		setPermissions,
    		advanced,
    		breakLoop,
    		command_json
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) $$invalidate(8, _a = $$props._a);
    		if ('command' in $$props) $$invalidate(0, command = $$props.command);
    		if ('commandTypes' in $$props) $$invalidate(5, commandTypes = $$props.commandTypes);
    		if ('defaultCommandType' in $$props) $$invalidate(1, defaultCommandType = $$props.defaultCommandType);
    		if ('permissions' in $$props) $$invalidate(6, permissions = $$props.permissions);
    		if ('advanced' in $$props) $$invalidate(2, advanced = $$props.advanced);
    		if ('breakLoop' in $$props) breakLoop = $$props.breakLoop;
    		if ('command_json' in $$props) command_json = $$props.command_json;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*defaultCommandType*/ 2) {
    			$$invalidate(0, command.type = commandTypes[defaultCommandType].value, command);
    		}

    		if ($$self.$$.dirty & /*command, _a*/ 257) {
    			$$invalidate(
    				0,
    				command.guild_id = ($$invalidate(8, _a = command === null || command === void 0
    				? void 0
    				: command.guild_id) === null || _a === void 0
    				? void 0
    				: _a.replace(/[^0-9]/g, '')) || "",
    				command
    			);
    		}

    		if ($$self.$$.dirty & /*command*/ 1) {
    			$$invalidate(0, command.name = command.name.toLocaleLowerCase().replace(" ", "-").replace(/[^a-z0-9-_]/g, ''), command);
    		}

    		if ($$self.$$.dirty & /*command*/ 1) {
    			$$invalidate(0, command.dm_permission = command.dm_permission || false, command);
    		}

    		if ($$self.$$.dirty & /*command*/ 1) {
    			command_json = JSON.stringify(removeFalsy$1(command), null, 4);
    		}

    		if ($$self.$$.dirty & /*advanced*/ 4) {
    			$$invalidate(2, advanced = advanced || false);
    		}
    	};

    	return [
    		command,
    		defaultCommandType,
    		advanced,
    		dispatch,
    		addOption,
    		commandTypes,
    		permissions,
    		setPermissions,
    		_a,
    		checkbox_value_binding,
    		textbox_value_binding,
    		localization_localizations_binding,
    		textbox_value_binding_1,
    		localization_localizations_binding_1,
    		select_currentIndex_binding,
    		selectionChanged_handler,
    		checkbox_value_binding_1,
    		commandoption_option_binding,
    		remove_handler,
    		click_handler
    	];
    }

    class Command extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { command: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Command",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get command() {
    		throw new Error("<Command>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set command(value) {
    		throw new Error("<Command>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function notificationsStore(initialValue = []) {
      const store = writable(initialValue);
      const { set, update, subscribe } = store;
      let defaultOptions = {
        duration: 3000,
        placement: 'bottom-right',
        type: 'info',
        theme: 'dark',
      };
      function add(options) {
        const {
          duration = 3000,
          placement = 'bottom-right',
          type = 'info',
          theme = 'dark',
          ...rest
        } = { ...defaultOptions, ...options };

        const uid = Date.now();
        const obj = {
          ...rest,
          uid,
          placement,
          type,
          theme,
          duration,
          remove: () => {
            update((v) => v.filter((i) => i.uid !== uid));
          },
          update: (data) => {
            delete data.uid;
            const index = get_store_value(store)?.findIndex((v) => v?.uid === uid);
            if (index > -1) {
              update((v) => [
                ...v.slice(0, index),
                { ...v[index], ...data },
                ...v.slice(index + 1),
              ]);
            }
          },
        };
        update((v) => [...v, obj]);
        if (duration > 0) {
          setTimeout(() => {
            obj.remove();
            if (typeof obj.onRemove === 'function') obj.onRemove();
          }, duration);
        }
        return obj;
      }

      function getById(uid) {
        return get_store_value(store)?.find((v) => v?.uid === uid);
      }

      function clearAll() {
        set([]);
      }
      function clearLast() {
        update((v) => {
          return v.slice(0, v.length - 1);
        });
      }

      function setDefaults(options) {
        defaultOptions = { ...defaultOptions, ...options };
      }

      return {
        subscribe,
        add,
        success: getHelper('success', add),
        info: getHelper('info', add),
        error: getHelper('error', add),
        warning: getHelper('warning', add),
        clearAll,
        clearLast,
        getById,
        setDefaults,
      };
    }
    const toasts = notificationsStore([]);

    function getHelper(type, add) {
      return function () {
        if (typeof arguments[0] === 'object') {
          const options = arguments[0];
          return add({ ...options, type });
        } else if (
          typeof arguments[0] === 'string' &&
          typeof arguments[1] === 'string'
        ) {
          const options = arguments[2] || {};
          return add({
            ...options,
            type,
            title: arguments[0],
            description: arguments[1],
          });
        } else if (typeof arguments[0] === 'string') {
          const options = arguments[1] || {};
          return add({
            ...options,
            type,
            description: arguments[0],
          });
        }
      };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* node_modules\svelte-toasts\src\ToastContainer.svelte generated by Svelte v3.59.2 */
    const file$3 = "node_modules\\svelte-toasts\\src\\ToastContainer.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({ data: dirty & /*$toasts*/ 4 });
    const get_default_slot_context = ctx => ({ data: /*toast*/ ctx[14] });

    // (107:10) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $toasts*/ 516)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(107:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (105:10) {#if toast.component}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*toast*/ ctx[14].component;

    	function switch_props(ctx) {
    		return {
    			props: { data: /*toast*/ ctx[14] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*$toasts*/ 4) switch_instance_changes.data = /*toast*/ ctx[14];

    			if (dirty & /*$toasts*/ 4 && switch_value !== (switch_value = /*toast*/ ctx[14].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(105:10) {#if toast.component}",
    		ctx
    	});

    	return block;
    }

    // (97:6) {#each $toasts         .filter((n) => n.placement === placement)         .reverse() as toast (toast.uid)}
    function create_each_block_1(key_1, ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let li_intro;
    	let li_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*toast*/ ctx[14].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			t = space();
    			attr_dev(li, "class", "svelte-10rf04c");
    			add_location(li, file$3, 99, 8, 2256);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
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
    				if_block.m(li, t);
    			}
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    			add_transform(li, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, {});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!current) return;
    				if (li_outro) li_outro.end(1);
    				li_intro = create_in_transition(li, fade, { duration: 500 });
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (li_intro) li_intro.invalidate();

    			li_outro = create_out_transition(li, fly, {
    				y: /*flyMap*/ ctx[4][/*toast*/ ctx[14].placement],
    				duration: 1000
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_blocks[current_block_type_index].d();
    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(97:6) {#each $toasts         .filter((n) => n.placement === placement)         .reverse() as toast (toast.uid)}",
    		ctx
    	});

    	return block;
    }

    // (94:0) {#each placements as placement}
    function create_each_block$1(ctx) {
    	let div;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[11](/*placement*/ ctx[1], ...args);
    	}

    	let each_value_1 = /*$toasts*/ ctx[2].filter(func).reverse();
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*toast*/ ctx[14].uid;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(ul, "class", "svelte-10rf04c");
    			add_location(ul, file$3, 95, 4, 2131);
    			attr_dev(div, "class", "toast-container " + /*placement*/ ctx[1] + " svelte-10rf04c");
    			set_style(div, "width", /*width*/ ctx[0]);
    			add_location(div, file$3, 94, 2, 2062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*flyMap, $toasts, placements, $$scope*/ 540) {
    				each_value_1 = /*$toasts*/ ctx[2].filter(func).reverse();
    				validate_each_argument(each_value_1);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (!current || dirty & /*width*/ 1) {
    				set_style(div, "width", /*width*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(94:0) {#each placements as placement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*placements*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placements, width, $toasts, flyMap, $$scope*/ 541) {
    				each_value = /*placements*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $toasts;
    	validate_store(toasts, 'toasts');
    	component_subscribe($$self, toasts, $$value => $$invalidate(2, $toasts = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastContainer', slots, ['default']);
    	let { theme = 'dark' } = $$props;
    	let { placement = 'bottom-right' } = $$props;
    	let { type = 'info' } = $$props;
    	let { showProgress = false } = $$props;
    	let { duration = 3000 } = $$props;
    	let { width = '320px' } = $$props;

    	/**
     * Default slot which is Toast component/template which will get toast data
     * @slot {{ data: ToastProps }}
     */
    	const placements = [
    		'bottom-right',
    		'bottom-left',
    		'top-right',
    		'top-left',
    		'top-center',
    		'bottom-center',
    		'center-center'
    	];

    	const flyMap = {
    		'bottom-right': 400,
    		'top-right': -400,
    		'bottom-left': 400,
    		'top-left': -400,
    		'bottom-center': 400,
    		'top-center': -400,
    		'center-center': -800
    	};

    	onMount(() => {
    		toasts.setDefaults({
    			placement,
    			showProgress,
    			theme,
    			duration,
    			type
    		});
    	});

    	const writable_props = ['theme', 'placement', 'type', 'showProgress', 'duration', 'width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastContainer> was created with unknown prop '${key}'`);
    	});

    	const func = (placement, n) => n.placement === placement;

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(5, theme = $$props.theme);
    		if ('placement' in $$props) $$invalidate(1, placement = $$props.placement);
    		if ('type' in $$props) $$invalidate(6, type = $$props.type);
    		if ('showProgress' in $$props) $$invalidate(7, showProgress = $$props.showProgress);
    		if ('duration' in $$props) $$invalidate(8, duration = $$props.duration);
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		fade,
    		onMount,
    		flip,
    		toasts,
    		theme,
    		placement,
    		type,
    		showProgress,
    		duration,
    		width,
    		placements,
    		flyMap,
    		$toasts
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(5, theme = $$props.theme);
    		if ('placement' in $$props) $$invalidate(1, placement = $$props.placement);
    		if ('type' in $$props) $$invalidate(6, type = $$props.type);
    		if ('showProgress' in $$props) $$invalidate(7, showProgress = $$props.showProgress);
    		if ('duration' in $$props) $$invalidate(8, duration = $$props.duration);
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		width,
    		placement,
    		$toasts,
    		placements,
    		flyMap,
    		theme,
    		type,
    		showProgress,
    		duration,
    		$$scope,
    		slots,
    		func
    	];
    }

    class ToastContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			theme: 5,
    			placement: 1,
    			type: 6,
    			showProgress: 7,
    			duration: 8,
    			width: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastContainer",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get theme() {
    		throw new Error("<ToastContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<ToastContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placement() {
    		throw new Error("<ToastContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placement(value) {
    		throw new Error("<ToastContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<ToastContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<ToastContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showProgress() {
    		throw new Error("<ToastContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showProgress(value) {
    		throw new Error("<ToastContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<ToastContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<ToastContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<ToastContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<ToastContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules\svelte-toasts\src\FlatToast.svelte generated by Svelte v3.59.2 */
    const file$2 = "node_modules\\svelte-toasts\\src\\FlatToast.svelte";
    const get_close_icon_slot_changes = dirty => ({});
    const get_close_icon_slot_context = ctx => ({});
    const get_extra_slot_changes = dirty => ({});
    const get_extra_slot_context = ctx => ({});
    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (92:4) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1\ts1,0.4,1,1S10.6,16,10,16z");
    			add_location(path0, file$2, 99, 9, 2536);
    			attr_dev(path1, "d", "M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z");
    			attr_dev(path1, "data-icon-path", "inner-path");
    			attr_dev(path1, "opacity", "0");
    			add_location(path1, file$2, 101, 10, 2692);
    			attr_dev(svg, "class", "st-toast-icon svelte-1iga0ni");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$2, 92, 6, 2355);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(92:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:36) 
    function create_if_block_4(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M13.5,14.5l-8-8l1-1l8,8L13.5,14.5z");
    			add_location(path0, file$2, 83, 9, 2087);
    			attr_dev(path1, "d", "M13.5,14.5l-8-8l1-1l8,8L13.5,14.5z");
    			attr_dev(path1, "data-icon-path", "inner-path");
    			attr_dev(path1, "opacity", "0");
    			add_location(path1, file$2, 85, 10, 2198);
    			attr_dev(svg, "class", "st-toast-icon svelte-1iga0ni");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$2, 76, 6, 1906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(76:36) ",
    		ctx
    	});

    	return block;
    }

    // (64:35) 
    function create_if_block_3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,5a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,7Zm4,17.12H12V21.88h2.88V15.12H13V12.88h4.13v9H20Z");
    			add_location(path, file$2, 71, 9, 1683);
    			attr_dev(svg, "class", "st-toast-icon svelte-1iga0ni");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$2, 64, 6, 1502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(64:35) ",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#if data.type === 'success'}
    function create_if_block_2(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M10,1c-4.9,0-9,4.1-9,9s4.1,9,9,9s9-4,9-9S15,1,10,1z M8.7,13.5l-3.2-3.2l1-1l2.2,2.2l4.8-4.8l1,1L8.7,13.5z");
    			add_location(path0, file$2, 53, 8, 1137);
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "d", "M8.7,13.5l-3.2-3.2l1-1l2.2,2.2l4.8-4.8l1,1L8.7,13.5z");
    			attr_dev(path1, "data-icon-path", "inner-path");
    			attr_dev(path1, "opacity", "0");
    			add_location(path1, file$2, 56, 8, 1281);
    			attr_dev(svg, "class", "st-toast-icon svelte-1iga0ni");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$2, 45, 6, 949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(45:4) {#if data.type === 'success'}",
    		ctx
    	});

    	return block;
    }

    // (44:20)      
    function fallback_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[1].type === 'success') return create_if_block_2;
    		if (/*data*/ ctx[1].type === 'info') return create_if_block_3;
    		if (/*data*/ ctx[1].type === 'error') return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(44:20)      ",
    		ctx
    	});

    	return block;
    }

    // (112:4) {#if data.title}
    function create_if_block_1(ctx) {
    	let h3;
    	let t_value = /*data*/ ctx[1].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(t_value);
    			attr_dev(h3, "class", "st-toast-title svelte-1iga0ni");
    			add_location(h3, file$2, 112, 6, 2956);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && t_value !== (t_value = /*data*/ ctx[1].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(112:4) {#if data.title}",
    		ctx
    	});

    	return block;
    }

    // (127:28)        
    function fallback_block(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z");
    			add_location(path, file$2, 135, 8, 3506);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "bx--toast-notification__close-icon svelte-1iga0ni");
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$2, 127, 6, 3297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(127:28)        ",
    		ctx
    	});

    	return block;
    }

    // (142:2) {#if data.showProgress}
    function create_if_block$1(ctx) {
    	let progress_1;

    	const block = {
    		c: function create() {
    			progress_1 = element("progress");
    			set_style(progress_1, "height", /*data*/ ctx[1].duration > 0 ? '4px' : 0);
    			progress_1.value = /*$progress*/ ctx[2];
    			attr_dev(progress_1, "class", "svelte-1iga0ni");
    			add_location(progress_1, file$2, 142, 4, 3701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, progress_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2) {
    				set_style(progress_1, "height", /*data*/ ctx[1].duration > 0 ? '4px' : 0);
    			}

    			if (dirty & /*$progress*/ 4) {
    				prop_dev(progress_1, "value", /*$progress*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(progress_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(142:2) {#if data.showProgress}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let t1;
    	let p;
    	let t2_value = /*data*/ ctx[1].description + "";
    	let t2;
    	let t3;
    	let div0;
    	let t4;
    	let button;
    	let t5;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[7].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[6], get_icon_slot_context);
    	const icon_slot_or_fallback = icon_slot || fallback_block_1(ctx);
    	let if_block0 = /*data*/ ctx[1].title && create_if_block_1(ctx);
    	const extra_slot_template = /*#slots*/ ctx[7].extra;
    	const extra_slot = create_slot(extra_slot_template, ctx, /*$$scope*/ ctx[6], get_extra_slot_context);
    	const close_icon_slot_template = /*#slots*/ ctx[7]["close-icon"];
    	const close_icon_slot = create_slot(close_icon_slot_template, ctx, /*$$scope*/ ctx[6], get_close_icon_slot_context);
    	const close_icon_slot_or_fallback = close_icon_slot || fallback_block(ctx);
    	let if_block1 = /*data*/ ctx[1].showProgress && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (icon_slot_or_fallback) icon_slot_or_fallback.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");
    			if (extra_slot) extra_slot.c();
    			t4 = space();
    			button = element("button");
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(p, "class", "st-toast-description svelte-1iga0ni");
    			add_location(p, file$2, 115, 4, 3016);
    			attr_dev(div0, "class", "st-toast-extra");
    			add_location(div0, file$2, 116, 4, 3075);
    			attr_dev(div1, "class", "st-toast-details svelte-1iga0ni");
    			add_location(div1, file$2, 110, 2, 2898);
    			attr_dev(button, "class", "st-toast-close-btn svelte-1iga0ni");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "aria-label", "close");
    			add_location(button, file$2, 120, 2, 3154);
    			attr_dev(div2, "class", div2_class_value = "st-toast flat " + (/*data*/ ctx[1].theme || /*theme*/ ctx[0]) + " " + (/*data*/ ctx[1].type || 'info') + " svelte-1iga0ni");
    			attr_dev(div2, "role", "alert");
    			attr_dev(div2, "aria-live", "assertive");
    			attr_dev(div2, "aria-atomic", "true");
    			add_location(div2, file$2, 36, 0, 730);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);

    			if (icon_slot_or_fallback) {
    				icon_slot_or_fallback.m(div2, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(p, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			if (extra_slot) {
    				extra_slot.m(div0, null);
    			}

    			append_dev(div2, t4);
    			append_dev(div2, button);

    			if (close_icon_slot_or_fallback) {
    				close_icon_slot_or_fallback.m(button, null);
    			}

    			append_dev(div2, t5);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*onRemove*/ ctx[4], false, false, false, false),
    					listen_dev(div2, "mouseup", /*onClick*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (icon_slot) {
    				if (icon_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[6], dirty, get_icon_slot_changes),
    						get_icon_slot_context
    					);
    				}
    			} else {
    				if (icon_slot_or_fallback && icon_slot_or_fallback.p && (!current || dirty & /*data*/ 2)) {
    					icon_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (/*data*/ ctx[1].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*data*/ 2) && t2_value !== (t2_value = /*data*/ ctx[1].description + "")) set_data_dev(t2, t2_value);

    			if (extra_slot) {
    				if (extra_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						extra_slot,
    						extra_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(extra_slot_template, /*$$scope*/ ctx[6], dirty, get_extra_slot_changes),
    						get_extra_slot_context
    					);
    				}
    			}

    			if (close_icon_slot) {
    				if (close_icon_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						close_icon_slot,
    						close_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(close_icon_slot_template, /*$$scope*/ ctx[6], dirty, get_close_icon_slot_changes),
    						get_close_icon_slot_context
    					);
    				}
    			}

    			if (/*data*/ ctx[1].showProgress) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*data, theme*/ 3 && div2_class_value !== (div2_class_value = "st-toast flat " + (/*data*/ ctx[1].theme || /*theme*/ ctx[0]) + " " + (/*data*/ ctx[1].type || 'info') + " svelte-1iga0ni")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot_or_fallback, local);
    			transition_in(extra_slot, local);
    			transition_in(close_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot_or_fallback, local);
    			transition_out(extra_slot, local);
    			transition_out(close_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (icon_slot_or_fallback) icon_slot_or_fallback.d(detaching);
    			if (if_block0) if_block0.d();
    			if (extra_slot) extra_slot.d(detaching);
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FlatToast', slots, ['icon','extra','close-icon']);
    	let { theme = 'light' } = $$props;
    	let { data = {} } = $$props;
    	const progress = tweened(1, { duration: data.duration, easing: identity });
    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(2, $progress = value));

    	onMount(() => {
    		progress.set(0, { duration: data.duration });
    	});

    	const onRemove = e => {
    		e.stopPropagation();
    		data.remove();
    		if (typeof data.onRemove === 'function') data.onRemove();
    	};

    	const onClick = () => {
    		if (typeof data.onClick === 'function') data.onClick();
    	};

    	const writable_props = ['theme', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FlatToast> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tweened,
    		linear: identity,
    		theme,
    		data,
    		progress,
    		onRemove,
    		onClick,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, data, $progress, progress, onRemove, onClick, $$scope, slots];
    }

    class FlatToast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { theme: 0, data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlatToast",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get theme() {
    		throw new Error("<FlatToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<FlatToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<FlatToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<FlatToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CommandList.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$1 = "src\\components\\CommandList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (72:8) {#each commands as command, i}
    function create_each_block(ctx) {
    	let command;
    	let updating_command;
    	let current;

    	function command_command_binding(value) {
    		/*command_command_binding*/ ctx[7](value, /*command*/ ctx[12], /*each_value*/ ctx[13], /*i*/ ctx[14]);
    	}

    	function remove_handler() {
    		return /*remove_handler*/ ctx[8](/*i*/ ctx[14]);
    	}

    	let command_props = {};

    	if (/*command*/ ctx[12] !== void 0) {
    		command_props.command = /*command*/ ctx[12];
    	}

    	command = new Command({ props: command_props, $$inline: true });
    	binding_callbacks.push(() => bind(command, 'command', command_command_binding));
    	command.$on("remove", remove_handler);

    	const block = {
    		c: function create() {
    			create_component(command.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(command, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const command_changes = {};

    			if (!updating_command && dirty & /*commands*/ 1) {
    				updating_command = true;
    				command_changes.command = /*command*/ ctx[12];
    				add_flush_callback(() => updating_command = false);
    			}

    			command.$set(command_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(command.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(command.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(command, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(72:8) {#each commands as command, i}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#if commands[0]}
    function create_if_block(ctx) {
    	let div;
    	let highlight;
    	let t0;
    	let button;
    	let icon;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	highlight = new Highlight$1({
    			props: {
    				language: json$1,
    				code: /*command_json*/ ctx[1]
    			},
    			$$inline: true
    		});

    	icon = new Icon({
    			props: { name: "copy", class: "btn-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(highlight.$$.fragment);
    			t0 = space();
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t1 = text("Copy");
    			attr_dev(button, "class", "copy-button svelte-7gsih");
    			add_location(button, file$1, 86, 12, 3234);
    			attr_dev(div, "class", "output-json-container svelte-7gsih");
    			add_location(div, file$1, 84, 8, 3122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(highlight, div, null);
    			append_dev(div, t0);
    			append_dev(div, button);
    			mount_component(icon, button, null);
    			append_dev(button, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*copyJSONToClipboard*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const highlight_changes = {};
    			if (dirty & /*command_json*/ 2) highlight_changes.code = /*command_json*/ ctx[1];
    			highlight.$set(highlight_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(highlight.$$.fragment, local);
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(highlight.$$.fragment, local);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(highlight);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(84:4) {#if commands[0]}",
    		ctx
    	});

    	return block;
    }

    // (92:4) <ToastContainer let:data={data}>
    function create_default_slot(ctx) {
    	let flattoast;
    	let current;

    	flattoast = new FlatToast({
    			props: { data: /*data*/ ctx[11] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(flattoast.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flattoast, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flattoast_changes = {};
    			if (dirty & /*data*/ 2048) flattoast_changes.data = /*data*/ ctx[11];
    			flattoast.$set(flattoast_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flattoast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flattoast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flattoast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(92:4) <ToastContainer let:data={data}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let button;
    	let icon;
    	let t1;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let t5;
    	let toastcontainer;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*commands*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	icon = new Icon({
    			props: { name: "add", class: "btn-icon" },
    			$$inline: true
    		});

    	let if_block = /*commands*/ ctx[0][0] && create_if_block(ctx);

    	toastcontainer = new ToastContainer({
    			props: {
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ data }) => ({ 11: data }),
    						({ data }) => data ? 2048 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t1 = text("\r\n            Add Command");
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			create_component(toastcontainer.$$.fragment);
    			attr_dev(div0, "class", "command-list");
    			add_location(div0, file$1, 70, 4, 2719);
    			attr_dev(button, "class", "svelte-7gsih");
    			add_location(button, file$1, 76, 8, 2930);
    			attr_dev(div1, "class", "button-bar");
    			add_location(div1, file$1, 75, 4, 2896);
    			add_location(br0, file$1, 81, 4, 3075);
    			add_location(br1, file$1, 82, 4, 3085);
    			attr_dev(div2, "class", "command-list-container svelte-7gsih");
    			add_location(div2, file$1, 69, 0, 2556);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			mount_component(icon, button, null);
    			append_dev(button, t1);
    			append_dev(div2, t2);
    			append_dev(div2, br0);
    			append_dev(div2, t3);
    			append_dev(div2, br1);
    			append_dev(div2, t4);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t5);
    			mount_component(toastcontainer, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*createCommand*/ ctx[3], false, false, false, false),
    					listen_dev(div2, "keyup", /*keyup_handler*/ ctx[9], false, false, false, false),
    					listen_dev(div2, "mouseup", /*mouseup_handler*/ ctx[10], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*commands, removeCommand*/ 5) {
    				each_value = /*commands*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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

    			if (/*commands*/ ctx[0][0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*commands*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t5);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const toastcontainer_changes = {};

    			if (dirty & /*$$scope, data*/ 34816) {
    				toastcontainer_changes.$$scope = { dirty, ctx };
    			}

    			toastcontainer.$set(toastcontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(icon.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(toastcontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(icon.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(toastcontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			destroy_component(icon);
    			if (if_block) if_block.d();
    			destroy_component(toastcontainer);
    			mounted = false;
    			run_all(dispose);
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

    function getCommands() {
    	alert("a");
    }

    function removeFalsy(object, copy) {
    	if (typeof object == "string") {
    		object = JSON.parse(object);
    	}

    	Object.entries(object).forEach(([k, v]) => {
    		if (v && typeof v === 'object' && copy) {
    			removeFalsy(v, true);
    		}

    		if (v && typeof v === 'object' && !Object.keys(v).length || v === false && k !== "dm_permission" || v === "" && k != "name" && k != "description" && k != "value" || v.name == "" && v.value == "" && copy || k == "type" && v == "1") {
    			// console.log(`${v.name} | ${v.value}`)
    			if (v[k] === "") {
    				delete object[k];
    				return;
    			}

    			if (Array.isArray(object)) {
    				object.splice(Number(k), 1);
    			} else {
    				delete object[k];
    			}
    		} // object[dm_permission] = dm_perms
    	});

    	return JSON.stringify(object, null, 4);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CommandList', slots, []);
    	let commands = [];

    	function removeCommand(index) {
    		commands.splice(index, 1);
    		$$invalidate(0, commands);
    	}

    	var command_json;

    	function createCommand() {
    		$$invalidate(0, commands = [
    			...commands,
    			{
    				name: "",
    				description: "",
    				dm_permission: false
    			}
    		]);

    		$$invalidate(1, command_json = JSON.stringify(commands, null, 4).replace("[", "").replace("]", "").replaceAll("    {", "{").replaceAll("    }", "}").replaceAll(`    "`, `"`));
    	}

    	function updateCommands() {
    		$$invalidate(1, command_json = JSON.stringify(commands, null, 4).replace("[", "").replaceAll("    {", "{").replaceAll("    }", "}").replaceAll(`    "`, `"`).split("\n").filter(l => l.trim() !== ""));
    		command_json.pop();
    		$$invalidate(1, command_json = command_json.join("\n").replace("    ]", "]"));
    	}

    	async function copyJSONToClipboard() {
    		navigator.clipboard.writeText(removeFalsy(command_json, true));

    		toasts.add({
    			title: 'Copied',
    			description: '',
    			duration: 1500,
    			placement: 'bottom-center',
    			theme: 'dark',
    			type: 'success',
    			onClick: () => {
    				
    			},
    			onRemove: () => {
    				
    			}
    		}); // component: BootstrapToast, // allows to override toast component/template per toast
    	}
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CommandList> was created with unknown prop '${key}'`);
    	});

    	function command_command_binding(value, command, each_value, i) {
    		each_value[i] = value;
    		$$invalidate(0, commands);
    	}

    	const remove_handler = i => {
    		removeCommand(i);
    	};

    	const keyup_handler = () => updateCommands();

    	const mouseup_handler = async () => {
    		await new Promise(f => setTimeout(f, 10));
    		updateCommands();
    	};

    	$$self.$capture_state = () => ({
    		getCommands,
    		Highlight: Highlight$1,
    		Command,
    		Icon,
    		json: json$1,
    		toasts,
    		ToastContainer,
    		FlatToast,
    		commands,
    		removeCommand,
    		command_json,
    		createCommand,
    		updateCommands,
    		copyJSONToClipboard,
    		removeFalsy
    	});

    	$$self.$inject_state = $$props => {
    		if ('commands' in $$props) $$invalidate(0, commands = $$props.commands);
    		if ('command_json' in $$props) $$invalidate(1, command_json = $$props.command_json);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		commands,
    		command_json,
    		removeCommand,
    		createCommand,
    		updateCommands,
    		copyJSONToClipboard,
    		getCommands,
    		command_command_binding,
    		remove_handler,
    		keyup_handler,
    		mouseup_handler
    	];
    }

    class CommandList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { getCommands: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CommandList",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get getCommands() {
    		return getCommands;
    	}

    	set getCommands(value) {
    		throw new Error("<CommandList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let centered;
    	let h1;
    	let t1;
    	let h3;
    	let t3;
    	let commandlist;
    	let current;
    	let mounted;
    	let dispose;
    	commandlist = new CommandList({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			centered = element("centered");
    			h1 = element("h1");
    			h1.textContent = "Slash Command Builder";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "* Are Required Fields";
    			t3 = space();
    			create_component(commandlist.$$.fragment);
    			attr_dev(h1, "class", "svelte-136ss2l");
    			add_location(h1, file, 13, 2, 527);
    			attr_dev(h3, "class", "svelte-136ss2l");
    			add_location(h3, file, 14, 2, 561);
    			attr_dev(centered, "class", "svelte-136ss2l");
    			add_location(centered, file, 12, 1, 513);
    			attr_dev(main, "class", "svelte-136ss2l");
    			add_location(main, file, 7, 0, 285);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, centered);
    			append_dev(centered, h1);
    			append_dev(centered, t1);
    			append_dev(centered, h3);
    			append_dev(main, t3);
    			mount_component(commandlist, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(main, "mousemove", /*mousemove_handler*/ ctx[0], false, false, false, false),
    					listen_dev(main, "keypress", /*keypress_handler*/ ctx[1], false, false, false, false),
    					listen_dev(main, "mouseup", /*mouseup_handler*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(commandlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(commandlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(commandlist);
    			mounted = false;
    			run_all(dispose);
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

    function updateIframe() {
    	const height = document.getElementsByClassName("command-list-container")[0].scrollHeight + 230;
    	window.parent.postMessage({ 'msg': height + "px" }, "*");
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const mousemove_handler = () => {
    		updateIframe();
    	};

    	const keypress_handler = async () => {
    		await new Promise(f => setTimeout(f, 10));
    		updateIframe();
    	};

    	const mouseup_handler = async () => {
    		await new Promise(f => setTimeout(f, 10));
    		updateIframe();
    	};

    	$$self.$capture_state = () => ({ CommandList, updateIframe });
    	return [mousemove_handler, keypress_handler, mouseup_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
